import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  if (!locals.safeGetSession) {
    throw new Error('safeGetSession is not defined on locals');
  }
  const { session } = await locals.safeGetSession();
  
  return { session, cookies };
};
