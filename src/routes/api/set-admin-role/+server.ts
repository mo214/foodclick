
import { json, error as svelteKitError } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { RequestEvent } from '@sveltejs/kit';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const SUPABASE_URL = process.env.SUPABASE_URL!;

export async function POST(event: RequestEvent) {
  // Create supabase client with event
  const supabaseClient = createSupabaseServerClient({ supabaseUrl: SUPABASE_URL, supabaseKey: SUPABASE_JWT_SECRET, event });

  // Get user session
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session || !session.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Optionally: Only allow certain emails or user IDs to assign admin role
  // For example, restrict to your own email
  if (session.user.email !== 'mohammed_500@outloo.dk') {
    return json({ error: 'Forbidden: Not allowed to assign admin role' }, { status: 403 });
  }

  // Get userId to assign from request body
  const body = await event.request.json();
  const { userId } = body;

  if (!userId) {
    return json({ error: 'Missing userId in request body' }, { status: 400 });
  }

  // Create a JWT token with "role": "master_admin" claim
  try {
    const token = jwt.sign(
      {
        role: 'master_admin',
        sub: userId,
        customClaimKey: 'customClaimValue'  // Example of adding a custom claim
      },
      SUPABASE_JWT_SECRET,
      {
        expiresIn: '1h',
        issuer: SUPABASE_URL,
      }
    );

    return json({ message: `Master admin role assigned to user ${userId}`, token });
  } catch (err) {
    console.error('Error signing JWT:', err);
    throw svelteKitError(500, 'Internal Server Error');
  }
}