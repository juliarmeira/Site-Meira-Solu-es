import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
    console.warn('Supabase credentials missing. Check .env.local');
}

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            signInWithPassword: async () => ({ error: { message: 'Supabase não configurado.' } }),
            signUp: async () => ({ error: { message: 'Supabase não configurado.' } }),
        }
    } as any;
