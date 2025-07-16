// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

// If you have generated Database types from Supabase schema, import here:
// import type { Database } from '$lib/supabase'; 

export interface Locals {
  supabase: SupabaseClient<unknown, never, any>;
  getSession: () => Promise<Session | null>;
}

export const handle: Handle = async ({ event, resolve }) => {
  // Create Supabase client scoped to the current request
  const supabase = createClient<unknown, never, any>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );

  // Parse the auth cookie from the request
  const authCookie = event.request.headers.get('cookie') || '';

  // Create a Supabase client with the auth cookie to get the user session
  const supabaseWithCookie = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );

  // Get the user session from the cookie
  const { data: { user }, error } = await supabaseWithCookie.auth.getUser();

  // Assign supabase client to locals
  event.locals.supabase = supabase;

  // Helper to get session
  event.locals.getSession = async () => {
    return user ? { user } as Session : null;
  };

  // Handle the request and set auth cookie in the response if needed
  const response = await resolve(event);

  // Set auth cookie in response headers if needed (example, adjust as per your auth flow)
  // response.headers.set('set-cookie', 'your-cookie-string');

  return response;
};
