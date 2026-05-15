-- Add resume_schema column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS resume_schema JSONB DEFAULT NULL;

-- Enable RLS (should already be enabled, but ensuring it)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Update existing policies to include resume_schema in SELECT if needed
-- The existing policies should already handle this since it's a simple JSONB column