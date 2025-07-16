// src/hooks.server.ts
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
  // Create Supabase client with server-aware cookie/session handling
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: env.SUPABASE_URL,
    supabaseKey: env.SUPABASE_ANON_KEY,
    event
  });

  // Continue processing the request
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
