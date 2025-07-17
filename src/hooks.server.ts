import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	const supabase = createSupabaseServerClient({
		supabaseUrl: env.SUPABASE_URL,
		supabaseKey: env.SUPABASE_ANON_KEY,
		event
	});

	event.locals.supabase = supabase;

	const {
		data: { session },
		error
	} = await supabase.auth.getSession();

	if (error) console.error('HOOK session error:', error);

	// Ensure session and user are set correctly for all requests
	event.locals.session = session ?? null;
	event.locals.user = session?.user ?? null;

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name.toLowerCase().startsWith('x-supabase-');
		}
	});
};
