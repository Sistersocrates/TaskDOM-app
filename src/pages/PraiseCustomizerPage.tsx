import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Volume2, Play, Loader2, CheckCircle, Settings, User, Users, BookOpen, Filter, Shuffle, Sliders, FileText } from 'lucide-react';
import { useVoicePraiseStore } from '../store/voicePraiseStore';
import { useUserStore } from '../store/userStore';
import { ElevenLabsVoice } from '../services/elevenLabsService';
import { ScriptPack } from '../data/scriptPacks';
import CSVScriptBrowser from '../components/voice/CSVScriptBrowser';

const PraiseCustomizerPage: React.FC = () => {
  const {
    availableVoices,
    selectedVoiceId,
    isLoading,
    isPlaying,
    error,
    initialize,
    setSelectedVoice,
    testVoice,
    updateSettings,
    settings,
    getAvailableScripts,
    playCustomScript,
    currentScriptPack,
    refreshScriptPack
  } = useVoicePraiseStore();

  const { user } = useUserStore();

  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [styleFilter, setStyleFilter] = useState<'all' | 'flirty' | 'dominant' | 'wholesome'>('all');
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'voices' | 'scripts' | 'csv-scripts' | 'settings'>('voices');
  const [scriptFilter, setScriptFilter] = useState<'all' | 'SFW' | 'NSFW'>('all');
  const [scenarioFilter, setScenarioFilter] = useState<string>('all');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [voiceStability, setVoiceStability] = useState<number>(0.5);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    refreshScriptPack();
  }, [settings.style, user?.settings.mode, refreshScriptPack]);

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  const handleTestVoice = async (voiceId: string, voiceName: string) => {
    setTestingVoiceId(voiceId);
    try {
      await testVoice(voiceId, `Hello! I'm ${voiceName}. This is how I'll encourage you during your reading sessions. Good girl, reader!`);
    } finally {
      setTestingVoiceId(null);
    }
  };

  const handleTestScript = async (script: ScriptPack) => {
    setTestingVoiceId(script.id);
    try {
      await playCustomScript(script);
    } finally {
      setTestingVoiceId(null);
    }
  };

  const handleStyleChange = (newStyle: 'flirty' | 'dominant' | 'wholesome') => {
    updateSettings({ style: newStyle });
    // Auto-select appropriate voice for the style
    const newVoiceId = getVoiceByStyle(newStyle, genderFilter !== 'all' ? genderFilter : undefined);
    if (newVoiceId) {
      setSelectedVoice(newVoiceId);
    }
  };

  const getVoiceByStyle = (style: string, gender?: 'male' | 'female'): string | null => {
    const styleVoices = {
      flirty: {
        male: 'EkK5I93UQWFDigLMpZcX', // James
        female: '6qL48o1LBmtR94hIYAQh' // Monika
      },
      dominant: {
        male: 'G17SuINrv2H9FC6nvetn', // Christopher
        female: '6qL48o1LBmtR94hIYAQh' // Viktoria (same as Monika but different personality)
      },
      wholesome: {
        male: 'IRHApOXLvnW57QJPQH2P', // Adam
        female: 'esy0r39YPLQjOczyOib8' // Brittany
      }
    };

    const voiceOptions = styleVoices[style as keyof typeof styleVoices];
    if (!voiceOptions) return null;

    if (gender) {
      return voiceOptions[gender];
    }

    // Default to female if no gender preference
    return voiceOptions.female;
  };

  const getFilteredVoices = () => {
    let filtered = availableVoices;

    // Filter by gender
    if (genderFilter === 'male') {
      filtered = filtered.filter(voice => 
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
    } else if (genderFilter === 'female') {
      filtered = filtered.filter(voice => 
        [
          '6qL48o1LBmtR94hIYAQh', 
          'esy0r39YPLQjOczyOib8',
          'PB6BdkFkZLbI39GHdnbQ',
          'FeJtVBW106P4mvgGebAg',
          'cPoqAvGWCPfCfyPMwe4z'
        ].includes(voice.voice_id)
      );
    }

    // Filter by style
    if (styleFilter !== 'all') {
      filtered = filtered.filter(voice => voice.category === styleFilter);
    }

    return filtered;
  };

  const getFilteredScripts = () => {
    const userNsfwLevel = user?.settings.mode === 'sfw' ? 'SFW' : 'NSFW';
    let filtered = getAvailableScripts(settings.style, userNsfwLevel);

    // Filter by NSFW level
    if (scriptFilter !== 'all') {
      filtered = filtered.filter(script => script.nsfw_level === scriptFilter);
    }

    // Filter by scenario
    if (scenarioFilter !== 'all') {
      filtered = filtered.filter(script => 
        script.scenario.toLowerCase().includes(scenarioFilter.toLowerCase())
      );
    }

    return filtered;
  };

  const getUniqueScenarios = () => {
    const scripts = getAvailableScripts();
    const scenarios = [...new Set(scripts.map(script => script.scenario))];
    return scenarios.sort();
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

  const getNSFWColor = (level: 'SFW' | 'NSFW') => {
    return level === 'NSFW' ? 'bg-error-900/30 text-error-300' : 'bg-success-900/30 text-success-300';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
              <p className="text-lg text-gray-400">Loading voice options...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center text-white">
              <Volume2 className="mr-3" />
              Praise Customizer
            </h1>
            <p className="text-gray-400 mt-2">
              Choose your perfect reading companion voice and explore available praise scripts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">
              Voice Assistant {settings.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card>
            <CardBody className="bg-error-900/20 border border-error-500/30">
              <p className="text-error-300">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Current Selection */}
        {selectedVoiceId && (
          <Card>
            <CardBody className="bg-primary-900/20 border border-primary-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary-400" />
                  <div>
                    <p className="font-medium text-primary-300">
                      Current Voice: {availableVoices.find(v => v.voice_id === selectedVoiceId)?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-primary-400">
                      Style: {settings.style} • Mode: {user?.settings.mode?.toUpperCase() || 'NSFW'} • {currentScriptPack.length} scripts available
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const voice = availableVoices.find(v => v.voice_id === selectedVoiceId);
                    if (voice) handleTestVoice(selectedVoiceId, voice.name);
                  }}
                  disabled={isPlaying}
                  variant="outline"
                  className="border-primary-500/30 text-primary-400 hover:bg-primary-900/30"
                >
                  {testingVoiceId === selectedVoiceId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Tab Navigation */}
        <Card>
          <CardBody className="p-0">
            <div className="flex border-b border-red-900/30">
              <button
                onClick={() => setActiveTab('voices')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'voices'
                    ? 'border-b-2 border-primary-500 text-primary-400 bg-primary-900/20'
                    : 'text-gray-400 hover:text-primary-400 hover:bg-gray-800'
                }`}
              >
                <Volume2 className="h-5 w-5 mx-auto mb-1" />
                Voice Selection
              </button>
              <button
                onClick={() => setActiveTab('scripts')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'scripts'
                    ? 'border-b-2 border-primary-500 text-primary-400 bg-primary-900/20'
                    : 'text-gray-400 hover:text-primary-400 hover:bg-gray-800'
                }`}
              >
                <BookOpen className="h-5 w-5 mx-auto mb-1" />
                Script Library ({currentScriptPack.length})
              </button>
              <button
                onClick={() => setActiveTab('csv-scripts')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'csv-scripts'
                    ? 'border-b-2 border-primary-500 text-primary-400 bg-primary-900/20'
                    : 'text-gray-400 hover:text-primary-400 hover:bg-gray-800'
                }`}
              >
                <FileText className="h-5 w-5 mx-auto mb-1" />
                CSV Scripts
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-primary-500 text-primary-400 bg-primary-900/20'
                    : 'text-gray-400 hover:text-primary-400 hover:bg-gray-800'
                }`}
              >
                <Sliders className="h-5 w-5 mx-auto mb-1" />
                Voice Settings
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Voice Selection Tab */}
        {activeTab === 'voices' && (
          <>
            {/* Voice Style Selection */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">Choose Your Style</h2>
                <p className="text-gray-400">Select the personality that matches your preference</p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { 
                      value: 'flirty', 
                      label: 'Flirty & Fun', 
                      description: 'Playful, seductive, and encouraging',
                      icon: '😘'
                    },
                    { 
                      value: 'dominant', 
                      label: 'Dominant & Commanding', 
                      description: 'Strong, assertive, and demanding',
                      icon: '🔥'
                    },
                    { 
                      value: 'wholesome', 
                      label: 'Calm & Supportive', 
                      description: 'Gentle, warm, and nurturing',
                      icon: '🤗'
                    }
                  ].map((style) => (
                    <div
                      key={style.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        settings.style === style.value
                          ? 'border-primary-500 bg-primary-900/20 ring-2 ring-primary-500/30'
                          : 'border-gray-700 hover:border-primary-500/50 bg-gray-800'
                      }`}
                      onClick={() => handleStyleChange(style.value as any)}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{style.icon}</div>
                        <h3 className="font-semibold text-lg text-white mb-1">{style.label}</h3>
                        <p className="text-sm text-gray-400">{style.description}</p>
                        {settings.style === style.value && (
                          <div className="flex items-center justify-center text-primary-400 text-sm font-medium mt-2">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Selected
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Voice Filters */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">Filter Voices</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gender Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Voice Gender
                    </label>
                    <div className="flex space-x-2">
                      {[
                        { value: 'all', label: 'All Voices', icon: Users },
                        { value: 'male', label: 'Male', icon: User },
                        { value: 'female', label: 'Female', icon: User }
                      ].map(({ value, label, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={genderFilter === value ? 'primary' : 'outline'}
                          onClick={() => setGenderFilter(value as any)}
                          className="flex items-center"
                          size="sm"
                        >
                          <Icon className="h-4 w-4 mr-1" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Style Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Voice Style
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'all', label: 'All Styles' },
                        { value: 'flirty', label: 'Flirty' },
                        { value: 'dominant', label: 'Dominant' },
                        { value: 'wholesome', label: 'Wholesome' },
                        { value: 'playful_dom', label: 'Playful Dom' },
                        { value: 'seductive', label: 'Seductive' },
                        { value: 'confident', label: 'Confident' },
                        { value: 'mysterious', label: 'Mysterious' },
                        { value: 'passionate', label: 'Passionate' },
                        { value: 'sultry', label: 'Sultry' },
                        { value: 'dreamy', label: 'Dreamy' },
                        { value: 'dark', label: 'Dark' }
                      ].map(({ value, label }) => (
                        <Button
                          key={value}
                          variant={styleFilter === value ? 'primary' : 'outline'}
                          onClick={() => setStyleFilter(value as any)}
                          size="sm"
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Voice Selection Grid */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">Choose Your Voice</h2>
                <p className="text-gray-400">
                  Select a voice that matches your preference and style
                </p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredVoices().map((voice) => (
                    <div
                      key={voice.voice_id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedVoiceId === voice.voice_id
                          ? 'border-primary-500 bg-primary-900/20 ring-2 ring-primary-500/30'
                          : 'border-gray-700 hover:border-primary-500/50 bg-gray-800'
                      }`}
                      onClick={() => handleVoiceSelect(voice.voice_id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-lg text-white">{voice.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStyleColor(voice.category)}`}>
                              {voice.category}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-700 text-gray-300">
                              {getVoiceGender(voice.voice_id)}
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestVoice(voice.voice_id, voice.name);
                          }}
                          disabled={isPlaying}
                          variant="outline"
                          size="sm"
                          className="ml-2"
                        >
                          {testingVoiceId === voice.voice_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {voice.description && (
                        <p className="text-sm text-gray-400 mb-3">
                          {voice.description}
                        </p>
                      )}
                      
                      {selectedVoiceId === voice.voice_id && (
                        <div className="flex items-center text-primary-400 text-sm font-medium">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {getFilteredVoices().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No voices found matching your filters.</p>
                    <p className="text-sm">Try adjusting your filter settings.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        )}

        {/* Script Library Tab */}
        {activeTab === 'scripts' && (
          <>
            {/* Script Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Script Library</h2>
                  <Button
                    onClick={refreshScriptPack}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Shuffle className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* NSFW Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content Level
                    </label>
                    <select
                      value={scriptFilter}
                      onChange={(e) => setScriptFilter(e.target.value as any)}
                      className="w-full p-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-800 text-white"
                    >
                      <option value="all">All Content</option>
                      <option value="SFW">Safe for Work</option>
                      <option value="NSFW">Adults Only</option>
                    </select>
                  </div>

                  {/* Scenario Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Scenario Type
                    </label>
                    <select
                      value={scenarioFilter}
                      onChange={(e) => setScenarioFilter(e.target.value)}
                      className="w-full p-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-800 text-white"
                    >
                      <option value="all">All Scenarios</option>
                      {getUniqueScenarios().map(scenario => (
                        <option key={scenario} value={scenario}>{scenario}</option>
                      ))}
                    </select>
                  </div>

                  {/* Current Style Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Style
                    </label>
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStyleColor(settings.style)}`}>
                        {settings.style}
                      </span>
                      <span className="ml-2 text-sm text-gray-400">
                        {getFilteredScripts().length} scripts
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Script Grid */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">Available Scripts</h2>
                <p className="text-gray-400">
                  Test different praise scripts to find your favorites
                </p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredScripts().map((script) => (
                    <div
                      key={script.id}
                      className="p-4 border border-gray-700 rounded-lg hover:border-primary-500/50 transition-all bg-gray-800"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStyleColor(script.tone)}`}>
                              {script.tone}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getNSFWColor(script.nsfw_level)}`}>
                              {script.nsfw_level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{script.scenario}</p>
                        </div>
                        
                        <Button
                          onClick={() => handleTestScript(script)}
                          disabled={isPlaying || !selectedVoiceId}
                          variant="outline"
                          size="sm"
                        >
                          {testingVoiceId === script.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      <blockquote className="text-sm italic text-gray-300 border-l-4 border-primary-500/30 pl-3">
                        "{script.text}"
                      </blockquote>
                    </div>
                  ))}
                </div>

                {getFilteredScripts().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No scripts found matching your filters.</p>
                    <p className="text-sm">Try adjusting your filter settings or changing your voice style.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        )}

        {/* CSV Scripts Tab */}
        {activeTab === 'csv-scripts' && (
          <CSVScriptBrowser />
        )}

        {/* Voice Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">Voice Settings</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Enable/Disable Voice */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Voice Assistant</h3>
                  <p className="text-sm text-gray-400">
                    Enable or disable voice encouragement during reading
                  </p>
                </div>
                <Button
                  variant={settings.enabled ? 'primary' : 'outline'}
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                >
                  {settings.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              {/* Volume Control */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  disabled={!settings.enabled}
                />
              </div>

              {/* Voice Speed Control */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Voice Speed: {voiceSpeed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  disabled={!settings.enabled}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5x (Slow)</span>
                  <span>1.0x (Normal)</span>
                  <span>2.0x (Fast)</span>
                </div>
              </div>

              {/* Voice Stability Control */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Voice Stability: {Math.round(voiceStability * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceStability}
                  onChange={(e) => setVoiceStability(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  disabled={!settings.enabled}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0% (Variable)</span>
                  <span>50% (Balanced)</span>
                  <span>100% (Consistent)</span>
                </div>
              </div>

              {/* Frequency Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Praise Frequency
                </label>
                <select
                  value={settings.frequency}
                  onChange={(e) => updateSettings({ frequency: e.target.value as any })}
                  className="w-full p-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-800 text-white"
                  disabled={!settings.enabled}
                >
                  <option value="low">Low - Major milestones only</option>
                  <option value="medium">Medium - Regular encouragement</option>
                  <option value="high">High - Frequent praise</option>
                </select>
              </div>

              {/* Time Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Active Hours
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="time"
                      value={settings.timeRestrictions.start}
                      onChange={(e) => updateSettings({
                        timeRestrictions: { ...settings.timeRestrictions, start: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
                      disabled={!settings.enabled}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="time"
                      value={settings.timeRestrictions.end}
                      onChange={(e) => updateSettings({
                        timeRestrictions: { ...settings.timeRestrictions, end: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
                      disabled={!settings.enabled}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Voice messages will only play during these hours
                </p>
              </div>

              {/* Test Voice with Current Settings */}
              <div className="pt-4 border-t border-gray-700">
                <Button
                  onClick={() => {
                    if (selectedVoiceId) {
                      const voice = availableVoices.find(v => v.voice_id === selectedVoiceId);
                      if (voice) {
                        handleTestVoice(selectedVoiceId, voice.name);
                      }
                    }
                  }}
                  disabled={!selectedVoiceId || isPlaying || !settings.enabled}
                  className="w-full"
                >
                  {isPlaying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Voice...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Test Voice with Current Settings
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default PraiseCustomizerPage;