import { redirect, error as svelteKitError } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }: Parameters<ServerLoad>[0]) => {
  const { data: { user }, error } = await locals.supabase.auth.getUser();

  if (error || !user) {
    console.log('Redirecting to /login because user is missing or error occurred');
    throw redirect(303, '/login');
  }

  if (!user.user_metadata?.is_super_admin) {
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
    isMasterAdmin: true
  };
};
