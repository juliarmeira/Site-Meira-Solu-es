import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
    console.warn('Supabase credentials missing. Check .env.local');
}

// Mock para quando Supabase não está configurado
const mockAuth = {
    signInWithPassword: async () => ({ error: { message: 'Supabase não configurado.' }, data: { user: null, session: null } }),
    signUp: async () => ({ error: { message: 'Supabase não configurado.' }, data: { user: null, session: null } }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
};

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : { auth: mockAuth } as any;

export const isConfigured = isSupabaseConfigured;
