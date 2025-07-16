// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
// Alias for clarity (still good practice for internal use in this file):
import type { Session as SupabaseSession, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Since App.Locals is fixed in app.d.ts, we no longer define AppSession or Locals here.
// We only need the types for internal use within this file.

export const handle: Handle = async ({ event, resolve }) => {
  // Validate environment variables
  if (!env.SUPABASE_URL?.trim()) {
    throw new Error('SUPABASE_URL is not set in environment variables');
  }
  if (!env.SUPABASE_ANON_KEY?.trim()) {
    throw new Error('SUPABASE_ANON_KEY is not set in environment variables');
  }

  // Supabase client configuration
  const options = {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
      flowType: 'pkce'
    },
    global: {
      headers: {
        cookie: event.request.headers.get('cookie') ?? '',
        'X-Request-Origin': 'sveltekit-server',
        'X-Forwarded-For': event.getClientAddress()
      }
    }
  };

  // Initialize Supabase client
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  // Attach Supabase client to locals
  event.locals.supabase = supabase;

  // Removed getSession method as per new requirements

  // Handle the request
  try {
    const response = await resolve(event, {
      filterSerializedResponseHeaders(name) {
        return name.toLowerCase().startsWith('x-supabase-');
      }
    });

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  } catch (error) {
    console.error('Request handling error:', error);
    throw error;
  }
};