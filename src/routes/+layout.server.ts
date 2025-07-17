import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  // safeGetSession is now available from the hook
  const { session } = await locals.safeGetSession();
  
  // Return cookies as a serializable array for the client-side load function
  return { session, cookies: cookies.getAll() };
};
