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

    if (error || !data.session) {
      return fail(400, { error: error?.message ?? 'Login failed' });
    }

    const user = data.user;

    if (!isAuthenticated(user)) {
      await locals.supabase.auth.signOut();
      return fail(403, { error: 'Email not verified. Please verify your email before logging in.' });
    }

    throw redirect(303, '/admin-dashboard');
  }
};
