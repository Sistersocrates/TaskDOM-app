import React, { useEffect, useState } from 'react';
import { Play, Loader2, Volume2, Filter, User, Users } from 'lucide-react';
import Button from './ui/Button';
import { Card, CardBody, CardHeader } from './ui/Card';
import { useVoicePraiseStore } from '../store/voicePraiseStore';
import { ElevenLabsVoice } from '../services/elevenLabsService';
import { cn } from '../utils/cn';

const VoiceSelector: React.FC = () => {
  const {
    availableVoices,
    selectedVoiceId,
    isLoading,
    isPlaying,
    error,
    loadVoices,
    setSelectedVoice,
    testVoice,
  } = useVoicePraiseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  useEffect(() => {
    if (availableVoices.length === 0) {
      loadVoices();
    }
  }, [availableVoices.length, loadVoices]);

  const filteredVoices = availableVoices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || voice.category === selectedCategory;
    
    // Gender filter
    const maleVoices = [
      'EkK5I93UQWFDigLMpZcX', 
      'G17SuINrv2H9FC6nvetn', 
      'IRHApOXLvnW57QJPQH2P', 
      'f78MbfpvmG3q9e8TMpTG',
      'rWyjfFeMZ6PxkHqD3wGC',
      'YDCfZMLWcUmsGvqHq0rS',
      'T3b0vsQ5dQwMZ5ckOwBk',
      'XTdzBt8oIEvodkwhxeA0'
    ];
    
    const isMale = maleVoices.includes(voice.voice_id);
    
    const matchesGender = genderFilter === 'all' || 
                         (genderFilter === 'male' && isMale) || 
                         (genderFilter === 'female' && !isMale);
    
    return matchesSearch && matchesCategory && matchesGender;
  });

  const categories = ['all', ...Array.from(new Set(availableVoices.map(v => v.category)))];

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  const handleTestVoice = async (voiceId: string) => {
    await testVoice(voiceId, "Hello! This is how I sound when giving you reading encouragement.");
  };

  const getVoiceGender = (voiceId: string): 'male' | 'female' => {
    const maleVoices = [
      'EkK5I93UQWFDigLMpZcX', 
      'G17SuINrv2H9FC6nvetn', 
      'IRHApOXLvnW57QJPQH2P', 
      'f78MbfpvmG3q9e8TMpTG',
      'rWyjfFeMZ6PxkHqD3wGC',
      'YDCfZMLWcUmsGvqHq0rS',
      'T3b0vsQ5dQwMZ5ckOwBk',
      'XTdzBt8oIEvodkwhxeA0'
    ];
    return maleVoices.includes(voiceId) ? 'male' : 'female';
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'flirty': return 'bg-pink-900/30 text-pink-300';
      case 'dominant': return 'bg-red-900/30 text-red-300';
      case 'wholesome': return 'bg-green-900/30 text-green-300';
      case 'playful_dom': return 'bg-purple-900/30 text-purple-300';
      case 'seductive': return 'bg-rose-900/30 text-rose-300';
      case 'confident': return 'bg-blue-900/30 text-blue-300';
      case 'mysterious': return 'bg-indigo-900/30 text-indigo-300';
      case 'passionate': return 'bg-orange-900/30 text-orange-300';
      case 'sultry': return 'bg-amber-900/30 text-amber-300';
      case 'dreamy': return 'bg-teal-900/30 text-teal-300';
      case 'dark': return 'bg-violet-900/30 text-violet-300';
      default: return 'bg-gray-800 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-2 text-white">Loading voices...</span>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-error-400 mb-4">{error}</p>
          <Button onClick={loadVoices} variant="outline">
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center text-white">
          <Volume2 className="mr-2" />
          Choose Your Voice
        </h3>
      </CardHeader>
      <CardBody>
        {/* Search and Filter */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search voices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow p-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-800 text-white"
            />
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-800 text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All', icon: Users },
                { value: 'male', label: 'Male', icon: User },
                { value: 'female', label: 'Female', icon: User }
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={genderFilter === value ? 'primary' : 'outline'}
                  onClick={() => setGenderFilter(value as any)}
                  className="flex items-center flex-1"
                  size="sm"
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Voice List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredVoices.map((voice) => (
            <div
              key={voice.voice_id}
              className={cn(
                "p-3 border rounded-lg cursor-pointer transition-all",
                selectedVoiceId === voice.voice_id
                  ? "border-primary-500 bg-primary-900/20"
                  : "border-gray-700 hover:border-primary-500/50 bg-gray-800"
              )}
              onClick={() => handleVoiceSelect(voice.voice_id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-white">{voice.name}</h4>
                    <div className="flex items-center space-x-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        getStyleColor(voice.category)
                      )}>
                        {voice.category}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-700 text-gray-300">
                        {getVoiceGender(voice.voice_id)}
                      </span>
                    </div>
                  </div>
                  {voice.description && (
                    <p className="text-xs text-gray-500 mt-1">{voice.description}</p>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestVoice(voice.voice_id);
                  }}
                  disabled={isPlaying}
                  className="ml-3 flex items-center"
                >
                  {isPlaying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredVoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No voices found matching your criteria.
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default VoiceSelector;