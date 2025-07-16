import type { Handle } from '@sveltejs/kit';
import { createClient, type Session } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

export interface Locals {
  supabase: ReturnType<typeof createClient>;
  getSession: () => Promise<Session | null>;
}

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        // ✅ This is the key — use the cookie from the request
      
      }
    }
  );

  // Attach the Supabase client to locals
  event.locals.supabase = supabase;

  // Provide a helper for getting the session
  event.locals.getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    return data.session;
  };

  return await resolve(event);
};
