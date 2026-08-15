-- Update domain constraints in profiles and tasks tables

-- 1. Drop existing constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_domain_check;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_domain_check;

-- 2. Add new constraints with the updated domains
ALTER TABLE public.profiles ADD CONSTRAINT profiles_domain_check 
CHECK (domain IN ('design', 'digital_marketing', 'social_media_marketing', 'event_management', 'web_development'));

ALTER TABLE public.tasks ADD CONSTRAINT tasks_domain_check 
CHECK (domain IN ('design', 'digital_marketing', 'social_media_marketing', 'event_management', 'web_development'));
