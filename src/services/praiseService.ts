// Praise Service for TaskDOM
// Handles all praise-related operations including delivery, preferences, and analytics

import { supabase } from '../lib/supabase';
import { 
  PraiseScript, 
  UserPraisePreferences, 
  PraiseHistory, 
  PraiseDeliveryOptions,
  PraiseNotification,
  PraiseTriggerType,
  PraiseCategory,
  PraiseAnalytics
} from '../types/praise';

export class PraiseService {
  
  // Get user's praise preferences
  static async getUserPreferences(userId: string): Promise<UserPraisePreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_praise_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user praise preferences:', error);
      return null;
    }
  }

  // Create or update user preferences
  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<UserPraisePreferences>
  ): Promise<UserPraisePreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_praise_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user praise preferences:', error);
      return null;
    }
  }

  // Get praise scripts based on criteria
  static async getPraiseScripts(options: {
    category?: PraiseCategory;
    triggerType?: PraiseTriggerType;
    nsfwAllowed?: boolean;
    limit?: number;
  } = {}): Promise<PraiseScript[]> {
    try {
      let query = supabase
        .from('praise_scripts')
        .select('*')
        .eq('is_active', true);

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.triggerType) {
        query = query.eq('trigger_type', options.triggerType);
      }

      if (options.nsfwAllowed === false) {
        query = query.eq('is_nsfw', false);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching praise scripts:', error);
      return [];
    }
  }

  // Select appropriate praise based on user preferences and context
  static async selectPraise(
    userId: string,
    options: PraiseDeliveryOptions
  ): Promise<PraiseScript | null> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Get recent praise history to avoid repetition
      const recentPraise = await this.getRecentPraiseHistory(userId, 10);
      const recentScriptIds = recentPraise.map(p => p.praise_script_id);

      // Build query criteria
      const queryCriteria = {
        triggerType: options.triggerType,
        nsfwAllowed: preferences?.nsfw_enabled || false,
        limit: 50
      };

      // Add category filter if specified or from preferences
      if (options.category) {
        queryCriteria.category = options.category;
      } else if (preferences?.preferred_categories?.length) {
        // We'll filter by preferred categories after fetching
      }

      // Get potential praise scripts
      let scripts = await this.getPraiseScripts(queryCriteria);

      // Filter by preferred categories if no specific category requested
      if (!options.category && preferences?.preferred_categories?.length) {
        scripts = scripts.filter(script => 
          preferences.preferred_categories.includes(script.category)
        );
      }

      // Filter out recently used scripts (unless forced)
      if (!options.forceDelivery && recentScriptIds.length > 0) {
        scripts = scripts.filter(script => 
          !recentScriptIds.includes(script.id)
        );
      }

      // Filter by vibe if specified
      if (options.preferredVibe) {
        scripts = scripts.filter(script => 
          script.vibe_tone.includes(options.preferredVibe)
        );
      }

      // Check frequency settings
      if (!this.shouldDeliverPraise(preferences, options.triggerType, recentPraise)) {
        return null;
      }

      // Select random script from filtered results
      if (scripts.length === 0) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * scripts.length);
      return scripts[randomIndex];

    } catch (error) {
      console.error('Error selecting praise:', error);
      return null;
    }
  }

  // Check if praise should be delivered based on frequency settings
  private static shouldDeliverPraise(
    preferences: UserPraisePreferences | null,
    triggerType: PraiseTriggerType,
    recentPraise: PraiseHistory[]
  ): boolean {
    if (!preferences) return true;

    const frequency = preferences.frequency_setting;
    const now = new Date();
    const today = now.toDateString();

    // Count praise delivered today
    const todaysPraise = recentPraise.filter(p => 
      new Date(p.delivered_at).toDateString() === today
    );

    // Count praise for this specific trigger type today
    const todaysTriggerPraise = todaysPraise.filter(p => 
      p.trigger_event === triggerType
    );

    switch (frequency) {
      case 'high':
        return true; // Always deliver
      
      case 'normal':
        // Limit to 3 per trigger type per day
        return todaysTriggerPraise.length < 3;
      
      case 'low':
        // Limit to 1 per trigger type per day
        return todaysTriggerPraise.length < 1;
      
      case 'milestone_only':
        // Only for major achievements
        return ['book_completion', 'achievement_unlock', 'reading_streak'].includes(triggerType);
      
      default:
        return true;
    }
  }

  // Deliver praise to user
  static async deliverPraise(
    userId: string,
    options: PraiseDeliveryOptions
  ): Promise<PraiseNotification | null> {
    try {
      // Select appropriate praise
      const script = await this.selectPraise(userId, options);
      if (!script) return null;

      // Get user preferences for delivery method
      const preferences = await this.getUserPreferences(userId);
      const deliveryMethod = preferences?.delivery_method || 'text';

      // Record in history
      await this.recordPraiseHistory(userId, script.id, options);

      // Create notification object
      const notification: PraiseNotification = {
        id: `praise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        script,
        deliveryMethod,
        timestamp: new Date(),
        context: options.context
      };

      return notification;

    } catch (error) {
      console.error('Error delivering praise:', error);
      return null;
    }
  }

  // Record praise delivery in history
  static async recordPraiseHistory(
    userId: string,
    scriptId: string,
    options: PraiseDeliveryOptions,
    reaction?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('praise_history')
        .insert({
          user_id: userId,
          praise_script_id: scriptId,
          trigger_event: options.triggerType,
          trigger_context: options.context || {},
          delivery_method: 'text', // Will be updated based on actual delivery
          user_reaction: reaction
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording praise history:', error);
    }
  }

  // Get recent praise history
  static async getRecentPraiseHistory(
    userId: string,
    limit: number = 20
  ): Promise<PraiseHistory[]> {
    try {
      const { data, error } = await supabase
        .from('praise_history')
        .select('*')
        .eq('user_id', userId)
        .order('delivered_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching praise history:', error);
      return [];
    }
  }

  // Update user reaction to praise
  static async updatePraiseReaction(
    historyId: string,
    reaction: 'liked' | 'dismissed' | 'loved' | 'disliked'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('praise_history')
        .update({ user_reaction: reaction })
        .eq('id', historyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating praise reaction:', error);
    }
  }

  // Get praise analytics for user
  static async getPraiseAnalytics(userId: string): Promise<PraiseAnalytics | null> {
    try {
      const history = await this.getRecentPraiseHistory(userId, 1000);
      
      if (history.length === 0) {
        return {
          totalPraiseReceived: 0,
          favoriteCategory: 'flirty_fun',
          mostTriggeredEvent: 'task_completion',
          praiseFrequency: { daily: 0, weekly: 0, monthly: 0 },
          reactionStats: { liked: 0, loved: 0, dismissed: 0, disliked: 0 },
          streakData: { currentStreak: 0, longestStreak: 0, lastPraiseDate: '' }
        };
      }

      // Get scripts for category analysis
      const scriptIds = history.map(h => h.praise_script_id);
      const { data: scripts } = await supabase
        .from('praise_scripts')
        .select('id, category')
        .in('id', scriptIds);

      const scriptMap = new Map(scripts?.map(s => [s.id, s.category]) || []);

      // Calculate analytics
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const dailyCount = history.filter(h => new Date(h.delivered_at) > dayAgo).length;
      const weeklyCount = history.filter(h => new Date(h.delivered_at) > weekAgo).length;
      const monthlyCount = history.filter(h => new Date(h.delivered_at) > monthAgo).length;

      // Category frequency
      const categoryCount: Record<string, number> = {};
      history.forEach(h => {
        const category = scriptMap.get(h.praise_script_id);
        if (category) {
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
      });

      const favoriteCategory = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as PraiseCategory || 'flirty_fun';

      // Trigger frequency
      const triggerCount: Record<string, number> = {};
      history.forEach(h => {
        triggerCount[h.trigger_event] = (triggerCount[h.trigger_event] || 0) + 1;
      });

      const mostTriggeredEvent = Object.entries(triggerCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as PraiseTriggerType || 'task_completion';

      // Reaction stats
      const reactionStats = {
        liked: history.filter(h => h.user_reaction === 'liked').length,
        loved: history.filter(h => h.user_reaction === 'loved').length,
        dismissed: history.filter(h => h.user_reaction === 'dismissed').length,
        disliked: history.filter(h => h.user_reaction === 'disliked').length
      };

      // Streak calculation (simplified)
      const sortedHistory = history.sort((a, b) => 
        new Date(b.delivered_at).getTime() - new Date(a.delivered_at).getTime()
      );

      const lastPraiseDate = sortedHistory[0]?.delivered_at || '';
      
      return {
        totalPraiseReceived: history.length,
        favoriteCategory,
        mostTriggeredEvent,
        praiseFrequency: {
          daily: dailyCount,
          weekly: weeklyCount,
          monthly: monthlyCount
        },
        reactionStats,
        streakData: {
          currentStreak: dailyCount > 0 ? 1 : 0, // Simplified
          longestStreak: Math.max(dailyCount, weeklyCount, monthlyCount),
          lastPraiseDate
        }
      };

    } catch (error) {
      console.error('Error calculating praise analytics:', error);
      return null;
    }
  }

  // Initialize default preferences for new user
  static async initializeUserPreferences(userId: string): Promise<UserPraisePreferences | null> {
    const defaultPreferences: Partial<UserPraisePreferences> = {
      preferred_categories: ['flirty_fun'],
      delivery_method: 'text',
      frequency_setting: 'normal',
      voice_enabled: false,
      voice_type: 'female_voice',
      nsfw_enabled: false,
      trigger_preferences: {}
    };

    return this.updateUserPreferences(userId, defaultPreferences);
  }

  // Quick praise delivery for specific triggers
  static async quickPraise(
    userId: string,
    triggerType: PraiseTriggerType,
    context?: Record<string, any>
  ): Promise<PraiseNotification | null> {
    return this.deliverPraise(userId, {
      triggerType,
      context
    });
  }

  // Get random praise for testing/preview
  static async getRandomPraise(
    category?: PraiseCategory,
    nsfwAllowed: boolean = false
  ): Promise<PraiseScript | null> {
    const scripts = await this.getPraiseScripts({
      category,
      nsfwAllowed,
      limit: 50
    });

    if (scripts.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * scripts.length);
    return scripts[randomIndex];
  }
}

