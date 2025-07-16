// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import type { Session, SupabaseClientOptions } from '@supabase/supabase-js';

// Type definitions
export interface Locals {
  supabase: ReturnType<typeof createClient>;
  getSession: () => Promise<Session | null>;
}

export const handle: Handle = async ({ event, resolve }) => {
  // Validate environment variables
  if (!env.SUPABASE_URL) throw new Error('SUPABASE_URL is not set');
  if (!env.SUPABASE_ANON_KEY) throw new Error('SUPABASE_ANON_KEY is not set');

  // Supabase client configuration
  const options: SupabaseClientOptions = {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
      // storage: customStorage, // Add if you need custom session storage
    },
    global: {
      headers: {
        // Forward cookies for server-side authentication
        cookie: event.request.headers.get('cookie') ?? '',
        // Add other headers you need
        'X-Request-Origin': 'sveltekit-server'
      }
    }
  };

  // Initialize Supabase client
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, options);

  // Attach Supabase client to locals
  event.locals.supabase = supabase;

  // Session helper with error handling
  event.locals.getSession = async (): Promise<Session | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  };

  // Handle the request
  try {
    return await resolve(event, {
      // Optional SSR transforms can go here
      filterSerializedResponseHeaders(name) {
        return name.toLowerCase().startsWith('x-supabase-');
      }
    });
  } catch (error) {
    console.error('Request handling error:', error);
    throw error;
  }
};