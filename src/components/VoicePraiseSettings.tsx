import React from 'react';
import { Volume2, VolumeX, Clock, Loader2, FileText } from 'lucide-react';
import Button from './ui/Button';
import { useVoicePraiseStore } from '../store/voicePraiseStore';
import VoiceSelector from './VoiceSelector';
import { Link } from 'react-router-dom';

const VoicePraiseSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    replayLastPraise, 
    isPlaying, 
    error,
    selectedVoiceId,
    testVoice 
  } = useVoicePraiseStore();

  const handleTestVoice = async () => {
    if (selectedVoiceId) {
      await testVoice(selectedVoiceId, "This is how I'll encourage you during your reading sessions!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Assistant Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Voice Assistant</span>
        <Button
          variant="ghost"
          onClick={() => updateSettings({ enabled: !settings.enabled })}
          className="p-2"
        >
          {settings.enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-error-100 text-error-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Voice Selection */}
      {settings.enabled && (
        <VoiceSelector />
      )}

      {/* Voice Settings */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">Voice Style</label>
          <select
            value={settings.style}
            onChange={(e) => updateSettings({ style: e.target.value as any })}
            className="w-full p-2 border rounded-lg bg-white dark:bg-neutral-800"
            disabled={!settings.enabled}
          >
            <option value="flirty">Flirty & Fun</option>
            <option value="dominant">Dominant & Dirty</option>
            <option value="wholesome">Calm & Encouraging</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Praise Frequency</label>
          <select
            value={settings.frequency}
            onChange={(e) => updateSettings({ frequency: e.target.value as any })}
            className="w-full p-2 border rounded-lg bg-white dark:bg-neutral-800"
            disabled={!settings.enabled}
          >
            <option value="low">Low (Major milestones only)</option>
            <option value="medium">Medium (Regular encouragement)</option>
            <option value="high">High (Frequent praise)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.volume}
            onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
            className="w-full"
            disabled={!settings.enabled}
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>0%</span>
            <span>{Math.round(settings.volume * 100)}%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium flex items-center mb-2">
            <Clock size={16} className="mr-2" />
            Active Hours
          </label>
          <div className="flex space-x-4">
            <input
              type="time"
              value={settings.timeRestrictions.start}
              onChange={(e) => updateSettings({
                timeRestrictions: { ...settings.timeRestrictions, start: e.target.value }
              })}
              className="p-2 border rounded-lg"
              disabled={!settings.enabled}
            />
            <span className="self-center">to</span>
            <input
              type="time"
              value={settings.timeRestrictions.end}
              onChange={(e) => updateSettings({
                timeRestrictions: { ...settings.timeRestrictions, end: e.target.value }
              })}
              className="p-2 border rounded-lg"
              disabled={!settings.enabled}
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleTestVoice}
            disabled={!settings.enabled || isPlaying || !selectedVoiceId}
            variant="outline"
            fullWidth
            className="flex items-center justify-center"
          >
            {isPlaying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Playing...
              </>
            ) : (
              'Test Selected Voice'
            )}
          </Button>

          <Button
            onClick={replayLastPraise}
            disabled={!settings.enabled || isPlaying}
            variant="outline"
            fullWidth
          >
            Replay Last Message
          </Button>

          <Link to="/praise-customizer">
            <Button
              variant="primary"
              fullWidth
              className="flex items-center justify-center mt-4"
            >
              <FileText className="mr-2 h-4 w-4" />
              Advanced Voice Customization
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VoicePraiseSettings;