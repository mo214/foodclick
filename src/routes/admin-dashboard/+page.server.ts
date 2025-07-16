import { redirect, error as svelteKitError } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }: Parameters<ServerLoad>[0]) => {
  const session = await locals.getSession();

  if (!session || !session.user) {
    console.log('Redirecting to /login because session or user is missing');
    throw redirect(303,'/login');
  }

  if (!session.user.user_metadata?.is_super_admin) {
    throw svelteKitError(403, 'Forbidden: You do not have access to this page.');
  }

  const { data: restaurants, error } = await locals.supabase
    .from('dummy_restaurant')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading restaurants:', error.message);
    throw svelteKitError(500, 'Failed to load restaurants');
  }

  return {
    user: session.user,
    restaurants: restaurants ?? [],
    isMasterAdmin: true
  };
};
