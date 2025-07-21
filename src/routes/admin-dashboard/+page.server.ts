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
		//.order('created_at', { ascending: false });

	if (restaurantsError) {
		console.error('Error fetching restaurants:', restaurantsError);
		throw svelteKitError(500, 'Failed to load restaurants. You may not have the required permissions.');
	}

	// Fetch all menu items from the 'menu_items' table. This pre-fetches the data
	// so the client doesn't need to make another request when a restaurant is selected.
	const { data: menuItems, error: menuItemsError } = await locals.supabase
		.from('menu_items')
		.select('*');
console.log('Menu Items:', menuItems);
	if (menuItemsError) {
		console.error('Error fetching menu items:', menuItemsError);
		throw svelteKitError(500, 'Failed to load menu items. You may not have the required permissions.');
	}

	// Find the restaurant with name "Test Restaurant"
	const testRestaurant = restaurants?.find(r => r.name === "Test Restaurant");
	console.log('Test Restaurant:', testRestaurant);

	// Filter menu items related to "Test Restaurant"
	const testRestaurantMenuItems = testRestaurant
		? menuItems?.filter(item => item.restaurant_id === testRestaurant.id)
		: [];

	// Make the restaurants, all menu items, and test restaurant menu items available to the +page.svelte component.
	return {
		restaurants: restaurants ?? [],
		menuItems: menuItems ?? [],
		testRestaurantMenuItems,
		user
	};
};
