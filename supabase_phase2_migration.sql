-- AXIS'27 Campus Ambassador Portal — Phase 2 Schema Migration

-- ==========================================
-- 1. Tags system (replaces tasks.domain / tasks.is_initial_task)
-- ==========================================
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  label text not null,
  is_domain_tag boolean not null default true
);

create table if not exists task_tags (
  task_id uuid not null references tasks(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

-- Seed the 6 known tags
insert into tags (name, label, is_domain_tag) values
  ('initial', 'Initial', false),
  ('design', 'Design', true),
  ('digital_marketing', 'Digital Marketing', true),
  ('social_media_marketing', 'Social Media Marketing', true),
  ('event_management', 'Event Management', true),
  ('web_development', 'Web Development', true)
on conflict (name) do nothing;

-- Data backfill: map existing tasks to tags
do $$
declare
  t record;
  tag_id_uuid uuid;
begin
  for t in select id, domain, is_initial_task from tasks loop
    -- map domain
    if t.domain is not null then
      select id into tag_id_uuid from tags where name = t.domain;
      if tag_id_uuid is not null then
        insert into task_tags (task_id, tag_id) values (t.id, tag_id_uuid) on conflict do nothing;
      end if;
    end if;
    
    -- map initial task
    if t.is_initial_task = true then
      select id into tag_id_uuid from tags where name = 'initial';
      if tag_id_uuid is not null then
        insert into task_tags (task_id, tag_id) values (t.id, tag_id_uuid) on conflict do nothing;
      end if;
    end if;
  end loop;
end $$;

-- Drop old columns now that backfill is complete
alter table tasks drop column if exists domain;
alter table tasks drop column if exists is_initial_task;

-- Helper RPC to fetch the initial task for a specific domain
create or replace function get_initial_task_for_domain(domain_name text)
returns setof tasks as $$
begin
  return query
  select t.*
  from tasks t
  join task_tags tt1 on t.id = tt1.task_id
  join tags tag1 on tt1.tag_id = tag1.id and tag1.name = 'initial'
  join task_tags tt2 on t.id = tt2.task_id
  join tags tag2 on tt2.tag_id = tag2.id and tag2.name = domain_name
  limit 1;
end;
$$ language plpgsql security definer;

-- RPC to atomically submit the initial task
create or replace function submit_initial_task(
  p_domain_name text,
  p_task_id uuid,
  p_drive_link text
) returns void as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Update profile domain and status
  update profiles 
  set domain = p_domain_name, status = 'pending_review' 
  where id = v_user_id and status = 'domain_pending';

  if not found then
    raise exception 'Profile is not in domain_pending status';
  end if;

  -- 2. Create the submission
  insert into submissions (task_id, student_id, drive_link, status)
  values (p_task_id, v_user_id, p_drive_link, 'pending');
end;
$$ language plpgsql security definer;

-- ==========================================
-- 2. profiles — status expansion + referral + tiebreak
-- ==========================================
alter table profiles
  add column if not exists status text not null default 'incomplete_profile'
    check (status in ('incomplete_profile', 'domain_pending', 'pending_review', 'active')),
  add column if not exists domain text
    check (domain in ('design', 'digital_marketing', 'social_media_marketing', 'event_management', 'web_development')),
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references profiles(id),
  add column if not exists points_updated_at timestamptz not null default now();

-- Note: tier column might already exist. If so, Postgres 12+ requires dropping it to recreate as generated always, or just leave it.
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='tier') then
    alter table profiles add column tier text generated always as (
      case
        when total_points >= 1000 then 'platinum'
        when total_points >= 500  then 'gold'
        when total_points >= 200  then 'silver'
        else 'bronze'
      end
    ) stored;
  end if;
end $$;

-- CRITICAL: backfill existing active users
update profiles set status = 'active' where status = 'incomplete_profile' and created_at < now() - interval '1 hour';

-- Generate referral codes for active users who don't have one
update profiles set referral_code = substr(md5(random()::text), 1, 8) where referral_code is null;

-- ==========================================
-- 3. submissions — review flow + drive link + partial marks
-- ==========================================
alter table submissions
  add column if not exists drive_link text,
  add column if not exists points_awarded integer,
  add column if not exists reviewer_notes text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references profiles(id);

alter table submissions
  drop constraint if exists submissions_status_check,
  add constraint submissions_status_check
    check (status in ('pending', 'approved', 'rejected', 'needs_revision'));

-- backfill existing rows
update submissions set drive_link = '' where drive_link is null;
alter table submissions alter column drive_link set not null;
-- NOTE: I have removed the URL check constraint on drive_link because not all platforms may require Google Drive (users might use Dropbox, GitHub, etc.).

-- ==========================================
-- 4. submission_reviews — review history
-- ==========================================
create table if not exists submission_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  round_number integer not null,
  status text not null check (status in ('approved', 'rejected', 'needs_revision')),
  notes text,
  points_awarded integer,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz not null default now()
);

