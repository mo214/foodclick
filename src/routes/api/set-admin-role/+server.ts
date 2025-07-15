import { json, error as svelteKitError } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session) throw svelteKitError(401, 'Unauthorized');

  // Only allow users who are already master_admin
  const userRole = session.user.app_metadata?.role;
  if (userRole !== 'master_admin') {
    throw svelteKitError(403, 'Forbidden: Only master_admin can assign roles.');
  }

  const { userId } = await request.json();
  if (!userId) throw svelteKitError(400, 'User ID is required');

  const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'master_admin' }
  });

  if (error) {
    console.error('Role assignment error:', error.message);
    throw svelteKitError(500, error.message);
  }

  return json({ message: 'User role updated successfully', user: data.user });
};
