import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Clock, Mic, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardBody } from '../components/ui/Card';
import { useUserStore } from '../store/userStore';
import { VoiceStyle } from '../types';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { user } = useUserStore();
  const [formData, setFormData] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    readingGoal: {
      type: 'minutes' as const,
      amount: 30
    },
    voiceStyle: 'flirty' as VoiceStyle,
    isSFW: false,
    mood: ''
  });

  const handleSubmit = async () => {
    // Save onboarding data
    await useUserStore.getState().updateSettings({
      mode: formData.isSFW ? 'sfw' : 'nsfw',
      voiceProfile: formData.voiceStyle
    });
    navigate('/home');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Welcome to TaskDOM{formData.firstName ? `, ${formData.firstName}` : ''}!</h2>
            <p className="text-lg text-neutral-600">
              Let's personalize your reading experience. First, let's set your daily reading goal.
            </p>
            <div className="space-y-4">
              <Input
                type="text"
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  firstName: e.target.value
                }))}
                placeholder="Your first name"
              />
              <select
                value={formData.readingGoal.type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  readingGoal: { ...prev.readingGoal, type: e.target.value as 'minutes' | 'pages' }
                }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="minutes">Minutes per day</option>
                <option value="pages">Pages per day</option>
              </select>
              <Input
                type="number"
                value={formData.readingGoal.amount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  readingGoal: { ...prev.readingGoal, amount: parseInt(e.target.value) }
                }))}
                label="Daily Goal"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Choose Your Voice Assistant</h2>
            <p className="text-lg text-neutral-600">
              Select how you'd like your reading companion to encourage you.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'flirty', label: 'Flirty & Fun 😘', description: 'Playful and encouraging' },
                { id: 'dominant', label: 'Dominant 🥵', description: 'Strict and demanding' },
                { id: 'wholesome', label: 'Calm & Sweet 🧘', description: 'Gentle and supportive' },
                { id: 'neutral', label: 'Professional 🤖', description: 'Clean and focused' }
              ].map((style) => (
                <Card
                  key={style.id}
                  className={`cursor-pointer transition-all ${
                    formData.voiceStyle === style.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, voiceStyle: style.id as VoiceStyle }))}
                >
                  <CardBody>
                    <h3 className="font-bold">{style.label}</h3>
                    <p className="text-sm text-neutral-600">{style.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Content Preferences</h2>
            <p className="text-lg text-neutral-600">
              Let us know how you'd like to experience the app.
            </p>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isSFW}
                  onChange={(e) => setFormData(prev => ({ ...prev, isSFW: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-primary-500"
                />
                <span>Enable Safe-for-Work Mode</span>
              </label>
              <p className="text-sm text-neutral-500">
                This will filter out explicit content and use professional voice lines.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Quick Mood Quiz (Optional)</h2>
            <p className="text-lg text-neutral-600">
              Help us recommend the perfect books for your current mood.
            </p>
            <div className="space-y-4">
              <select
                value={formData.mood}
                onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select your current mood...</option>
                <option value="romantic">Feeling Romantic 💕</option>
                <option value="adventurous">Ready for Adventure 🗺️</option>
                <option value="spicy">Feeling Spicy 🌶️</option>
                <option value="emotional">Emotional 🥺</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardBody>
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {[
              { icon: Book, label: 'Goals' },
              { icon: Mic, label: 'Voice' },
              { icon: Shield, label: 'Privacy' },
              { icon: Clock, label: 'Mood' }
            ].map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center ${
                  i + 1 === step ? 'text-primary-500' : 'text-neutral-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  i + 1 === step ? 'bg-primary-500 text-white' : 'bg-neutral-200'
                }`}>
                  <s.icon size={20} />
                </div>
                <span className="text-sm">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(prev => prev - 1)}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (step < 4) {
                  setStep(prev => prev + 1);
                } else {
                  handleSubmit();
                }
              }}
            >
              {step === 4 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OnboardingPage;