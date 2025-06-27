import React, { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import VoicePraiseSettings from '../components/VoicePraiseSettings';
import Button from '../components/ui/Button';
import { useVoicePraiseStore } from '../store/voicePraiseStore';
import { Loader2 } from 'lucide-react';

const VoiceSettingsPage: React.FC = () => {
  const { 
    playPraise, 
    initialize, 
    isLoading, 
    error,
    selectedVoiceId,
    testVoice 
  } = useVoicePraiseStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const testScenarios = [
    {
      id: 'session_start',
      label: 'Session Start',
      description: 'Test how the voice greets you when starting a reading session'
    },
    {
      id: 'milestone_30min',
      label: '30 Minute Milestone',
      description: 'Test milestone achievement praise'
    },
    {
      id: 'spicy_scene',
      label: 'Spicy Scene Reaction',
      description: 'Test reaction to marking a spicy scene'
    },
    {
      id: 'daily_goal',
      label: 'Daily Goal Complete',
      description: 'Test celebration of completing daily reading goal'
    }
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <span className="ml-2 text-lg">Initializing voice system...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Voice Assistant Settings</h1>
        
        {error && (
          <Card>
            <CardBody className="bg-error-50 border border-error-200">
              <p className="text-error-800">{error}</p>
            </CardBody>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Customize Your Reading Companion</h2>
          </CardHeader>
          <CardBody>
            <VoicePraiseSettings />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Test Voice Scenarios</h2>
            <p className="text-sm text-neutral-600">
              Try different scenarios to hear how your voice assistant will respond
            </p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <h3 className="font-medium mb-2">{scenario.label}</h3>
                  <p className="text-sm text-neutral-600 mb-3">{scenario.description}</p>
                  <Button
                    onClick={() => playPraise(scenario.id)}
                    disabled={!selectedVoiceId}
                    size="sm"
                    fullWidth
                  >
                    Test This Scenario
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
              <h3 className="font-medium mb-2">Custom Test</h3>
              <p className="text-sm text-neutral-600 mb-3">
                Test your voice with a custom message
              </p>
              <Button
                onClick={() => {
                  if (selectedVoiceId) {
                    testVoice(selectedVoiceId, "You're doing amazing! Keep up the great reading!");
                  }
                }}
                disabled={!selectedVoiceId}
                variant="outline"
                fullWidth
              >
                Test Custom Message
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VoiceSettingsPage;