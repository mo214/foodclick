// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces


export {};
// src/app.d.ts
// src/app.d.ts
import type { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<any, any, any>; // ← safe and compatible
      getSession: () => Promise<Session | null>;
    }
  }
}

  
