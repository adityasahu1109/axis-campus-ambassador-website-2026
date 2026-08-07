-- AXIS'27 Feature Implementation Schema Migration

-- ==========================================
-- 1. Profiles modifications
-- ==========================================

-- Rename points to total_points if it exists (ignoring error if already renamed)
do $$
begin
  if exists (select 1 from information_schema.columns where table_name='profiles' and column_name='points') then
    alter table profiles rename column points to total_points;
  end if;
end $$;

alter table profiles
  add column status text not null default 'incomplete_profile'
    check (status in ('incomplete_profile', 'domain_pending', 'pending_review', 'active')),
  add column domain text
    check (domain in ('management_design', 'software_electronics', 'robotics', 'convergence')),
  add column referral_code text unique,
  add column referred_by uuid references profiles(id),
  add column points_updated_at timestamptz not null default now(),
  add column tier text generated always as (
    case
      when total_points >= 1000 then 'platinum'
      when total_points >= 500  then 'gold'
      when total_points >= 200  then 'silver'
      else 'bronze'
    end
  ) stored,
  add column phone_number text,
  add column college text,
  add column year_of_study text,
  add column city text;

-- migration-safety: backfill existing users so they aren't retroactively locked into onboarding
update profiles set status = 'active' where status = 'incomplete_profile';

-- Generate referral codes for existing users
update profiles set referral_code = substr(md5(random()::text), 1, 8) where referral_code is null;

-- ==========================================
-- 2. Tasks modifications
-- ==========================================
alter table tasks
  add column is_initial_task boolean not null default false,
  add column domain text
    check (domain in ('management_design', 'software_electronics', 'robotics', 'convergence')),
  add column category text,
  add column deadline timestamptz,
  add column multiplier numeric not null default 1,
  add column multiplier_expires_at timestamptz;

-- ==========================================
-- 3. Submissions modifications
-- ==========================================
alter table submissions
  add column drive_link text,
  add column points_awarded integer,
  add column reviewer_notes text,
  add column reviewed_at timestamptz,
  add column reviewed_by uuid references profiles(id);

-- Step 1: Drop old constraint first
alter table submissions
  drop constraint if exists submissions_status_check;

-- Step 2: Convert existing status values to lowercase BEFORE adding new constraint
update submissions set status = lower(status);

-- Step 3: Now add the new constraint (all rows are already lowercase)
alter table submissions
  add constraint submissions_status_check
    check (status in ('pending', 'approved', 'rejected', 'needs_revision'));

-- update existing drive links to placeholder if needed before enforcing not null
update submissions set drive_link = 'https://drive.google.com/placeholder' where drive_link is null;
alter table submissions alter column drive_link set not null;

alter table submissions
  add constraint drive_link_format check (drive_link like 'https://drive.google.com%');

-- ==========================================
-- 4. New Tables
-- ==========================================

create table submission_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id bigint not null references submissions(id) on delete cascade,
  round_number integer not null,
  status text not null check (status in ('approved', 'rejected', 'needs_revision')),
  notes text,
  points_awarded integer,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz not null default now()
);

create index idx_submission_reviews_submission on submission_reviews (submission_id, round_number);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('new_task', 'new_announcement', 'referral_bonus')),
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 5. Indexes
-- ==========================================
create index idx_profiles_leaderboard on profiles (total_points desc, points_updated_at asc) where status = 'active';
create index idx_profiles_status on profiles (status);
create index idx_submissions_status on submissions (status);
create index idx_submissions_task on submissions (task_id);
create index idx_notifications_profile_read on notifications (profile_id, read, created_at desc);

-- ==========================================
-- 6. Trigger: Referral Bonus
-- ==========================================
create or replace function handle_referral_bonus()
returns trigger as $$
begin
  if new.status = 'active' and old.status != 'active' and new.referred_by is not null then
    update profiles
    set total_points = total_points + 100,
        points_updated_at = now()
    where id = new.referred_by;

    insert into notifications (profile_id, type, message, link)
    values (new.referred_by, 'referral_bonus', '+100 points — your referral became an ambassador!', '/dashboard');
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_referral_bonus on profiles;
create trigger trigger_referral_bonus
after update of status on profiles
for each row
execute function handle_referral_bonus();

-- ==========================================
-- 7. Trigger: Announcement Notifications
-- ==========================================
create or replace function notify_active_students_of_announcement()
returns trigger as $$
begin
  insert into notifications (profile_id, type, message, link)
  select id, 'new_announcement', 'New Announcement: ' || new.title, '/announcements'
  from profiles where status = 'active';
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_new_announcement on announcements;
create trigger trigger_new_announcement
after insert on announcements
for each row
execute function notify_active_students_of_announcement();

