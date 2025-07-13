import { create } from 'zustand';
import { VoiceSettings, VoiceTriggerType, VoiceScript } from '../types/voice';
import { elevenLabsService, ElevenLabsVoice } from '../services/elevenLabsService';
import { scriptPacks, getScriptsForEvent, getRandomScript, ScriptPack } from '../data/scriptPacks';
import { useUserStore } from './userStore';

interface VoicePraiseState {
  settings: VoiceSettings;
  availableVoices: ElevenLabsVoice[];
  selectedVoiceId: string | null;
  lastPraise: VoiceScript | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentScriptPack: ScriptPack[];
  voiceSpeed: number;
  voiceStability: number;
  initialize: () => Promise<void>;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  setSelectedVoice: (voiceId: string) => void;
  setVoiceSpeed: (speed: number) => void;
  setVoiceStability: (stability: number) => void;
  playPraise: (triggerType: VoiceTriggerType | string) => Promise<void>;
  playCustomScript: (script: ScriptPack) => Promise<void>;
  playCSVScript: (script: CSVScript) => Promise<void>;
  replayLastPraise: () => Promise<void>;
  loadVoices: () => Promise<void>;
  testVoice: (voiceId: string, text?: string) => Promise<void>;
  saveUserPreferences: () => Promise<void>;
  loadUserPreferences: () => Promise<void>;
  getAvailableScripts: (voiceStyle?: string, nsfwLevel?: 'SFW' | 'NSFW') => ScriptPack[];
  refreshScriptPack: () => void;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: true,
  style: 'flirty',
  volume: 1.0,
  frequency: 'medium',
  timeRestrictions: {
    start: '09:00',
    end: '22:00'
  }
};

