// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

export interface Locals {
  supabase: SupabaseClient<any, 'public', any>;
  getSession: () => Promise<Session | null>;
}

export const handle: Handle = async ({ event, resolve }) => {
  const cookie = event.request.headers.get('cookie') ?? '';

  // Create Supabase client scoped to this request with cookie
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
        headers: {
          cookie
        }
      }
    }
  );

  event.locals.supabase = supabase;

  event.locals.getSession = async (): Promise<Session | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  };

  return await resolve(event);
};
