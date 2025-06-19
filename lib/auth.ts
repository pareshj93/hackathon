import { supabase } from './supabase';

export async function signUp(email: string, password: string, role: 'student' | 'donor') {
  try {
    console.log('🚀 Starting signup process for:', email, 'as', role);

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      throw signUpError;
    }
    if (!authData.user) {
        throw new Error("User signup succeeded but no user data was returned.");
    }
    
    console.log('✅ User created in auth. Now creating profile.');

    const profileData = {
        id: authData.user.id,
        email: email,
        username: email.split('@')[0],
        role: role,
        verification_status: role === 'donor' ? 'verified' : 'unverified',
    };

    const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

    if (profileError) {
        throw profileError;
    }

    console.log('✅ Profile successfully created for role:', role);
    return authData;

  } catch (error) {
    console.error('❌ A problem occurred during the full signup process:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ SignIn error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('❌ SignOut error:', error);
    throw error;
  }
}
