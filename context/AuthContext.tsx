'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refetchProfile: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data as Profile | null);
    } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser.id);
          }
      } catch (e) {
        console.error("Error in getInitialSession", e)
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setProfile(null); // Reset profile on auth change
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refetchProfile = async () => {
      if (user) {
          await fetchProfile(user.id);
      }
  }

  const value = {
    user,
    profile,
    loading,
    refetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
