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
  throw new Error(`Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". Please ensure it's a valid URL starting with https://`);
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, firstName?: string) => {
  try {
    console.log('Attempting to sign up with email:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Disable email confirmation for easier testing
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email: email,
          full_name: firstName || '',
        }
      }
    });
    
    if (error) {
      // Use console.warn for expected authentication failures
      console.warn('Sign-up attempt failed:', error.message);
    } else {
      console.log('Sign-up successful, user:', data.user?.id);
      
      // We don't need to create a profile here anymore
      // The database trigger will handle profile creation
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
      // Use console.warn for expected authentication failures instead of console.error
      // This reduces noise in the console for normal user authentication attempts
      if (error.message.includes('Invalid login credentials')) {
        console.warn('Sign-in attempt with invalid credentials - this is normal user behavior');
      } else {
        console.warn('Sign-in attempt failed:', error.message);
      }
    } else if (data.user) {
      console.log('User successfully signed in:', data.user.email);
      
      // We don't need to check/create profile here anymore
      // The profile should already exist, and if not, other mechanisms will handle it
    }
    
    return { data, error };
  } catch (error) {
    console.error('Unexpected error during sign-in:', error);
    return { data: null, error };
  }
};

// Base64 URL encode function for PKCE
function base64URLEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer) as unknown as number[]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Generate a random string for code verifier
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
}

// Generate code challenge from verifier using SHA-256
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return base64URLEncode(digest);
}

export const signInWithGoogle = async () => {
  try {
    // Generate a random code verifier (43-128 chars)
    const codeVerifier = generateRandomString(64);
    
    // Store code verifier in localStorage for later use
    localStorage.setItem('pkce_code_verifier', codeVerifier);
    
    // Generate code challenge using SHA-256
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          client_id: '522040165864-p4fb218qtvvtk889smq1901h3j71op88.apps.googleusercontent.com',
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'email profile',
      },
    });
    
    if (error) {
      console.warn('Google sign-in failed:', error.message);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { data: null, error };
  }
};

export const handleAuthCallback = async () => {
  try {
    // Get the code verifier from localStorage
    const codeVerifier = localStorage.getItem('pkce_code_verifier');
    
    if (!codeVerifier) {
      throw new Error('No code verifier found. The authentication flow may have been interrupted.');
    }
    
    // Exchange the authorization code for a token
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      window.location.search.substring(1)
    );
    
    // Clean up
    localStorage.removeItem('pkce_code_verifier');
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error handling auth callback:', error);
    return { data: null, error };
  }
};

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Sign-out failed:', error.message);
  } else {
    console.log('User successfully signed out');
  }
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn('Failed to get current user:', error.message);
  }
  return { user: data.user, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('Failed to get session:', error.message);
  }
  return { session: data.session, error };
};

// Auth state change listener
const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};