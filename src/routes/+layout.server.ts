import type { LayoutServerData } from './$types';

export const load = async ({ locals }: { locals: any }): Promise<LayoutServerData | null> => {
	return {
		session: locals.session ?? null,
		user: locals.user ?? null
	};
};
