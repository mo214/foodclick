import type { User } from '@supabase/supabase-js';

export interface ExtendedUser extends User {
  raw_user_meta_data?: {
    is_super_admin?: boolean;
    [key: string]: any;
  };
}

/**
 * Checks if the given user is a super admin.
 * @param user The user object, possibly extended with raw_user_meta_data.
 * @returns true if user is super admin, false otherwise.
 */
export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  const extendedUser = user as ExtendedUser;
  return extendedUser.raw_user_meta_data?.is_super_admin === true;
}
