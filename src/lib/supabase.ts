import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wlfltuxedxeyeklgqcra.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qttOrhyJ90Q-jy__5QMjQg_4CmbhmmU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