export const useVoicePraiseStore = create<VoicePraiseState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  availableVoices: [],
  selectedVoiceId: null,
  lastPraise: null,
  isPlaying: false,
  isLoading: false,
  error: null,
  currentScriptPack: [],
  voiceSpeed: 1.0,
  voiceStability: 0.5,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Load user preferences first
      await get().loadUserPreferences();
      
      // Load available voices
      await get().loadVoices();
      
      // Set default voice if none selected
      const { selectedVoiceId, settings } = get();
      if (!selectedVoiceId) {
        const defaultVoiceId = elevenLabsService.getVoiceIdForStyle(settings.style);
        set({ selectedVoiceId: defaultVoiceId });
        // Save the default selection
        setTimeout(() => get().saveUserPreferences(), 100);
      }

      // Load initial script pack
      get().refreshScriptPack();
    } catch (error) {
      console.error('Failed to initialize voice service:', error);
      set({ error: 'Failed to initialize voice service. Please check your connection.' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadVoices: async () => {
    try {
      set({ error: null });
      const voices = await elevenLabsService.getAvailableVoices();
      set({ availableVoices: voices });
    } catch (error) {
      console.error('Failed to load voices:', error);
      set({ error: 'Failed to load available voices. Please try again later.' });
      
      // Fallback to predefined voices if API fails
      const fallbackVoices = elevenLabsService.getPredefinedVoices();
      set({ availableVoices: fallbackVoices });
    }
  },

  updateSettings: (newSettings) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      
      // Update selected voice if style changed
      if (newSettings.style && newSettings.style !== state.settings.style) {
        const newVoiceId = elevenLabsService.getVoiceIdForStyle(newSettings.style);
        // Save preferences after updating
        setTimeout(() => get().saveUserPreferences(), 100);
        // Refresh script pack for new style
        setTimeout(() => get().refreshScriptPack(), 100);
        return {
          settings: updatedSettings,
          selectedVoiceId: newVoiceId
        };
      }
      
      // Save preferences after updating
      setTimeout(() => get().saveUserPreferences(), 100);
      // Refresh script pack if settings changed
      setTimeout(() => get().refreshScriptPack(), 100);
      return { settings: updatedSettings };
    });
  },

  setSelectedVoice: (voiceId: string) => {
    set({ selectedVoiceId: voiceId });
    // Save preferences after updating
    setTimeout(() => get().saveUserPreferences(), 100);
  },

  setVoiceSpeed: (speed: number) => {
    set({ voiceSpeed: speed });
    setTimeout(() => get().saveUserPreferences(), 100);
  },

  setVoiceStability: (stability: number) => {
    set({ voiceStability: stability });
    setTimeout(() => get().saveUserPreferences(), 100);
  },

  testVoice: async (voiceId: string, text = "Hello! This is a test of your selected voice.") => {
    const { isPlaying, voiceSpeed, voiceStability, settings } = get();
    if (isPlaying) return;

    try {
      set({ isPlaying: true, error: null });
      
      await elevenLabsService.generateAndPlay({
        voice_id: voiceId,
        text,
        voice_settings: {
          stability: voiceStability,
          similarity_boost: 0.75,
          style: voiceSpeed > 1.0 ? 0.2 : 0,
          use_speaker_boost: true,
        },
      });
    } catch (error) {
      console.error('Failed to test voice:', error);
      set({ error: 'Failed to play voice test. Please try again.' });
    } finally {
      set({ isPlaying: false });
    }
  },

  playPraise: async (triggerType: VoiceTriggerType | string) => {
    const { settings, selectedVoiceId, isPlaying, voiceSpeed, voiceStability } = get();
    
    // Check if voice is enabled and we have a selected voice
    if (!settings.enabled || isPlaying || !selectedVoiceId) {
      console.log('Voice praise skipped:', { 
        enabled: settings.enabled, 
        isPlaying, 
        hasVoiceId: !!selectedVoiceId 
      });
      return;
    }

    // Check time restrictions
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    if (currentTime < settings.timeRestrictions.start || 
        currentTime > settings.timeRestrictions.end) {
      console.log('Voice praise skipped due to time restrictions');
      return;
    }

    try {
      set({ isPlaying: true, error: null });
      
      let text: string;
      let script: VoiceScript | null = null;

      // Get user's NSFW preference
      const userStore = useUserStore.getState();
      const nsfwLevel = userStore.user?.settings.mode === 'sfw' ? 'SFW' : 'NSFW';

      // First try to get script from CSV scripts
      const csvEventScripts = getCSVScriptsForEvent(
        triggerType as any, 
        settings.style, 
        nsfwLevel
      );

      if (csvEventScripts.length > 0) {
        const selectedScript = csvEventScripts[Math.floor(Math.random() * csvEventScripts.length)];
        text = selectedScript.script;
        script = {
          id: selectedScript.id,
          text: selectedScript.script,
          triggerType: triggerType as VoiceTriggerType,
          style: settings.style
        };
        console.log('Using CSV script:', selectedScript.id);
      } else {
        // Fall back to original scripts
        const eventScripts = getScriptsForEvent(
          triggerType as any, 
          settings.style, 
          nsfwLevel
        );

        if (eventScripts.length > 0) {
          const selectedScript = eventScripts[Math.floor(Math.random() * eventScripts.length)];
          text = selectedScript.text;
          script = {
            id: selectedScript.id,
            text: selectedScript.text,
            triggerType: triggerType as VoiceTriggerType,
            style: settings.style
          };
          console.log('Using original script:', selectedScript.id);
        } else {
          // Fallback to random script or custom text
          const randomScript = getRandomScript(settings.style, nsfwLevel);
          if (randomScript) {
            text = randomScript.text;
            script = {
              id: randomScript.id,
              text: randomScript.text,
              triggerType: triggerType as VoiceTriggerType,
              style: settings.style
            };
            console.log('Using random script:', randomScript.id);
          } else {
            // Ultimate fallback to the trigger type as text
            text = typeof triggerType === 'string' ? triggerType : 'Good job!';
            console.log('Using fallback text');
          }
        }
      }

      console.log('Playing praise:', { 
        voiceId: selectedVoiceId, 
        text: text.substring(0, 50) + '...', 
        triggerType,
        speed: voiceSpeed,
        stability: voiceStability
      });

      // Use the user's selected voice_id for generation with custom settings
      await elevenLabsService.generateAndPlay({
        voice_id: selectedVoiceId,
        text,
        voice_settings: {
          stability: voiceStability,
          similarity_boost: 0.75,
          style: voiceSpeed > 1.0 ? 0.2 : 0,
          use_speaker_boost: true,
        },
      });

      if (script) {
        set({ lastPraise: script });
      }
    } catch (error) {
      console.error('Failed to play praise:', error);
      set({ error: 'Failed to play voice message. Please check your connection.' });
    } finally {
      set({ isPlaying: false });
    }
  },

  playCustomScript: async (script: ScriptPack) => {
    const { settings, selectedVoiceId, isPlaying, voiceSpeed, voiceStability } = get();
    if (!settings.enabled || isPlaying || !selectedVoiceId) return;

    try {
      set({ isPlaying: true, error: null });

      console.log('Playing custom script:', { 
        voiceId: selectedVoiceId, 
        text: script.text.substring(0, 50) + '...',
        speed: voiceSpeed,
        stability: voiceStability
      });

      // Use the user's selected voice_id for generation with custom settings
      await elevenLabsService.generateAndPlay({
        voice_id: selectedVoiceId,
        text: script.text,
        voice_settings: {
          stability: voiceStability,
          similarity_boost: 0.75,
          style: voiceSpeed > 1.0 ? 0.2 : 0,
          use_speaker_boost: true,
        },
      });

      const voiceScript: VoiceScript = {
        id: script.id,
        text: script.text,
        triggerType: 'session_start', // Default trigger type
        style: settings.style
      };

      set({ lastPraise: voiceScript });
    } catch (error) {
      console.error('Failed to play custom script:', error);
      set({ error: 'Failed to play voice message. Please check your connection.' });
    } finally {
      set({ isPlaying: false });
    }
  },

  playCSVScript: async (script: CSVScript) => {
    const { settings, selectedVoiceId, isPlaying, voiceSpeed, voiceStability } = get();
    if (!settings.enabled || isPlaying || !selectedVoiceId) return;

    try {
      set({ isPlaying: true, error: null });

      console.log('Playing CSV script:', { 
        voiceId: selectedVoiceId, 
        text: script.script.substring(0, 50) + '...',
        speed: voiceSpeed,
        stability: voiceStability
      });

      // Use the user's selected voice_id for generation with custom settings
      await elevenLabsService.generateAndPlay({
        voice_id: selectedVoiceId,
        text: script.script,
        voice_settings: {
          stability: voiceStability,
          similarity_boost: 0.75,
          style: voiceSpeed > 1.0 ? 0.2 : 0,
          use_speaker_boost: true,
        },
      });

      const voiceScript: VoiceScript = {
        id: script.id,
        text: script.script,
        triggerType: 'session_start', // Default trigger type
        style: settings.style
      };

      set({ lastPraise: voiceScript });
    } catch (error) {
      console.error('Failed to play CSV script:', error);
      set({ error: 'Failed to play voice message. Please check your connection.' });
    } finally {
      set({ isPlaying: false });
    }
  },

  replayLastPraise: async () => {
    const { lastPraise, selectedVoiceId, settings, isPlaying, voiceSpeed, voiceStability } = get();
    if (!lastPraise || !selectedVoiceId || !settings.enabled || isPlaying) return;

    try {
      set({ isPlaying: true, error: null });

      console.log('Replaying last praise:', { 
        voiceId: selectedVoiceId, 
        text: lastPraise.text.substring(0, 50) + '...',
        speed: voiceSpeed,
        stability: voiceStability
      });

      // Use the user's selected voice_id for replay with custom settings
      await elevenLabsService.generateAndPlay({
        voice_id: selectedVoiceId,
        text: lastPraise.text,
        voice_settings: {
          stability: voiceStability,
          similarity_boost: 0.75,
          style: voiceSpeed > 1.0 ? 0.2 : 0,
          use_speaker_boost: true,
        },
      });
    } catch (error) {
      console.error('Failed to replay praise:', error);
      set({ error: 'Failed to replay voice message. Please check your connection.' });
    } finally {
      set({ isPlaying: false });
    }
  },

  saveUserPreferences: async () => {
    try {
      const { settings, selectedVoiceId, voiceSpeed, voiceStability } = get();
      const preferences = {
        settings,
        selectedVoiceId,
        voiceSpeed,
        voiceStability,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('voicePraisePreferences', JSON.stringify(preferences));
      console.log('Saved voice preferences:', { 
        selectedVoiceId, 
        style: settings.style,
        speed: voiceSpeed,
        stability: voiceStability
      });
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  },

  loadUserPreferences: async () => {
    try {
      const saved = localStorage.getItem('voicePraisePreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        set({
          settings: { ...DEFAULT_SETTINGS, ...preferences.settings },
          selectedVoiceId: preferences.selectedVoiceId,
          voiceSpeed: preferences.voiceSpeed || 1.0,
          voiceStability: preferences.voiceStability || 0.5
        });
        console.log('Loaded voice preferences:', { 
          selectedVoiceId: preferences.selectedVoiceId, 
          style: preferences.settings?.style,
          speed: preferences.voiceSpeed,
          stability: preferences.voiceStability
        });
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  },

  getAvailableScripts: (voiceStyle?: string, nsfwLevel: 'SFW' | 'NSFW' = 'SFW') => {
    const { settings } = get();
    const style = voiceStyle || settings.style;
    
    // Get user's NSFW preference if not specified
    const userStore = useUserStore.getState();
    const userNsfwLevel = userStore.user?.settings.mode === 'sfw' ? 'SFW' : 'NSFW';
    const finalNsfwLevel = nsfwLevel || userNsfwLevel;

    const toneMap = {
      flirty: [
        'Flirty & Fun', 
        'Wholesome & Flirty',
        'Cheeky Praise & Dirty Puns',
        'Sassy, Pun-Filled Encouragement',
        'Mini Praise Clips',
        'Bookish Flirt Tropes'
      ],
      dominant: [
        'Dominant', 
        'Dark Fantasy / Villain Energy', 
        'Soft & Seductive',
        'Achievement-Based Praise',
        'Short Phrases for Button Sounds'
      ],
      wholesome: [
        'Wholesome & Flirty', 
        'Neutral Assistant', 
        'Neutral Voice with Light Humor',
        'Gentler but still cute and spicy'
      ]
    };
    
    const relevantTones = toneMap[style as keyof typeof toneMap] || [];
    
    return scriptPacks.filter(script => 
      relevantTones.some(tone => script.tone.includes(tone) || script.scenario.includes(tone)) &&
      script.nsfw_level === finalNsfwLevel
    );
  },

  refreshScriptPack: () => {
    const { settings } = get();
    const userStore = useUserStore.getState();
    const nsfwLevel = userStore.user?.settings.mode === 'sfw' ? 'SFW' : 'NSFW';
    
    const availableScripts = get().getAvailableScripts(settings.style, nsfwLevel);
    set({ currentScriptPack: availableScripts });
  }
}));