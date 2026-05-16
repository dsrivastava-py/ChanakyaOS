import { User } from '@supabase/supabase-js';

export const parseUserName = (user: User | null): string => {
  if (!user) return "Guest User";

  // 1. Check if user.user_metadata?.full_name exists (Google Auth name)
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }

  // 2. If it does not exist (Email Auth), take user.email, split it at the '@' symbol
  if (user.email) {
    return user.email.split('@')[0];
  }

  // 3. If neither exists, return "Guest User"
  return "Guest User";
};
