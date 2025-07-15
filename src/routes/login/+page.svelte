<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  const handleLogin = async () => {
    error = '';
    if (!email || !password) {
      error = 'Please enter both email and password.';
      return;
    }
    loading = true;
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    loading = false;

    if (authError) {
      error = authError.message;
      
    } else {
      // You can copy this token and inspect it at https://jwt.io
      console.log('Login successful:');
      await goto('/admin-dashboard');
    }
  };
</script>

<div class="min-h-screen flex flex-col lg:flex-row">
  <!-- Left section (form) -->
  <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
    <div class="w-full max-w-md">
      <h1 class="text-3xl font-bold mb-2">Login</h1>
      <p class="text-gray-500 mb-6">Please enter your details</p>

      {#if error}
        <div class="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      {/if}

      <form on:submit|preventDefault={handleLogin}>
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            autocomplete="username"
          />
        </div>

        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            autocomplete="current-password"
          />
        </div>

        <div class="flex items-center justify-between mb-6">
          <a href="#" class="text-sm text-purple-600 hover:underline">Forgot password</a>
        </div>

        <button
          type="submit"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  </div>


  <!-- Right section (image) -->
  <div class="hidden lg:flex w-1/2 bg-purple-100 items-center justify-center">
    <img
      src="/your-illustration.svg"
      alt="Login Illustration"
      class="max-w-md"
    />
  </div>
</div>
