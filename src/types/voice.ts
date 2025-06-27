import { VoiceStyle } from './index';

export interface VoiceScript {
  id: string;
  text: string;
  triggerType: VoiceTriggerType;
  style: VoiceStyle;
}

export type VoiceTriggerType = 
  | 'session_start'
  | 'session_end'
  | 'milestone_15min'
  | 'milestone_30min'
  | 'milestone_60min'
  | 'progress_25'
  | 'progress_50'
  | 'progress_75'
  | 'progress_100'
  | 'spicy_scene'
  | 'task_complete'
  | 'daily_goal'
  | 'streak';

export interface VoiceSettings {
  enabled: boolean;
  style: VoiceStyle;
  volume: number;
  frequency: 'low' | 'medium' | 'high';
  timeRestrictions: {
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}