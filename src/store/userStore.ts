import { create } from 'zustand';
import { User, UserRole, UserSettings } from '../types';
import { supabase, getCurrentUser, getSession } from '../lib/supabase';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mode: 'nsfw' | 'sfw';
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  toggleMode: () => void;
  hasPermission: (permission: string) => boolean;
}

const PERMISSIONS = {
  guest: ['read:sfw', 'view:reviews'],
  reader: ['read:all', 'write:reviews', 'join:clubs', 'use:voice'],
  club_host: ['manage:club', 'moderate:members', 'set:goals'],
  admin: ['manage:all', 'moderate:content', 'toggle:global']
};

// Mock user for demo purposes
const createMockUser = (): User => ({
  id: 'demo-user-' + Math.random().toString(36).substring(2, 9),
  email: 'demo@taskdom.com',
  username: 'bookworm_lover',
  displayName: 'Alexandria',
  pronouns: 'she/her',
  profilePicture: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
  preferredGenres: ['dark romance', 'fantasy smut', 'monster romance'],
  praiseStyle: 'flirty',
  role: 'reader',
  dailyReadingGoal: {
    type: 'minutes',
    amount: 45
  },
  settings: {
    mode: 'nsfw',
    voiceProfile: 'flirty',
    spiceTolerance: 5,
    notifications: {
      readingReminders: true,
      clubUpdates: true,
      achievements: true
    }
  },
  clubs: [],
  createdAt: new Date()
});

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  mode: 'nsfw',

  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // Check for existing session
      const { session, error: sessionError } = await getSession();
      
      if (sessionError) {
        console.warn('Session error:', sessionError);
      }
      
      if (session?.user) {
        console.log('Found existing session for user:', session.user.id);
        // Get user data
        const { user: authUser, error: userError } = await getCurrentUser();
        
        if (userError) {
          console.warn('User fetch error:', userError);
        }
        
        if (authUser) {
          // Get user profile from database
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (profileError) {
            console.warn('Profile fetch error:', profileError);
          }
          
          // Create user object
          const userData: User = {
            id: authUser.id,
            email: authUser.email || '',
            username: profileData?.username || authUser.email?.split('@')[0] || 'user',
            displayName: profileData?.display_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            pronouns: profileData?.pronouns || 'they/them',
            profilePicture: profileData?.profile_picture || authUser.user_metadata?.avatar_url || 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
            preferredGenres: profileData?.preferred_genres || ['romance', 'fantasy'],
            praiseStyle: profileData?.praise_style || 'flirty',
            role: profileData?.role || 'reader',
            dailyReadingGoal: profileData?.daily_reading_goal || {
              type: 'minutes',
              amount: 30
            },
            settings: profileData?.settings || {
              mode: 'nsfw',
              voiceProfile: 'flirty',
              spiceTolerance: 5,
              notifications: {
                readingReminders: true,
                clubUpdates: true,
                achievements: true
              }
            },
            clubs: profileData?.clubs || [],
            createdAt: new Date(authUser.created_at || Date.now())
          };
          
          set({ 
            user: userData, 
            isAuthenticated: true,
            isLoading: false,
            mode: userData.settings.mode === 'sfw' ? 'sfw' : 'nsfw'
          });
          
          return;
        }
      }
      
      // If no session or user, set to unauthenticated state
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
        mode: 'nsfw'
      });
      
    } catch (error) {
      console.warn('Error initializing user:', error);
      
      // Fallback to unauthenticated state on any error
      set({ 
        user: null,
        isAuthenticated: false, 
        isLoading: false,
        mode: 'nsfw'
      });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      // Attempt Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // If authentication fails, provide helpful error message
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        } else {
          throw new Error(`Authentication failed: ${error.message}`);
        }
      }
      
      if (data.user) {
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Profile fetch error:', profileError);
        }
        
        // Create user object
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          username: profileData?.username || data.user.email?.split('@')[0] || 'user',
          displayName: profileData?.display_name || data.user.email?.split('@')[0] || 'User',
          pronouns: profileData?.pronouns || 'they/them',
          profilePicture: profileData?.profile_picture || 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
          preferredGenres: profileData?.preferred_genres || ['romance', 'fantasy'],
          praiseStyle: profileData?.praise_style || 'flirty',
          role: profileData?.role || 'reader',
          dailyReadingGoal: profileData?.daily_reading_goal || {
            type: 'minutes',
            amount: 30
          },
          settings: profileData?.settings || {
            mode: 'nsfw',
            voiceProfile: 'flirty',
            spiceTolerance: 5,
            notifications: {
              readingReminders: true,
              clubUpdates: true,
              achievements: true
            }
          },
          clubs: profileData?.clubs || [],
          createdAt: new Date(data.user.created_at || Date.now())
        };
        
        set({ 
          user: userData, 
          isAuthenticated: true,
          isLoading: false,
          mode: userData.settings.mode === 'sfw' ? 'sfw' : 'nsfw'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      
      // Only attempt logout if actually authenticated
      if (get().isAuthenticated) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('Logout error:', error);
        }
      }
      
      // Reset to unauthenticated state
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
        mode: 'nsfw'
      });
    } catch (error) {
      console.warn('Logout error:', error);
      // Still reset to unauthenticated state even if logout fails
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
        mode: 'nsfw'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (newSettings) => {
    const { user } = get();
    if (!user) return;

    try {
      const updatedUser = {
        ...user,
        settings: { ...user.settings, ...newSettings }
      };

      // Update in database only if authenticated
      if (get().isAuthenticated) {
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            settings: updatedUser.settings 
          })
          .eq('id', user.id);
          
        if (error) {
          console.warn('Settings update error:', error);
        }
      }

      set({ 
        user: updatedUser,
        mode: updatedUser.settings.mode === 'sfw' ? 'sfw' : 'nsfw'
      });
    } catch (error) {
      console.warn('Error updating settings:', error);
    }
  },

  toggleMode: () => {
    set(state => ({ mode: state.mode === 'nsfw' ? 'sfw' : 'nsfw' }));
  },

  hasPermission: (permission: string) => {
    const { user, isAuthenticated } = get();
    
    // If not authenticated, only allow guest permissions
    if (!isAuthenticated || !user) {
      const guestPermissions = PERMISSIONS.guest || [];
      return guestPermissions.includes(permission);
    }

    const rolePermissions = PERMISSIONS[user.role as keyof typeof PERMISSIONS] || [];
    return rolePermissions.includes(permission) || user.role === 'admin';
  }
}));