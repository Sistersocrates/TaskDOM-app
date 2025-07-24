// PraiseSettings.tsx - Component for managing user praise preferences

import React, { useState, useEffect } from 'react';
import { Save, Volume2, VolumeX, Settings, Heart, Zap, Users, BarChart3, Trophy, Sparkles } from 'lucide-react';
import { UserPraisePreferences, PraiseCategory, PraiseTriggerType, PRAISE_CATEGORIES, PRAISE_TRIGGERS } from '../../types/praise';
import { PraiseService } from '../../services/praiseService';
import { useUserStore } from '../../store/userStore';

interface PraiseSettingsProps {
  onSave?: (preferences: UserPraisePreferences) => void;
  className?: string;
}

export const PraiseSettings: React.FC<PraiseSettingsProps> = ({
  onSave,
  className = ''
}) => {
  const { user } = useUserStore();
  const [preferences, setPreferences] = useState<UserPraisePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewPraise, setPreviewPraise] = useState<string>('');

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let userPrefs = await PraiseService.getUserPreferences(user.id);
      
      // Initialize default preferences if none exist
      if (!userPrefs) {
        userPrefs = await PraiseService.initializeUserPreferences(user.id);
      }

      setPreferences(userPrefs);
    } catch (error) {
      console.error('Error loading praise preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !preferences) return;

    try {
      setSaving(true);
      const updated = await PraiseService.updateUserPreferences(user.id, preferences);
      if (updated) {
        setPreferences(updated);
        onSave?.(updated);
      }
    } catch (error) {
      console.error('Error saving praise preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = (updates: Partial<UserPraisePreferences>) => {
    if (!preferences) return;
    setPreferences({ ...preferences, ...updates });
  };

  const toggleCategory = (category: PraiseCategory) => {
    if (!preferences) return;
    
    const currentCategories = preferences.preferred_categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updatePreferences({ preferred_categories: newCategories });
  };

  const previewRandomPraise = async () => {
    if (!preferences?.preferred_categories?.length) return;

    try {
      const randomCategory = preferences.preferred_categories[
        Math.floor(Math.random() * preferences.preferred_categories.length)
      ];
      
      const script = await PraiseService.getRandomPraise(randomCategory, preferences.nsfw_enabled);
      if (script) {
        setPreviewPraise(script.script_text);
        setTimeout(() => setPreviewPraise(''), 4000);
      }
    } catch (error) {
      console.error('Error previewing praise:', error);
    }
  };

  const getCategoryIcon = (category: PraiseCategory) => {
    switch (category) {
      case 'dominant_dirty':
        return <Heart className="w-5 h-5" />;
      case 'flirty_fun':
        return <Sparkles className="w-5 h-5" />;
      case 'book_club':
        return <Users className="w-5 h-5" />;
      case 'analytics':
        return <BarChart3 className="w-5 h-5" />;
      case 'achievement':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Unable to load praise settings.</p>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Settings className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Praise Settings</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Customize when and how you receive praise for your reading achievements
        </p>
      </div>

      {/* Preview Section */}
      {previewPraise && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white text-center">
          <p className="text-lg font-medium">"{previewPraise}"</p>
        </div>
      )}

      {/* Praise Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Praise Categories
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose the types of praise you'd like to receive. You can select multiple categories.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(PRAISE_CATEGORIES).map(([category, info]) => {
            const isSelected = preferences.preferred_categories?.includes(category as PraiseCategory);
            const isNSFW = info.nsfw;

            return (
              <div
                key={category}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                  ${isNSFW && !preferences.nsfw_enabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => {
                  if (isNSFW && !preferences.nsfw_enabled) return;
                  toggleCategory(category as PraiseCategory);
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    p-2 rounded-lg
                    ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
                  `}>
                    {getCategoryIcon(category as PraiseCategory)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {info.label}
                      </h4>
                      {isNSFW && (
                        <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full">
                          18+
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {info.description}
                    </p>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Delivery Settings
        </h3>

        <div className="space-y-6">
          {/* Delivery Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              How would you like to receive praise?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'text', label: 'Text Only', icon: '💬' },
                { value: 'audio', label: 'Audio Only', icon: '🔊' },
                { value: 'both', label: 'Text & Audio', icon: '🎵' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updatePreferences({ delivery_method: option.value as any })}
                  className={`
                    p-3 rounded-lg border-2 text-center transition-all
                    ${preferences.delivery_method === option.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Settings */}
          {(preferences.delivery_method === 'audio' || preferences.delivery_method === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Voice Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'female_voice', label: 'Feminine Voice', icon: '👩' },
                  { value: 'male_voice', label: 'Masculine Voice', icon: '👨' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updatePreferences({ voice_type: option.value as any })}
                    className={`
                      p-3 rounded-lg border-2 text-center transition-all
                      ${preferences.voice_type === option.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Praise Frequency
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { value: 'high', label: 'High', desc: 'Frequent praise' },
                { value: 'normal', label: 'Normal', desc: 'Balanced praise' },
                { value: 'low', label: 'Low', desc: 'Occasional praise' },
                { value: 'milestone_only', label: 'Milestones', desc: 'Major achievements only' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updatePreferences({ frequency_setting: option.value as any })}
                  className={`
                    p-3 rounded-lg border-2 text-center transition-all
                    ${preferences.frequency_setting === option.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Content Settings
        </h3>

        <div className="space-y-4">
          {/* NSFW Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Adult Content (18+)
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enable spicier, more explicit praise content
              </p>
            </div>
            <button
              onClick={() => updatePreferences({ nsfw_enabled: !preferences.nsfw_enabled })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${preferences.nsfw_enabled ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${preferences.nsfw_enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Voice Enable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Voice Praise
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enable AI-generated voice praise using ElevenLabs
              </p>
            </div>
            <button
              onClick={() => updatePreferences({ voice_enabled: !preferences.voice_enabled })}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${preferences.voice_enabled ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${preferences.voice_enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={previewRandomPraise}
          disabled={!preferences.preferred_categories?.length}
          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Preview Praise
        </button>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

