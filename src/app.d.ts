// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces


export {};
// src/app.d.ts
// src/app.d.ts
import type { SupabaseClient, User } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<any, any, any>; // ← safe and compatible
      user: User | null;
      session: import('@supabase/supabase-js').Session | null;
    }
  }
}