create index if not exists idx_submission_reviews_submission on submission_reviews (submission_id, round_number);

-- ==========================================
-- 5. notifications
-- ==========================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('new_task', 'new_announcement')),
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_profile_read on notifications (profile_id, read, created_at desc);

-- ==========================================
-- 6. Indexes
-- ==========================================
create index if not exists idx_profiles_leaderboard on profiles (total_points desc, points_updated_at asc) where status = 'active';
create index if not exists idx_profiles_status on profiles (status);
create index if not exists idx_submissions_status on submissions (status);
create index if not exists idx_submissions_task on submissions (task_id);

-- ==========================================
-- 7. submit_review RPC (Phase 4 & 5)
-- ==========================================
create or replace function submit_review(
  p_submission_id uuid,
  p_decision text,
  p_notes text,
  p_points_awarded integer,
  p_reviewed_by uuid
) returns void as $$
declare
  v_round_number integer;
  v_task_id uuid;
  v_student_id uuid;
  v_is_initial_task boolean;
  v_multiplier numeric;
  v_multiplier_expires_at timestamptz;
  v_final_points integer := 0;
  v_referrer_id uuid;
  v_old_status text;
  v_task_max_points integer;
begin
  -- Get current round number
  select coalesce(max(round_number), 0) + 1 into v_round_number
  from submission_reviews
  where submission_id = p_submission_id;

  -- Fetch task and student details
  select s.task_id, s.student_id, p.status, p.referred_by, t.multiplier, t.multiplier_expires_at, t.points
  into v_task_id, v_student_id, v_old_status, v_referrer_id, v_multiplier, v_multiplier_expires_at, v_task_max_points
  from submissions s
  join tasks t on s.task_id = t.id
  join profiles p on s.student_id = p.id
  where s.id = p_submission_id;

  -- Check if it's an initial task (has 'initial' tag)
  select exists (
    select 1 from task_tags tt
    join tags tg on tt.tag_id = tg.id
    where tt.task_id = v_task_id and tg.name = 'initial'
  ) into v_is_initial_task;

  -- Insert into review history
  insert into submission_reviews (submission_id, round_number, status, notes, points_awarded, reviewed_by)
  values (p_submission_id, v_round_number, p_decision, p_notes, p_points_awarded, p_reviewed_by);

  -- Determine status and handle logic
  if p_decision = 'approved' then
    if p_points_awarded < 0 or p_points_awarded > v_task_max_points then
      raise exception 'Points awarded must be between 0 and %', v_task_max_points;
    end if;

    if v_multiplier_expires_at is not null and now() < v_multiplier_expires_at then
      v_final_points := floor(p_points_awarded * v_multiplier);
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

    if v_is_initial_task and v_old_status = 'pending_review' then
      update profiles set status = 'active' where id = v_student_id;
      
      -- Referral bonus
      if v_referrer_id is not null then
        update profiles 
        set total_points = total_points + 100, 
            points_updated_at = now()
        where id = v_referrer_id;
      end if;
    end if;

  elsif p_decision = 'needs_revision' then
    update submissions
    set status = 'pending',
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

-- ==========================================
-- 8. Leaderboard RPCs (Phase 7)
-- ==========================================

create or replace function get_top_10()
returns table (
  id uuid,
  full_name text,
  total_points integer,
  tier text,
  rank bigint
) as $$
begin
  return query
  select 
    p.id, 
    p.full_name, 
    p.total_points, 
    p.tier,
    rank() over (order by p.total_points desc, p.points_updated_at asc) as rank
  from profiles p
  where p.status = 'active'
  order by p.total_points desc, p.points_updated_at asc
  limit 10;
end;
$$ language plpgsql security definer;

create or replace function get_my_rank(p_profile_id uuid)
returns table (
  id uuid,
  full_name text,
  total_points integer,
  tier text,
  rank bigint
) as $$
begin
  return query
  with ranked_profiles as (
    select 
      p.id, 
      p.full_name, 
      p.total_points, 
      p.tier,
      rank() over (order by p.total_points desc, p.points_updated_at asc) as rank
    from profiles p
    where p.status = 'active'
  )
  select * from ranked_profiles rp where rp.id = p_profile_id;
end;
$$ language plpgsql security definer;
