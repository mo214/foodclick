import { error as svelteKitError, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	// Protect the route. If the user is not logged in, redirect them to the login page.
	if (!session) {
		throw redirect(303, '/login');
	}

	// Fetch restaurants from the 'dummy_restaurant' table.
	// Your Row Level Security (RLS) policies in Supabase will automatically
	// enforce that only authorized users (e.g., master_admins) can access this data.
	const { data: restaurants, error: restaurantsError } = await locals.supabase
		.from('dummy_restaurant')
		.select('*')
		.order('created_at', { ascending: false });

	if (restaurantsError) {
		console.error('Error fetching restaurants:', restaurantsError);
		throw svelteKitError(500, 'Failed to load restaurants. You may not have the required permissions.');
	}

	// Fetch menu items from the 'menu_items' table.
	const { data: menuItems, error: menuItemsError } = await locals.supabase
		.from('menu_items')
		.select('*')
		.order('created_at', { ascending: false });

	const { count, error: countError } = await locals.supabase
		.from('menu_items')
		.select('id', { count: 'exact', head: true });

	console.log('Fetched menu items:', menuItems, 'Error:', menuItemsError, 'Count:', count, 'Count Error:', countError);

	if (menuItemsError) {
		console.error('Error fetching menu items:', menuItemsError);
		throw svelteKitError(500, 'Failed to load menu items. You may not have the required permissions.');
	}

	// Make the restaurants and menu items data available to the +page.svelte component.
	return {
		restaurants: restaurants ?? [],
		menuItems: menuItems ?? [], 
		user
	};
};
