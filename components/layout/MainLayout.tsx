'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConnected, Profile } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import LeftSidebar from './LeftSidebar';
import CenterFeed from './CenterFeed';
import RightSidebar from './RightSidebar';
import AuthModal from '@/components/auth/AuthModal';
import ProfilePage from '@/components/pages/ProfilePage';
import PrivacyPage from '@/components/pages/PrivacyPage';
import VerificationPage from '@/components/pages/VerificationPage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, ExternalLink, CheckCircle } from 'lucide-react';

export default function MainLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page') || 'feed';

  const fetchProfile = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        setProfile(data);
    } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
    }
  };

  useEffect(() => {
    // This effect runs once to determine the initial auth state and then listens for changes.
    const getSessionAndListen = async () => {
      // Actively get the current session on first load
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      setLoading(false); // Stop loading after the initial check is complete

      // Listen for subsequent auth events (SIGN_IN, SIGN_OUT)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          const updatedUser = session?.user ?? null;
          setUser(updatedUser);
          if (updatedUser) {
            await fetchProfile(updatedUser.id);
          } else {
            setProfile(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    getSessionAndListen();
  }, []);

  const handleAuthSuccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        setUser(user);
        await fetchProfile(user.id);
    }
  };
  
  const renderPage = () => {
    if (!isSupabaseConnected) {
      return (
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect to Supabase</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                To use EduBridge, you need to connect to a Supabase database. Please create a `.env.local` file with your project URL and anon key.
              </p>
              <Button 
                  onClick={() => window.open('https://supabase.com', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
              >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Started with Supabase
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Don't render child pages until the initial auth check is done.
    if (loading) {
         return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Initializing Session...</p>
                </div>
            </div>
        );
    }

    switch (currentPage) {
      case 'profile':
        return <ProfilePage user={user} profile={profile} />;
      case 'privacy':
        return <PrivacyPage />;
      case 'verification':
        return <VerificationPage user={user} profile={profile} onVerificationUpdate={fetchProfile} />;
      default:
        return (
          <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto px-4">
            <div className="col-span-12 lg:col-span-3">
              <LeftSidebar 
                user={user} 
                profile={profile} 
                onAuthClick={() => setShowAuthModal(true)} 
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <CenterFeed user={user} profile={profile} />
            </div>
            <div className="col-span-12 lg:col-span-3">
              <RightSidebar />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
       <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push('/?page=feed')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EduBridge</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {!user && isSupabaseConnected && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Join Community
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="py-6">
        {renderPage()}
      </div>

      {isSupabaseConnected && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
