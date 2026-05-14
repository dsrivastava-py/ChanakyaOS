-- Add lms_data and gamification fields to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS lms_data JSONB DEFAULT '{"stages": [], "active_certs": [], "active_projects": [], "mastered_skills": [], "curriculum_tracker": {}}'::jsonb;

-- Add updated_at to user_profiles if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;
