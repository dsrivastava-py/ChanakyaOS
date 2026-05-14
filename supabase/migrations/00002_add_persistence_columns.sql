-- Add pinned_trends and lms_tasks to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS pinned_trends JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lms_tasks JSONB DEFAULT '[]'::jsonb;
