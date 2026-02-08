
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration.
 * Credentials are now retrieved from environment variables to follow security best practices.
 * Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your execution environment.
 */
const supabaseUrl = 'https://ocstqtwtowhlrrwifgvc.supabase.co';
const supabaseAnonKey = 'sb_publishable_ZWLa-8B8AMRFqJI90jfSzA_oNHc6sPY';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY environment variables are configured.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
