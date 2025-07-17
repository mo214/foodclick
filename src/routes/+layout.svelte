<script lang="ts">
  import '../app.css'; // This imports Tailwind globally
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  export let data: any;
  export let children: any;

  let { session, supabase } = data;

  onMount(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event:string, newSession:any) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });
    return () => subscription.unsubscribe();
  });
</script>

<slot />
