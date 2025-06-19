import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Function to check if a string is a valid URL
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Create Supabase client
let supabase: any;

if (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  console.log('✅ Supabase connected successfully');
} else {
  console.error('❌ Supabase connection failed - missing or invalid credentials');
  // Mock Supabase client for development without database
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Please connect to Supabase first' } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Please connect to Supabase first' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Please connect to Supabase first' } }),
          order: () => Promise.resolve({ data: [], error: { message: 'Please connect to Supabase first' } })
        }),
        order: () => Promise.resolve({ data: [], error: { message: 'Please connect to Supabase first' } })
      }),
      insert: () => Promise.resolve({ error: { message: 'Please connect to Supabase first' } }),
      update: () => ({
        eq: () => Promise.resolve({ error: { message: 'Please connect to Supabase first' } })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: { message: 'Please connect to Supabase first' } })
      })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: { message: 'Please connect to Supabase first' } })
      })
    },
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {}
    })
  };
}

export { supabase };

export const isSupabaseConnected = !!(supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl));

export type Profile = {
  id: string;
  email: string;
  username: string;
  role: 'student' | 'donor';
  verification_status: 'unverified' | 'pending' | 'verified';
  created_at: string;
  donor_type?: string;
  bio?: string;
  organization?: string;
};

export type Post = {
  id: string;
  user_id: string;
  post_type: 'wisdom' | 'donation';
  content?: string;
  resource_title?: string;
  resource_category?: string;
  resource_contact?: string;
  created_at: string;
  profiles?: Profile;
};