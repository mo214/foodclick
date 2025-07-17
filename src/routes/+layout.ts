import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { env } from '$env/dynamic/private';

export const load = async ({ data, depends, fetch }: { data: any; depends: any; fetch: any }) => {
  /**
   * Declare a dependency so the layout can be invalidated, for example, on
   * session refresh.
   */
  depends('supabase:auth');

  const supabase = isBrowser()
    ? createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
      })
    : createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
        cookies: {
          getAll() {
            return data.cookies;
          },
        },
      });

  /**
   * It's fine to use `getSession` here, because on the client, `getSession` is
   * safe, and on the server, it reads `session` from the `LayoutData`, which
   * safely checked the session using `safeGetSession`.
   */
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { session, supabase, user };
};
