-- Add locked_pathway_id and resume_url to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS locked_pathway_id UUID REFERENCES career_pathways(id),
ADD COLUMN IF NOT EXISTS resume_url TEXT;
