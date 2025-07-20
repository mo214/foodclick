<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto, invalidateAll } from '$app/navigation';
  import type { User } from '@supabase/supabase-js';
  import type { Restaurant, MenuItem } from '$lib/index';

  export let data;

  // Defensive parsing
  const user = data?.user as User | undefined;
  const isMasterAdmin = user?.user_metadata?.is_super_admin === true;
  const restaurants = (data?.restaurants ?? []) as Restaurant[];
  const allMenuItems = (data?.menuItems ?? []) as MenuItem[];

  let newRestaurantName = '';
  let selectedRestaurant: Restaurant []=[];
  let selectedMenuItems: MenuItem[] = [];
  let roleAssignmentMessage = '';
  let loading = false;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    goto('/login');
  };

  async function addRestaurant() {
    if (!newRestaurantName.trim()) return;
    loading = true;

    const { error } = await supabase
      .from('dummy_restaurant')
      .insert([{ name: newRestaurantName.trim() }]);

    if (!error) {
      newRestaurantName = '';
      await invalidateAll();
    } else {
      console.error(error.message);
    }

    loading = false;
  }

  async function deleteRestaurant(id: string) {
    const { error } = await supabase
      .from('dummy_restaurant')
      .delete()
      .eq('id', id);

    if (!error) {
      if (selectedRestaurant?.id === id) {
        selectedRestaurant = null;
        selectedMenuItems = [];
      }
      await invalidateAll();
    }
  }

  function selectRestaurant(restaurant: Restaurant) {
    selectedRestaurant = restaurant;
    selectedMenuItems = allMenuItems.filter((item) => item.restaurant_id === restaurant.id);
    alert(`You clicked on: ${restaurant.name}`);
  }

  async function assignMasterAdminRole() {
    if (!user) return;
    roleAssignmentMessage = 'Assigning...';

    const res = await fetch('/api/set-admin-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });

    const result = await res.json();
    roleAssignmentMessage = res.ok
      ? `${result.message} Please log out and log back in.`
      : `Failed: ${result.error}`;
  }
</script>

{#if data.user && isMasterAdmin}
  <div class="min-h-screen flex bg-gray-100">
    <aside class="w-72 bg-white p-6 shadow">
      <h2 class="text-2xl font-semibold mb-4">Master Admin</h2>
      <p class="text-sm text-green-600 mb-2">Role: {user.app_metadata?.role ?? 'Unknown'}</p>
      <p class="text-sm mb-6 break-all">Logged in as: {user.email}</p>
      <button on:click={handleLogout} class="btn bg-red-600 hover:bg-red-700">Log Out</button>
    </aside>

    <main class="flex-1 p-10">
      <h1 class="text-3xl font-bold mb-6">Restaurant Dashboard</h1>

      <section class="bg-white p-6 shadow rounded-xl max-w-md mb-10">
        <h2 class="text-xl font-semibold mb-4">Add New Restaurant</h2>
        <input
          bind:value={newRestaurantName}
          placeholder="Restaurant Name"
          class="input mb-4"
          on:keydown={(e) => e.key === 'Enter' && addRestaurant()}
        />
        <button on:click={addRestaurant} disabled={loading} class="btn">
          {loading ? 'Adding...' : 'Add Restaurant'}
        </button>
      </section>

      <section class="bg-white p-6 shadow rounded-xl max-w-4xl">
        <h2 class="text-xl font-semibold mb-4">Restaurants</h2>
        {#if restaurants.length === 0}
          <p>No restaurants found.</p>
        {:else}
          <ul class="divide-y divide-gray-200">
            {#each restaurants as r (r.id)}
              <li class="py-4 flex justify-between">
                <div>
                  <button on:click={() => selectRestaurant(r)}>{r.name}</button>
                  <p>ID: {r.id} | Created: {new Date(r.created_at).toLocaleString()}</p>
                </div>
                <button on:click={() => deleteRestaurant(r.id)} class="text-red-600">Delete</button>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      {#if selectedRestaurant}
        <section class="bg-white p-6 shadow rounded-xl max-w-4xl mt-10">
          <h2 class="text-xl font-semibold mb-4">Menu for {selectedRestaurant.name}</h2>
          {#if selectedMenuItems.length === 0}
            <p>No menu items found for this restaurant.</p>
          {:else}
            <ul class="divide-y divide-gray-200">
              {#each selectedMenuItems as item (item.id)}
                <li class="py-4">
                  <p class="font-semibold">{item.name}</p>
                  <p class="text-sm">Price: {item.price} DKK</p>
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      {/if}
    </main>
  </div>
{:else}
  <!-- fallback -->
  <div class="h-screen flex justify-center items-center">
    <div class="bg-white shadow p-6 rounded">
      <h2 class="text-2xl font-bold mb-2">Access Denied</h2>
      {#if user}
        <p>{user.email} is not a master admin.</p>
        <button on:click={assignMasterAdminRole} class="btn mt-4">Assign Role</button>
        {#if roleAssignmentMessage}
          <p class="text-sm mt-2">{roleAssignmentMessage}</p>
        {/if}
      {:else}
        <p>You are not logged in.</p>
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
