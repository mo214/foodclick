import type { User } from '@supabase/supabase-js';

export interface ExtendedUser extends User {
  raw_app_meta_data?: {
    role?: string;
    [key: string]: any;
  };
}

/**
 * Checks if the user is authenticated by verifying email_verified flag.
 * @param user The user object, possibly extended with raw_app_meta_data.
 * @returns true if email is verified, false otherwise.
 */
export function isAuthenticated(user: User | null | undefined): boolean {
  if (!user) return false;
  const extendedUser = user as ExtendedUser;
  // Adjusted to check user_metadata instead of raw_user_meta_data
  return (extendedUser.user_metadata?.email_verified === true) || false;
}

/**
 * Checks if the user is a super admin by checking role in raw_app_meta_data.
 * @param user The user object, possibly extended with raw_app_meta_data.
 * @returns true if user role is master_admin, false otherwise.
 */
export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  const extendedUser = user as ExtendedUser;
  return extendedUser.raw_app_meta_data?.role === 'master_admin';
}
