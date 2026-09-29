import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Builds without the Supabase settings (e.g. Vercel preview deployments, which do not receive the
// production secrets) must still succeed: the clients then point at an unreachable placeholder and
// every query fails at run time instead of crashing the build.
const url = supabaseUrl || 'https://not-configured.invalid';
if (!supabaseUrl && process.env.NODE_ENV === 'production') {
    console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL is not set; database features are disabled in this deployment.');
}

// Server-side client with service role (full access, bypasses RLS)
// Used in API routes only
export const supabaseAdmin = createClient(url, supabaseServiceKey || supabaseAnonKey || 'not-configured');

// Public client (respects RLS policies)
// Used for client-side operations
export const supabase = createClient(url, supabaseAnonKey || 'not-configured');
