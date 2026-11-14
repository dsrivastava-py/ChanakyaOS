import { getAiEnv, getPublicEnv } from "./env";

/**
 * Backwards compatible ENV object. Values are resolved lazily and validated,
 * so a missing variable throws a clear error instead of being `undefined`.
 */
export const ENV = {
  get SUPABASE_URL() {
    return getPublicEnv().NEXT_PUBLIC_SUPABASE_URL;
  },
  get SUPABASE_ANON_KEY() {
    return getPublicEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY;
  },
  get GEMINI_KEY() {
    return getAiEnv().GEMINI_API_KEY ?? "";
  },
  get GROQ_API_KEY() {
    return getAiEnv().GROQ_API_KEY;
  },
};
