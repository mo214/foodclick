// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
// Alias for clarity:
import type { Session as SupabaseSession, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// --- Start of Corrected Changes ---

// 1. Define your custom AppSession interface
// This represents the shape of the object you want event.locals.getSession to return.
export interface AppSession {
  // The 'session' property will hold the original Supabase Session object, or null.
  session: SupabaseSession | null;
  // The 'user' property will hold the Supabase User object, or null.
  user: SupabaseUser | null;
}

// 2. Update your Locals interface to use AppSession for getSession's return type
export interface Locals {
  supabase: SupabaseClient;
  // This is the key change:
  getSession: () => Promise<AppSession | null>; // <--- Use AppSession here!
}

// --- End of Corrected Changes ---


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
      persistSession: true,
      detectSessionInUrl: false,
      autoRefreshToken: true,
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
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, options);

  // Attach Supabase client to locals
  event.locals.supabase = supabase;

  // --- Corrected getSession definition ---
  // The type annotation for the function matches the Locals interface
  event.locals.getSession = async (): Promise<AppSession | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      // Construct and return the AppSession object
      return {
        session: session, // This will be SupabaseSession | null
        user: session?.user ?? null // This will be SupabaseUser | null
      };
    } catch (error) {
      console.error('Error getting safe session:', error);
      // On error, return an AppSession where both properties are null
      return {
        session: null,
        user: null
      };
    }
  };

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