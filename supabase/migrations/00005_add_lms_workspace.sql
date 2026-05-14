-- Add lms_workspace JSONB column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS lms_workspace JSONB DEFAULT '{"tasks": [], "customColumns": [{"id": "title", "header": "Title", "type": "text"}, {"id": "status", "header": "Status", "type": "tag"}, {"id": "dueDate", "header": "Due Date", "type": "date"}]}'::jsonb;
