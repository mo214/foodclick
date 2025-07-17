import type { User } from '@supabase/supabase-js';

export interface ExtendedUser extends User {
  raw_user_meta_data?: {
    email_verified?: boolean;
    is_super_admin?: boolean;
    [key: string]: any;
  };
}

/**
 * Checks if the user is authenticated by verifying email_verified flag.
 * @param user The user object, possibly extended with raw_user_meta_data.
 * @returns true if email is verified, false otherwise.
 */
export function isAuthenticated(user: User | null | undefined): boolean {
  if (!user) return false;
  const extendedUser = user as ExtendedUser;
  return extendedUser.raw_user_meta_data?.email_verified === true;
}

/**
 * Checks if the user is a super admin.
 * @param user The user object, possibly extended with raw_user_meta_data.
 * @returns true if user is super admin, false otherwise.
 */
export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  const extendedUser = user as ExtendedUser;
  return extendedUser.raw_user_meta_data?.is_super_admin === true;
}
