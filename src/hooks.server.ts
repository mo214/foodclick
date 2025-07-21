// src/hooks.server.ts
import { createClient } from '@supabase/supabase-js';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
  // 1) Create a Supabase client that DOESN'T persist to localStorage
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false
    }
  });

  // 2) Read tokens that your client already set
  const accessToken = event.cookies.get('sb-access-token');
  const refreshToken = event.cookies.get('sb-refresh-token');

  // 3) If there’s an accessToken, hydrate the session on the server client
  if (accessToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || '' });
  }

  // 4) Attach to locals so your +page.server.ts can use it
  event.locals.supabase = supabase;
  event.locals.safeGetSession = async () => {
    // getSession() now reads the session we just set
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) return { session: null, user: null };

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) return { session: null, user: null };

    return { session, user };
  };

  // 5) Proceed, stripping Supabase’s internal headers from client responses
  return resolve(event, {
    filterSerializedResponseHeaders: (name) =>
      name === 'content-range' || name === 'x-supabase-api-version'
  });
};