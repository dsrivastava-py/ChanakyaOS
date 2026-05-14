-- Ensure only one locked pathway per user
-- We use a unique partial index to allow multiple 'active' pathways but only one 'locked' one.
CREATE UNIQUE INDEX IF NOT EXISTS career_pathways_user_locked_idx 
ON career_pathways (user_id) 
WHERE (status = 'locked');

-- Optional: Ensure user_profiles has a unique user_id (already primary key, but good to double check)
-- ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
