
export const load = async ({ locals }: { locals: any }) => {
  console.log('Load function started');
  console.log('User from locals:', locals.user);

  if (!locals.user) {
    console.log('Redirecting: user not found');
    return {
      user: null,
      session: null
    };
  }

  return {
    user: locals.user,
    session: locals.session
  };
};

