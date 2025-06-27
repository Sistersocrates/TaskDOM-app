export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
}

interface VoiceGenerationOptions {
  voice_id: string;
  text: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

class ElevenLabsService {
  private elevenLabsEndpoint: string;
  private generateEndpoint: string;
  private supabaseKey: string;

  constructor() {
    this.elevenLabsEndpoint = 'https://cexgzhxkenpntzavnsfh.supabase.co/functions/v1/elevenlabs-voices';
    this.generateEndpoint = 'https://cexgzhxkenpntzavnsfh.supabase.co/functions/v1/elevenlabs-generate';
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!this.supabaseKey) {
      throw new Error('Supabase configuration not found in environment variables');
    }
  }

  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(this.elevenLabsEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Combine API voices with predefined voices
      const apiVoices = data.voices || [];
      const predefinedVoices = this.getPredefinedVoices();
      
      // Merge and deduplicate by voice_id
      const allVoices = [...predefinedVoices];
      apiVoices.forEach((apiVoice: ElevenLabsVoice) => {
        if (!allVoices.find(v => v.voice_id === apiVoice.voice_id)) {
          allVoices.push(apiVoice);
        }
      });

      return allVoices;
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      // Fallback to predefined voices if API fails
      return this.getPredefinedVoices();
    }
  }

  async generateSpeech(options: VoiceGenerationOptions): Promise<ArrayBuffer> {
    try {
      console.log('Generating speech with voice_id:', options.voice_id);
      
      const response = await fetch(this.generateEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voice_id: options.voice_id, // Pass the exact voice_id from user selection
          text: options.text,
          model_id: options.model_id || 'eleven_monolingual_v1',
          voice_settings: {
            stability: options.voice_settings?.stability || 0.5,
            similarity_boost: options.voice_settings?.similarity_boost || 0.75,
            style: options.voice_settings?.style || 0,
            use_speaker_boost: options.voice_settings?.use_speaker_boost || true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate speech: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      console.log('Successfully generated speech, audio buffer size:', audioBuffer.byteLength);
      
      return audioBuffer;
    } catch (error) {
      console.error('Failed to generate speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioData = await audioContext.decodeAudioData(audioBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioData;
      source.connect(audioContext.destination);
      source.start();

      return new Promise((resolve) => {
        source.onended = () => resolve();
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw new Error('Failed to play audio');
    }
  }

  async generateAndPlay(options: VoiceGenerationOptions): Promise<void> {
    console.log('Starting generateAndPlay with voice_id:', options.voice_id);
    const audioBuffer = await this.generateSpeech(options);
    await this.playAudio(audioBuffer);
    console.log('Finished playing audio');
  }

  // Predefined voice IDs for different styles
  getVoiceIdForStyle(style: 'flirty' | 'dominant' | 'wholesome'): string {
    const voiceIds = {
      flirty: 'EkK5I93UQWFDigLMpZcX', // James (male)
      dominant: 'G17SuINrv2H9FC6nvetn', // Christopher (male)
      wholesome: 'IRHApOXLvnW57QJPQH2P', // Adam (male)
    };
    return voiceIds[style];
  }

  // Get all predefined voices (male and female options)
  getPredefinedVoices(): ElevenLabsVoice[] {
    return [
      // Male voices
      {
        voice_id: 'EkK5I93UQWFDigLMpZcX',
        name: 'James',
        category: 'flirty',
        description: 'Smooth and charming male voice perfect for flirty encouragement'
      },
      {
        voice_id: 'G17SuINrv2H9FC6nvetn',
        name: 'Christopher',
        category: 'dominant',
        description: 'Strong and commanding male voice for dominant praise'
      },
      {
        voice_id: 'IRHApOXLvnW57QJPQH2P',
        name: 'Adam',
        category: 'wholesome',
        description: 'Warm and encouraging male voice for wholesome support'
      },
      {
        voice_id: 'f78MbfpvmG3q9e8TMpTG',
        name: 'Nova',
        category: 'playful_dom',
        description: 'Playful yet commanding male voice with dominant undertones'
      },
      {
        voice_id: 'rWyjfFeMZ6PxkHqD3wGC',
        name: 'Zane',
        category: 'seductive',
        description: 'Deep and seductive male voice with sultry undertones'
      },
      {
        voice_id: 'YDCfZMLWcUmsGvqHq0rS',
        name: 'Marcus',
        category: 'confident',
        description: 'Confident and assertive male voice with natural charm'
      },
      {
        voice_id: 'T3b0vsQ5dQwMZ5ckOwBk',
        name: 'Phoenix',
        category: 'mysterious',
        description: 'Mysterious and intriguing male voice with dark appeal'
      },
      {
        voice_id: 'XTdzBt8oIEvodkwhxeA0',
        name: 'Dante',
        category: 'passionate',
        description: 'Passionate and intense male voice for emotional moments'
      },
      // Female voices
      {
        voice_id: '6qL48o1LBmtR94hIYAQh',
        name: 'Monika',
        category: 'flirty',
        description: 'Sultry and playful female voice for seductive encouragement'
      },
      {
        voice_id: 'VR6AewLTigWG4xSOukaG',
        name: 'Viktoria',
        category: 'dominant',
        description: 'Confident and commanding female voice for assertive praise'
      },
      {
        voice_id: 'esy0r39YPLQjOczyOib8',
        name: 'Brittany',
        category: 'wholesome',
        description: 'Sweet and supportive female voice for gentle encouragement'
      },
      {
        voice_id: 'PB6BdkFkZLbI39GHdnbQ',
        name: 'Scarlett',
        category: 'sultry',
        description: 'Sultry and sophisticated female voice with mature appeal'
      },
      {
        voice_id: 'FeJtVBW106P4mvgGebAg',
        name: 'Luna',
        category: 'dreamy',
        description: 'Dreamy and ethereal female voice with soft sensuality'
      },
      {
        voice_id: 'cPoqAvGWCPfCfyPMwe4z',
        name: 'Raven',
        category: 'dark',
        description: 'Dark and mysterious female voice with gothic allure'
      }
    ];
  }

  // Get voice name by ID
  getVoiceNameById(voiceId: string): string {
    const voiceNames: Record<string, string> = {
      // Male voices
      'EkK5I93UQWFDigLMpZcX': 'James',
      'G17SuINrv2H9FC6nvetn': 'Christopher', 
      'IRHApOXLvnW57QJPQH2P': 'Adam',
      'f78MbfpvmG3q9e8TMpTG': 'Nova',
      'rWyjfFeMZ6PxkHqD3wGC': 'Zane',
      'YDCfZMLWcUmsGvqHq0rS': 'Marcus',
      'T3b0vsQ5dQwMZ5ckOwBk': 'Phoenix',
      'XTdzBt8oIEvodkwhxeA0': 'Dante',
      // Female voices
      '6qL48o1LBmtR94hIYAQh': 'Monika',
      'VR6AewLTigWG4xSOukaG': 'Viktoria',
      'esy0r39YPLQjOczyOib8': 'Brittany',
      'PB6BdkFkZLbI39GHdnbQ': 'Scarlett',
      'FeJtVBW106P4mvgGebAg': 'Luna',
      'cPoqAvGWCPfCfyPMwe4z': 'Raven',
    };
    return voiceNames[voiceId] || 'Unknown Voice';
  }

  // Get voices by gender
  getVoicesByGender(gender: 'male' | 'female'): ElevenLabsVoice[] {
    const predefinedVoices = this.getPredefinedVoices();
    
    if (gender === 'male') {
      return predefinedVoices.filter(voice => 
        [
          'EkK5I93UQWFDigLMpZcX', 
          'G17SuINrv2H9FC6nvetn', 
          'IRHApOXLvnW57QJPQH2P', 
          'f78MbfpvmG3q9e8TMpTG',
          'rWyjfFeMZ6PxkHqD3wGC',
          'YDCfZMLWcUmsGvqHq0rS',
          'T3b0vsQ5dQwMZ5ckOwBk',
          'XTdzBt8oIEvodkwhxeA0'
        ].includes(voice.voice_id)
      );
    } else {
      return predefinedVoices.filter(voice => 
        [
          '6qL48o1LBmtR94hIYAQh', 
          'VR6AewLTigWG4xSOukaG',
          'esy0r39YPLQjOczyOib8',
          'PB6BdkFkZLbI39GHdnbQ',
          'FeJtVBW106P4mvgGebAg',
          'cPoqAvGWCPfCfyPMwe4z'
        ].includes(voice.voice_id)
      );
    }
  }

  // Get voice by style and gender preference
  getVoiceByStyleAndGender(style: 'flirty' | 'dominant' | 'wholesome', gender?: 'male' | 'female'): string {
    const styleVoices = {
      flirty: {
        male: 'EkK5I93UQWFDigLMpZcX', // James
        female: '6qL48o1LBmtR94hIYAQh' // Monika
      },
      dominant: {
        male: 'G17SuINrv2H9FC6nvetn', // Christopher
        female: 'VR6AewLTigWG4xSOukaG' // Viktoria (different ID from Monika)
      },
      wholesome: {
        male: 'IRHApOXLvnW57QJPQH2P', // Adam
        female: 'esy0r39YPLQjOczyOib8' // Brittany
      }
    };
    
    if (gender) {
      return styleVoices[style][gender];
    }
    
    // Default to female if no gender preference
    return styleVoices[style].female;
  }
}

export const elevenLabsService = new ElevenLabsService();