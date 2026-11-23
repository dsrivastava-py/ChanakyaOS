-- 00010: Opt-in public portfolio sharing (PRD F8). Additive only.
--
-- Users choose a username and flip is_public (default false). Anonymous visitors
-- never read tables directly (RLS stays owner-only). They call
-- public.get_public_portfolio(username), a SECURITY DEFINER function that returns
-- a fixed allow-list of fields and NULL for unknown or private users.
-- It never returns email, plan, ids, embeddings or LMS data.
--
-- This migration must be applied by the project owner (SQL editor or supabase db push).

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_format'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_username_format
      CHECK (username IS NULL OR username ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$');
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_key
  ON public.users (lower(username)) WHERE username IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_public_portfolio(p_username text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user public.users%ROWTYPE;
  v_profile public.user_profiles%ROWTYPE;
  v_data jsonb;
  v_title text;
BEGIN
  IF p_username IS NULL OR length(p_username) > 30 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_user FROM public.users
   WHERE lower(username) = lower(p_username) AND is_public = true
   LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_profile FROM public.user_profiles WHERE user_id = v_user.id;

  SELECT cp.pathway_data INTO v_data FROM public.career_pathways cp
   WHERE cp.user_id = v_user.id AND cp.status = 'locked'
   ORDER BY cp.generated_at DESC
   LIMIT 1;

  v_title := CASE WHEN jsonb_typeof(v_data -> 'title') = 'string' THEN v_data ->> 'title' END;

  RETURN jsonb_build_object(
    'name', v_user.name,
    'username', v_user.username,
    'skills', CASE WHEN jsonb_typeof(v_profile.skills) = 'array' THEN v_profile.skills ELSE '[]'::jsonb END,
    'projects', CASE WHEN jsonb_typeof(v_profile.projects) = 'array' THEN v_profile.projects ELSE '[]'::jsonb END,
    'certifications', CASE WHEN jsonb_typeof(v_profile.certifications) = 'array' THEN v_profile.certifications ELSE '[]'::jsonb END,
    'current_education', v_profile.current_education,
    'pathway', CASE WHEN v_data IS NULL THEN NULL ELSE jsonb_build_object(
      'title', v_title,
      'projects', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
                 'title', p ->> 'title',
                 'description', p ->> 'description',
                 'techStack', CASE WHEN jsonb_typeof(p -> 'techStack') = 'array' THEN p -> 'techStack' ELSE '[]'::jsonb END))
          FROM jsonb_array_elements(CASE WHEN jsonb_typeof(v_data -> 'projects') = 'array' THEN v_data -> 'projects' ELSE '[]'::jsonb END) p
         WHERE jsonb_typeof(p) = 'object' AND p -> 'completed' = 'true'::jsonb
      ), '[]'::jsonb),
      'requirements', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('name', r ->> 'name', 'provider', r ->> 'provider'))
          FROM jsonb_array_elements(CASE WHEN jsonb_typeof(v_data -> 'requirements') = 'array' THEN v_data -> 'requirements' ELSE '[]'::jsonb END) r
         WHERE jsonb_typeof(r) = 'object' AND r -> 'completed' = 'true'::jsonb
      ), '[]'::jsonb),
      'skills', COALESCE((
        SELECT jsonb_agg(s ->> 'skill')
          FROM jsonb_array_elements(CASE WHEN jsonb_typeof(v_data -> 'skillChecklist') = 'array' THEN v_data -> 'skillChecklist' ELSE '[]'::jsonb END) s
         WHERE jsonb_typeof(s) = 'object' AND s ->> 'status' = 'acquired' AND s ->> 'skill' IS NOT NULL
      ), '[]'::jsonb)
    ) END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_portfolio(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_portfolio(text) TO anon, authenticated;
