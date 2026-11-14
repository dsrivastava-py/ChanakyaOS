-- 00009: RLS and data hardening (fixes only, does not edit earlier migrations)

-- 1. Prevent privilege escalation on users.plan / users.id.
--    The "Users can update their own record" policy (00001) has no WITH CHECK
--    and no column restriction, so a client could set plan = 'pro'.
CREATE OR REPLACE FUNCTION public.protect_user_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.plan IS DISTINCT FROM OLD.plan THEN
      RAISE EXCEPTION 'plan and id can only be changed by the service role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_user_privileged_columns ON public.users;
CREATE TRIGGER protect_user_privileged_columns
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_privileged_columns();

-- 2. UPDATE policies: add WITH CHECK so rows cannot be reassigned to another user.
DROP POLICY IF EXISTS "Users can update their own record" ON users;
CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pathways" ON career_pathways;
CREATE POLICY "Users can update their own pathways" ON career_pathways
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own resumes" ON resumes;
CREATE POLICY "Users can update their own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Let users delete their own generated history (data ownership).
DROP POLICY IF EXISTS "Users can delete their own diagnoses" ON ai_diagnoses;
CREATE POLICY "Users can delete their own diagnoses" ON ai_diagnoses
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;
CREATE POLICY "Users can delete their own messages" ON chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create the public.users row automatically on signup. career_pathways,
--    user_profiles etc. reference users(id), and no earlier migration creates it.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill users that signed up before this trigger existed.
INSERT INTO public.users (id, email, name)
SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')
FROM auth.users au
WHERE au.email IS NOT NULL
ON CONFLICT DO NOTHING;

-- 5. contact_messages (00007) allows anonymous inserts with no bounds.
--    NOT VALID keeps existing rows untouched while enforcing limits on new ones.
ALTER TABLE contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_length_check;
ALTER TABLE contact_messages
  ADD CONSTRAINT contact_messages_length_check
  CHECK (char_length(name) <= 200 AND char_length(email) <= 320 AND char_length(message) <= 5000)
  NOT VALID;

-- 6. Make the service-role-only read explicit and deny anon/authenticated writes beyond INSERT.
REVOKE UPDATE, DELETE ON contact_messages FROM anon, authenticated;
