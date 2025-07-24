import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl === 'https://your-project-ref.supabase.co') {
  throw new Error('Missing or invalid VITE_SUPABASE_URL environment variable. Please set it to your actual Supabase project URL in the .env file.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('Missing or invalid VITE_SUPABASE_ANON_KEY environment variable. Please set it to your actual Supabase anon key in the .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". Please ensure it's a valid URL like "https://your-project-ref.supabase.co"`);
}

// Force production URL for auth redirects
const getProductionUrl = () => {
  if (typeof window !== 'undefined') {
    // In production, use the current origin
    if (window.location.hostname !== 'localhost') {
      return window.location.origin;
    }
  }
  // Fallback to environment variable or custom domain
  return import.meta.env.VITE_SITE_URL || 'https://taskdom.app';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Force the site URL to be production URL
    redirectTo: `${getProductionUrl()}/auth/callback`,
  },
});

// Auth helpers
export const signUp = async (email: string, password: string, firstName?: string) => {
  try {
    console.log('Attempting to sign up with email:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          full_name: firstName,
        },
        emailRedirectTo: `${getProductionUrl()}/auth/callback`,
      },
    });
    
    if (error) {
      console.warn('Sign-up failed:', error.message);
    } else {
      console.log('Sign-up successful, user:', data.user?.id);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Unexpected error during sign-up:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.warn('Sign-in failed:', error.message);
    } else {
      console.log('Sign-in successful, user:', data.user?.id);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Unexpected error during sign-in:', error);
    return { data: null, error };
  }
};

export const signInWithGoogle = async () => {
  try {
    console.log('🚀 Starting Google OAuth with PKCE...');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getProductionUrl()}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        // Enable PKCE flow for better security
        flowType: 'pkce'
      },
    });
    
    if (error) {
      console.error('❌ Google sign-in failed:', error.message);
    } else {
      console.log('✅ Google sign-in initiated with PKCE');
    }
    
    return { data, error };
  } catch (error) {
    console.error('❌ Unexpected error during Google sign-in:', error);
    return { data: null, error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    console.log('Attempting to send password reset email to:', email);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getProductionUrl()}/reset-password`,
    });
    
    if (error) {
      console.warn('Password reset request failed:', error.message);
    } else {
      console.log('Password reset email sent successfully');
    }
    
    return { data, error };
  } catch (error) {
    console.error('Unexpected error during password reset:', error);
    return { data: null, error };
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    console.log('Attempting to update password');
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.warn('Password update failed:', error.message);
    } else {
      console.log('Password updated successfully');
    }
    
    return { data, error };
  } catch (error) {
    console.error('Unexpected error during password update:', error);
    return { data: null, error };
  }
};

export const handleAuthCallback = async () => {
  try {
    console.log('=== AUTH CALLBACK START ===');
    console.log('Starting auth callback process...');
    console.log('Current URL:', window.location.href);
    
    // Get the current URL to extract the authorization code
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error_param = url.searchParams.get('error');
    const error_description = url.searchParams.get('error_description');
    const state = url.searchParams.get('state');
    
    console.log('URL Parameters:');
    console.log('- code:', code ? 'PRESENT' : 'MISSING');
    console.log('- error:', error_param);
    console.log('- error_description:', error_description);
    console.log('- state:', state ? 'PRESENT' : 'MISSING');
    
    // Check for OAuth errors first
    if (error_param) {
      console.error('OAuth error detected:', error_param, error_description);
      return { 
        data: null, 
        error: { message: error_description || error_param } 
      };
    }
    
    if (code) {
      console.log('✅ Authorization code found, attempting exchange...');
      console.log('Code length:', code.length);
      
      try {
        // Exchange the authorization code for a session
        console.log('Calling supabase.auth.exchangeCodeForSession...');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        console.log('Exchange result:');
        console.log('- data:', data);
        console.log('- error:', error);
        console.log('- session exists:', !!data?.session);
        console.log('- user exists:', !!data?.user);
        
        if (error) {
          console.error('❌ Code exchange failed:', error);
          return { data: null, error };
        }
        
        if (data?.session && data?.user) {
          console.log('✅ Auth callback successful!');
          console.log('User ID:', data.user.id);
          console.log('User email:', data.user.email);
          console.log('Session expires at:', data.session.expires_at);
          return { data, error: null };
        } else {
          console.warn('❌ Code exchange succeeded but no session/user data');
          console.log('Data received:', JSON.stringify(data, null, 2));
          return { 
            data: null, 
            error: { message: 'No session data returned from authentication' } 
          };
        }
      } catch (exchangeError) {
        console.error('❌ Exception during code exchange:', exchangeError);
        return { 
          data: null, 
          error: { message: 'Code exchange failed: ' + exchangeError.message } 
        };
      }
    } else {
      console.log('❌ No authorization code found, checking for existing session...');
      
      try {
        // Fallback to getting current session
        const { data, error } = await supabase.auth.getSession();
        
        console.log('Session check result:');
        console.log('- data:', data);
        console.log('- error:', error);
        console.log('- session exists:', !!data?.session);
        
        if (error) {
          console.error('Session check error:', error.message);
          return { data: null, error };
        }
        
        if (data?.session) {
          console.log('✅ Found existing session');
          return { data, error: null };
        } else {
          console.warn('❌ No session found');
          return { 
            data: null, 
            error: { message: 'No active session found and no authorization code provided' } 
          };
        }
      } catch (sessionError) {
        console.error('❌ Exception during session check:', sessionError);
        return { 
          data: null, 
          error: { message: 'Session check failed: ' + sessionError.message } 
        };
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error in auth callback:', error);
    console.log('Error details:', JSON.stringify(error, null, 2));
    return { data: null, error: { message: 'Unexpected authentication error: ' + error.message } };
  } finally {
    console.log('=== AUTH CALLBACK END ===');
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.warn('Failed to get current user:', error.message);
      return { user: null, error };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return { user: null, error };
  }
};

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Failed to get session:', error.message);
      return { session: null, error };
    }
    
    return { session, error: null };
  } catch (error) {
    console.error('Unexpected error getting session:', error);
    return { session: null, error };
  }
};

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Sign-out failed:', error.message);
  } else {
    console.log('Sign-out successful');
  }
  return { error };
};

export { signOut };

