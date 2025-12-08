import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn('Supabase credentials not found. Only demo mode will be available.');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Demo mode is now user-selectable (stored in localStorage)
const DEMO_MODE_KEY = 'arithmetica_demo_mode';

// Check if user has explicitly chosen demo mode
export const isDemoSession = (): boolean => {
  // If no Supabase config, always demo mode
  if (!hasSupabaseConfig) return true;
  // Otherwise check user preference
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
};

// Enable demo mode
export const enableDemoMode = (): void => {
  localStorage.setItem(DEMO_MODE_KEY, 'true');
};

// Disable demo mode (switch to live)
export const disableDemoMode = (): void => {
  localStorage.removeItem(DEMO_MODE_KEY);
  localStorage.removeItem('stellar_user'); // Clear any demo session
};

// Legacy export for backwards compatibility (will be dynamic in AuthContext)
export const isDemoMode = isDemoSession();
