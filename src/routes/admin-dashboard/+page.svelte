<!-- src/routes/admin/+page.svelte -->
<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto, invalidateAll } from '$app/navigation';
  import type { User } from '@supabase/supabase-js';
  import type { Restaurant, MenuItem } from '$lib/index';
	


  export let data;


$: user = data.user as User;
$: restaurants = (data.restaurants as unknown) as Restaurant[];
$: isMasterAdmin = data.isMasterAdmin;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    goto('/login');
  };

  let newRestaurantName = '';
  let loading = true;

  async function addRestaurant() {
    if (!newRestaurantName.trim()) return;
    loading = true;

    const { error } = await supabase
      .from('dummy_restaurant')
      .insert([{ name: newRestaurantName.trim() }]);

    if (error) console.error('Insert error:', error.message);
    else {
      newRestaurantName = '';
      await invalidateAll();
    }

    loading = false;
  }

  async function deleteRestaurant(id: string) {
    const { error } = await supabase
      .from('dummy_restaurant')
      .delete()
      .eq('id', id);

    if (error) console.error('Delete error:', error.message);
    else {
      if (selectedRestaurant?.id === id) {
        selectedRestaurant = null;
        menuItemsPromise = Promise.resolve([]); // Reset menu items
      }
      await invalidateAll();
    }
  }

  let selectedRestaurant: Restaurant | null = null;
  let menuItemsPromise: Promise<MenuItem[]> =Promise.resolve([]);

  function selectRestaurant(restaurant: Restaurant) {
    selectedRestaurant = restaurant;
    menuItemsPromise = loadMenuItems(restaurant.id);
  }

  async function loadMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (error) {
      console.error('Menu load error:', error.message);
      throw error;
    }

    return data || [];
  }

  // One-time role assignment (optional)
  let roleAssignmentMessage = '';
  async function assignMasterAdminRole() {
    if (!user) return;
    roleAssignmentMessage = 'Assigning role...';

    const response = await fetch('/api/set-admin-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });

    const result = await response.json();
    roleAssignmentMessage = response.ok
      ? `${result.message} Please log out and log back in.`
      : `Failed: ${result.error}`;
  }
</script>

{#if user && isMasterAdmin}
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-72 bg-white p-6 shadow">
      <h2 class="text-2xl font-semibold mb-4">Master Admin</h2>
      <p class="text-sm text-green-600 mb-2">Role: {user.app_metadata.role}</p>
      <p class="text-sm mb-6 break-all">Logged in as: {user.email}</p>
      <button on:click={handleLogout} class="btn bg-red-600 hover:bg-red-700">Log Out</button>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-10">
      <h1 class="text-3xl font-bold mb-6">Restaurant Dashboard</h1>

      <!-- Add Restaurant -->
      <section class="bg-white p-6 shadow rounded-xl max-w-md mb-10">
        <h2 class="text-xl font-semibold mb-4">Add New Restaurant</h2>
        <input
          bind:value={newRestaurantName}
          placeholder="Restaurant Name"
          class="input mb-4"
          id="restaurant-name"
          name="restaurant-name"
          autofocus
          on:keydown={(e) => e.key === 'Enter' && addRestaurant()}
        />
        <button on:click={addRestaurant} disabled={loading} class="btn">
          {loading ? 'Adding...' : 'Add Restaurant'}
        </button>
      </section>

      <!-- Restaurant List -->
      <section class="bg-white p-6 shadow rounded-xl max-w-4xl">
        <h2 class="text-xl font-semibold mb-4">Restaurants</h2>
        {#if restaurants.length === 0}
          <p class="text-gray-500">No restaurants found.</p>
        {:else}
          <ul class="divide-y divide-gray-200">
            {#each restaurants as r (r.id)}
              <li class="py-4 flex justify-between">
                <div>
                  <button
                    type="button"
                    class="font-semibold text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0 m-0 text-left"
                    on:click={() => selectRestaurant(r)}
                  >
                    {r.name}
                  </button>
                  <p class="text-sm text-gray-500">
                    ID: {r.id} | Created: {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <button on:click={() => deleteRestaurant(r.id)} class="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      <!-- Menu Items -->
      {#if selectedRestaurant}
        <section class="bg-white p-6 shadow rounded-xl max-w-4xl mt-10">
          <h2 class="text-xl font-semibold mb-4">Menu for {selectedRestaurant.name}</h2>
          {#await menuItemsPromise}
            <p>Loading menu...</p>
          {:then menuItems}
            {#if menuItems.length === 0}
              <p class="text-gray-500">No menu items found.</p>
            {:else}
              <ul class="divide-y divide-gray-200">
                {#each menuItems as item (item.id)}
                  <li class="py-4">
                    <p class="font-semibold">{item.name}</p>
                    <p class="text-sm text-gray-600">Price: {item.price} DKK</p>
                    <p class="text-sm text-gray-400">Category: {item.category}</p>
                  </li>
                {/each}
              </ul>
            {/if}
          {:catch error}
            <p class="text-red-500">Error: {error.message}</p>
          {/await}
        </section>
      {/if}
    </main>
  </div>
{:else}
  <!-- Fallback: Show if user has no role -->
  <div class="h-screen flex justify-center items-center">
    <div class="bg-white shadow p-6 rounded">
      <h2 class="text-2xl font-bold mb-2">Role Setup</h2>
      <p>You are logged in as {user.email}, but lack the master_admin role.</p>
      <button on:click={assignMasterAdminRole} class="btn mt-4">Assign Role</button>
      {#if roleAssignmentMessage}
        <p class="text-sm mt-2">{roleAssignmentMessage}</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .input {
    @apply w-full rounded border border-gray-300 p-3 mb-2 focus:ring-2 focus:ring-blue-500 outline-none;
  }
  .btn {
    @apply bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition;
  }
</style>
