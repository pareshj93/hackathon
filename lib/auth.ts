import { supabase } from './supabase';

export async function signUp(email: string, password: string, role: 'student' | 'donor') {
  try {
    console.log('🚀 Starting signup process for:', email, 'as', role);
    
    // First, sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined
      }
    });

    if (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }

    if (data.user) {
      console.log('✅ User created, creating profile...');
      
      // Create profile immediately
      const username = email.split('@')[0];
      const profileData = {
        id: data.user.id,
        email,
        username,
        role,
        verification_status: role === 'donor' ? 'verified' : 'unverified',
        created_at: new Date().toISOString()
      };

      console.log('📝 Creating profile with data:', profileData);

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        
        // If profile already exists, update it
        if (profileError.code === '23505') {
          console.log('🔄 Profile exists, updating...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role, 
              verification_status: role === 'donor' ? 'verified' : 'unverified',
              email,
              username 
            })
            .eq('id', data.user.id);
          
          if (updateError) {
            console.error('❌ Profile update error:', updateError);
            throw updateError;
          }
          console.log('✅ Profile updated successfully');
        } else {
          throw profileError;
        }
      } else {
        console.log('✅ Profile created successfully');
      }
    }

    return data;
  } catch (error) {
    console.error('❌ SignUp error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    console.log('🔑 Signing in user:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ SignIn error:', error);
      throw error;
    }

    console.log('✅ User signed in successfully');
    return data;
  } catch (error) {
    console.error('❌ SignIn error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    console.log('👋 Signing out user...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('✅ User signed out successfully');
  } catch (error) {
    console.error('❌ SignOut error:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('❌ GetCurrentUser error:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ GetUserProfile error:', error);
    throw error;
  }
}