import { fail, redirect, type Actions } from '@sveltejs/kit';
import { isAuthenticated } from '$lib/auth';

export const actions: Actions = {
  default: async ({ request, locals }: { request: Request; locals: any }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString() ?? '';
    const password = formData.get('password')?.toString() ?? '';

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required' });
    }

    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    // See the session and user data from Supabase after login
    console.log('Supabase login response:', { data, error });

    if (error || !data.session) {
      return fail(400, { error: error?.message ?? 'Login failed' });
    }

    const user = data.user;

    if (!isAuthenticated(user)) {
      await locals.supabase.auth.signOut();
      return fail(403, { error: 'Email not verified. Please verify your email before logging in.' });
    }

    // Check master_admins table for user metadata
    const { data: adminData, error: adminError } = await locals.supabase
      .from('master_admins')
      .select('raw_user_meta_data')
      .eq('id', user.id)
      .single();

    if (adminError || !adminData) {
      await locals.supabase.auth.signOut();
      return fail(403, { error: 'Access denied. Admin privileges required.' });
    }

    const meta = adminData.raw_user_meta_data || {};

    if (meta.email_verified !== true || meta.is_super_admin !== true) {
      await locals.supabase.auth.signOut();
      return fail(403, { error: 'Access denied. Admin privileges required.' });
    }

    throw redirect(303, '/admin-dashboard'); // fixed path
  }
};
