'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConnected } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/lib/supabase';
import LeftSidebar from './LeftSidebar';
import CenterFeed from './CenterFeed';
import RightSidebar from './RightSidebar';
import AuthModal from '@/components/auth/AuthModal';
import ProfilePage from '@/components/pages/ProfilePage';
import PrivacyPage from '@/components/pages/PrivacyPage';
import VerificationPage from '@/components/pages/VerificationPage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Database, ExternalLink, CheckCircle } from 'lucide-react';

export default function MainLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page') || 'feed';

  useEffect(() => {
    console.log('🔍 Checking Supabase connection...', { isSupabaseConnected });
    
    if (!isSupabaseConnected) {
      console.log('❌ Supabase not connected');
      setLoading(false);
      return;
    }

    console.log('✅ Supabase connected, initializing auth...');
    initializeAuth();

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 User found, fetching profile...');
        await fetchProfile(session.user.id);
      } else {
        console.log('👤 No user, clearing profile...');
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔍 Getting current user...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user:', user?.email || 'None');
      
      setUser(user);
      
      if (user) {
        await fetchProfile(user.id);
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      console.log('📝 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        return;
      }

      console.log('✅ Profile fetched:', data);
      setProfile(data);
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error);
    }
  };

  const handleAuthSuccess = () => {
    console.log('✅ Auth success - state will update automatically');
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
                To use SikshaSetu, you need to connect to a Supabase database. Click the "Connect to Supabase" 
                button in the top right corner to set up your database connection.
              </p>
              
              <Alert className="max-w-2xl mx-auto mb-6">
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-left">
                    <p className="font-medium mb-2">What you'll need:</p>
                    <ul className="text-sm space-y-1">
                      <li>• A Supabase account (free tier available)</li>
                      <li>• Your Supabase project URL</li>
                      <li>• Your Supabase anon key</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button 
                  onClick={() => window.open('https://supabase.com', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Started with Supabase
                </Button>
                
                <div className="text-sm text-gray-500">
                  <p>Once connected, you'll be able to:</p>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    <span>✓ Create an account</span>
                    <span>✓ Share wisdom</span>
                    <span>✓ Donate resources</span>
                    <span>✓ Get verified</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SikshaSetu...</p>
          {isSupabaseConnected && (
            <div className="flex items-center justify-center mt-2 text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Connected to Supabase</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push('/?page=feed')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SikshaSetu</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isSupabaseConnected && (
                <div className="hidden md:flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Connected</span>
                </div>
              )}
              
              {user && profile && (
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome,</span>
                  <span className="font-medium text-gray-900">{profile.username}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    profile.role === 'donor' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {profile.role === 'donor' ? '❤️ Donor' : '🎓 Student'}
                  </span>
                  {(profile.role === 'donor' || profile.verification_status === 'verified') && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>
              )}
              
              {!user && isSupabaseConnected && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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