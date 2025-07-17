// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces


import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<any, any, any>;
      session: Session | null;
      user: User | null;
    }
  }
}

export {}; // keep this at the bottom