-- ==========================================
-- 8. Trigger: Task Notifications
-- ==========================================
create or replace function notify_active_students_of_task()
returns trigger as $$
begin
  -- Notify everyone if no domain, else notify domain-specific active students
  insert into notifications (profile_id, type, message, link)
  select id, 'new_task', 'New Task: ' || new.title, '/dashboard'
  from profiles 
  where status = 'active' 
    and (new.domain is null or domain = new.domain);
    
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_new_task on tasks;
create trigger trigger_new_task
after insert on tasks
for each row
execute function notify_active_students_of_task();

-- ==========================================
-- 9. RPCs
-- ==========================================

-- submit_review
create or replace function submit_review(
  p_submission_id bigint,
  p_decision text,
  p_notes text,
  p_points_awarded integer,
  p_reviewed_by uuid
)
returns void as $$
declare
  v_round_number integer;
  v_task_id bigint;
  v_student_id uuid;
  v_is_initial_task boolean;
  v_multiplier numeric;
  v_multiplier_expires_at timestamptz;
  v_final_points integer := 0;
begin
  -- Get current round number
  select coalesce(max(round_number), 0) + 1 into v_round_number
  from submission_reviews
  where submission_id = p_submission_id;

  -- Insert into review history
  insert into submission_reviews (submission_id, round_number, status, notes, points_awarded, reviewed_by)
  values (p_submission_id, v_round_number, p_decision, p_notes, p_points_awarded, p_reviewed_by);

  -- Fetch task and student details
  select s.task_id, s.student_id, t.is_initial_task, t.multiplier, t.multiplier_expires_at
  into v_task_id, v_student_id, v_is_initial_task, v_multiplier, v_multiplier_expires_at
  from submissions s
  join tasks t on s.task_id = t.id
  where s.id = p_submission_id;

  -- Determine status and handle logic
  if p_decision = 'approved' then
    if v_multiplier_expires_at is not null and now() < v_multiplier_expires_at then
      v_final_points := p_points_awarded * v_multiplier;
    else
      v_final_points := p_points_awarded;
    end if;

    update submissions
    set status = 'approved',
        points_awarded = v_final_points,
        reviewer_notes = p_notes,
        reviewed_at = now(),
        reviewed_by = p_reviewed_by
    where id = p_submission_id;

    update profiles
    set total_points = total_points + v_final_points,
        points_updated_at = now()
    where id = v_student_id;

    if v_is_initial_task then
      update profiles set status = 'active' where id = v_student_id;
    end if;

  elsif p_decision = 'needs_revision' then
    update submissions
    set status = 'needs_revision',
        reviewer_notes = p_notes,
        reviewed_at = now(),
        reviewed_by = p_reviewed_by
    where id = p_submission_id;
  
  elsif p_decision = 'rejected' then
    update submissions
    set status = 'rejected',
        reviewer_notes = p_notes,
        reviewed_at = now(),
        reviewed_by = p_reviewed_by
    where id = p_submission_id;
  end if;
end;
$$ language plpgsql security definer;

-- bulk_review_submissions
create or replace function bulk_review_submissions(
  p_submission_ids bigint[],
  p_decision text,
  p_notes text,
  p_reviewed_by uuid
)
returns void as $$
declare
  v_sub_id bigint;
  v_max_points integer;
begin
  foreach v_sub_id in array p_submission_ids
  loop
    select t.points into v_max_points
    from submissions s join tasks t on s.task_id = t.id
    where s.id = v_sub_id;
    
    perform submit_review(v_sub_id, p_decision, p_notes, v_max_points, p_reviewed_by);
  end loop;
end;
$$ language plpgsql security definer;

-- get_top_10
create or replace function get_top_10()
returns table(
  id uuid,
  full_name text,
  college text,
  total_points integer,
  tier text,
  rank bigint
) as $$
begin
  return query
  select 
    p.id, p.full_name, p.college, p.total_points, p.tier,
    row_number() over (order by p.total_points desc, p.points_updated_at asc) as rank
  from profiles p
  where p.status = 'active'
  order by p.total_points desc, p.points_updated_at asc
  limit 10;
end;
$$ language plpgsql security definer;

-- get_my_rank
create or replace function get_my_rank(p_user_id uuid)
returns table(
  id uuid,
  full_name text,
  college text,
  total_points integer,
  tier text,
  rank bigint
) as $$
begin
  return query
  with ranked_profiles as (
    select 
      p.id, p.full_name, p.college, p.total_points, p.tier,
      row_number() over (order by p.total_points desc, p.points_updated_at asc) as rank
    from profiles p
    where p.status = 'active'
  )
  select * from ranked_profiles rp where rp.id = p_user_id;
end;
$$ language plpgsql security definer;
