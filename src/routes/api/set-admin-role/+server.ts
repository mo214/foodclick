import { json, error as svelteKitError } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const SUPABASE_URL = process.env.SUPABASE_URL!;

export async function POST(event: RequestEvent) {
  // Create supabase client with event
  const supabase = createSupabaseServerClient({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_JWT_SECRET,
    event
  });

  // Get current session
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (!session || !session.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userMeta = session.user.app_metadata;

  // 🔐 Check if the user is a master admin or super admin
  if (userMeta?.role !== 'master_admin' || !userMeta?.is_super_admin) {
    return json({ error: 'Forbidden: You do not have permission' }, { status: 403 });
  }

  // Parse request body
  const body = await event.request.json();
  const { userId } = body;

  if (!userId) {
    return json({ error: 'Missing userId in request body' }, { status: 400 });
  }

  // Assign master admin by upserting to master_admins table
  const { error: updateError } = await supabase
    .from('master_admins')
    .upsert(
      {
        id: userId,
        raw_app_meta_data: {
          role: 'master_admin',
          is_super_admin: true
        }
      },
      { onConflict: 'id' }
    );

  if (updateError) {
    console.error('Error updating master_admins:', updateError);
    return json({ error: 'Failed to update admin role in database' }, { status: 500 });
  }

  return json({ message: `Master admin role assigned to user ${userId}` });
}
