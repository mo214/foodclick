import { redirect, error as svelteKitError } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import type { User } from '@supabase/supabase-js';

export const load: ServerLoad = async ({ locals }) => {
  const user = locals.user;
  console.log('Load function started');
  console.log('User from locals:', user);

  if (!user) {
    console.log('Redirecting: user not found');
    throw redirect(303, '/login');
  }

  interface ExtendedUser extends User {
    raw_user_meta_data?: {
      is_super_admin?: boolean;
      [key: string]: any;
    };
  }

  const extendedUser = user as ExtendedUser;
  console.log('Extended user raw_user_meta_data:', extendedUser.raw_user_meta_data);

  const isSuperAdmin = extendedUser.raw_user_meta_data?.is_super_admin === true;
  console.log('isSuperAdmin:', isSuperAdmin);

  if (!isSuperAdmin) {
    console.log('Forbidden: Not a super admin', user);
    throw svelteKitError(403, 'Forbidden: You do not have access to this page.');
  }

  const { data: restaurants, error: restaurantsError } = await locals.supabase
    .from('dummy_restaurant')
    .select('*')
    .order('created_at', { ascending: false });

  if (restaurantsError) {
    console.error('Error loading restaurants:', restaurantsError.message);
    throw svelteKitError(500, 'Failed to load restaurants');
  }

  console.log('Restaurants loaded:', restaurants);

  return {
    user,
    restaurants: restaurants ?? [],
    isSuperAdmin: true
  };
};
