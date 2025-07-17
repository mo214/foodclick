import { redirect, error as svelteKitError } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    console.log('Redirecting: user not found');
    throw redirect(303, '/login');
  }

  const isSuperAdmin = user.user_metadata?.is_super_admin === true;

  if (!isSuperAdmin) {
    console.log('Forbidden: Not a super admin', user.user_metadata);
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

  return {
    user,
    restaurants: restaurants ?? [],
    isSuperAdmin: true
  };
};
