// PraiseLibraryPage.tsx - Page for managing and testing praise scripts

import React, { useState, useEffect } from 'react';
import { Play, Settings, Heart, Sparkles, Users, BarChart3, Trophy, Zap, Filter, Search } from 'lucide-react';
import { PraiseScript, PraiseCategory, PRAISE_CATEGORIES, PRAISE_TRIGGERS } from '../types/praise';
import { PraiseService } from '../services/praiseService';
import { PraiseSettings } from '../components/praise/PraiseSettings';
import { usePraiseContext } from '../components/praise/PraiseProvider';
import MainLayout from '../components/layout/MainLayout';

export const PraiseLibraryPage: React.FC = () => {
  const [scripts, setScripts] = useState<PraiseScript[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<PraiseScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PraiseCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [nsfwFilter, setNsfwFilter] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const { preferences, triggerPraise } = usePraiseContext();

  useEffect(() => {
    loadScripts();
  }, []);

  useEffect(() => {
    filterScripts();
  }, [scripts, selectedCategory, searchTerm, nsfwFilter]);

  const loadScripts = async () => {
    try {
      setLoading(true);
      const allScripts = await PraiseService.getPraiseScripts({
        nsfwAllowed: true, // Load all scripts for library view
        limit: 1000
      });
      setScripts(allScripts);
    } catch (error) {
      console.error('Error loading praise scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterScripts = () => {
    let filtered = scripts;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(script => script.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(script =>
        script.script_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.sub_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.vibe_tone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // NSFW filter
    if (!nsfwFilter) {
      filtered = filtered.filter(script => !script.is_nsfw);
    }

    setFilteredScripts(filtered);
  };

  const testPraise = async (script: PraiseScript) => {
    try {
      await triggerPraise(script.trigger_type, {
        test: true,
        script_id: script.id
      });
    } catch (error) {
      console.error('Error testing praise:', error);
    }
  };

  const playAudio = async (script: PraiseScript) => {
    if (!script.audio_url) return;

    try {
      setPlayingAudio(script.id);
      const audio = new Audio(script.audio_url);
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => setPlayingAudio(null);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
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

  const getCategoryColor = (category: PraiseCategory) => {
    switch (category) {
      case 'dominant_dirty':
        return 'from-red-500 to-pink-600';
      case 'flirty_fun':
        return 'from-pink-400 to-purple-500';
      case 'book_club':
        return 'from-blue-400 to-indigo-500';
      case 'analytics':
        return 'from-green-400 to-teal-500';
      case 'achievement':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-purple-400 to-pink-500';
    }
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => setShowSettings(false)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Library
            </button>
          </div>
          <PraiseSettings />
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Praise Library
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore and customize your praise experience. Test different praise styles and configure your preferences.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search praise scripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as PraiseCategory | 'all')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {Object.entries(PRAISE_CATEGORIES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>

              {/* NSFW Filter */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={nsfwFilter}
                  onChange={(e) => setNsfwFilter(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include 18+</span>
              </label>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600">{filteredScripts.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available Scripts</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-pink-600">
              {Object.keys(PRAISE_CATEGORIES).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600">
              {preferences?.preferred_categories?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Your Preferences</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600">
              {filteredScripts.filter(s => s.audio_url).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">With Audio</div>
          </div>
        </div>

        {/* Scripts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScripts.map((script) => (
              <div
                key={script.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${getCategoryColor(script.category)} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-white">
                        {getCategoryIcon(script.category)}
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm">
                          {PRAISE_CATEGORIES[script.category]?.label}
                        </h3>
                        <p className="text-white/80 text-xs">
                          {script.sub_category.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    {script.is_nsfw && (
                      <span className="px-2 py-1 text-xs bg-white/20 text-white rounded-full">
                        18+
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-4">
                    "{script.script_text}"
                  </p>

                  {/* Meta info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Trigger:</span>
                      <span className="font-medium">
                        {PRAISE_TRIGGERS[script.trigger_type]?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Vibe:</span>
                      <span className="font-medium">
                        {script.vibe_tone.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => testPraise(script)}
                      className="flex-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                    >
                      Test Praise
                    </button>
                    
                    {script.audio_url && (
                      <button
                        onClick={() => playAudio(script)}
                        disabled={playingAudio === script.id}
                        className={`
                          p-2 rounded-lg transition-colors
                          ${playingAudio === script.id
                            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                            : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                          }
                        `}
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredScripts.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No praise scripts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
                setNsfwFilter(false);
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
    </MainLayout>
  );
};

export default PraiseLibraryPage;

