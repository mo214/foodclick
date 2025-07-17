// src/hooks.server.ts
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
  // Create Supabase client
  const supabase = createSupabaseServerClient({
    supabaseUrl: env.SUPABASE_URL,
    supabaseKey: env.SUPABASE_ANON_KEY,
    event
  });

  // Attach supabase to event.locals
  event.locals.supabase = supabase;

  // Fetch session and user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Optional: attach session and user to locals
  event.locals.session = session;
  event.locals.user = session?.user ?? null;

  // Proceed with request
  const response = await resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name.toLowerCase().startsWith('x-supabase-');
    }
  });

  // Add extra security headers (optional)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
};
