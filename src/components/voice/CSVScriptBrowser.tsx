import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { Play, Loader2, Filter, Search, BookOpen, Volume2 } from 'lucide-react';
import { 
  csvScripts, 
  getCSVCategories, 
  getCSVSubCategories, 
  getCSVVibes,
  getCSVScriptsByCategory,
  getCSVScriptsBySubCategory,
  getCSVScriptsByNSFWLevel
} from '../../data/csvScriptPacks';
import { useVoicePraiseStore } from '../../store/voicePraiseStore';
import { cn } from '../../utils/cn';

const CSVScriptBrowser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [selectedNSFWLevel, setSelectedNSFWLevel] = useState<'all' | 'SFW' | 'NSFW'>('all');
  const [testingScriptId, setTestingScriptId] = useState<string | null>(null);

  const { selectedVoiceId, testVoice, isPlaying } = useVoicePraiseStore();

  const categories = getCSVCategories();
  const subCategories = getCSVSubCategories();

  const filteredScripts = useMemo(() => {
    let filtered = csvScripts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(script =>
        script.script.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.vibe.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = getCSVScriptsByCategory(selectedCategory).filter(script =>
        !searchTerm || script.script.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.vibe.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by sub-category
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(script =>
        script.subCategory === selectedSubCategory
      );
    }

    // Filter by NSFW level
    if (selectedNSFWLevel !== 'all') {
      filtered = getCSVScriptsByNSFWLevel(selectedNSFWLevel).filter(script =>
        (!searchTerm || script.script.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.vibe.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCategory === 'all' || script.category === selectedCategory) &&
        (selectedSubCategory === 'all' || script.subCategory === selectedSubCategory)
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedSubCategory, selectedNSFWLevel]);

  const handleTestScript = async (script: any) => {
    if (!selectedVoiceId) return;
    
    setTestingScriptId(script.id);
    try {
      await testVoice(selectedVoiceId, script.script);
    } finally {
      setTestingScriptId(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Dominant & Dirty Praise':
        return 'bg-red-900/30 text-red-300 border-red-700/50';
      case 'Flirty & Fun Praise':
        return 'bg-pink-900/30 text-pink-300 border-pink-700/50';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const getSubCategoryColor = (subCategory: string) => {
    const colorMap: Record<string, string> = {
      'Achievement-Based Praise': 'bg-green-900/20 text-green-300',
      'Soft & Seductive Praise': 'bg-purple-900/20 text-purple-300',
      'Dark Fantasy / Villain Energy': 'bg-red-900/20 text-red-300',
      'Short Phrases for Button Sounds': 'bg-blue-900/20 text-blue-300',
      'Cheeky Praise & Dirty Puns': 'bg-orange-900/20 text-orange-300',
      'Sassy, Pun-Filled Encouragement': 'bg-yellow-900/20 text-yellow-300',
      'Wholesome & Flirty': 'bg-emerald-900/20 text-emerald-300',
      'Mini Praise Clips': 'bg-indigo-900/20 text-indigo-300',
      'Bookish Flirt Tropes': 'bg-violet-900/20 text-violet-300'
    };
    return colorMap[subCategory] || 'bg-gray-800 text-gray-300';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center">
              <BookOpen className="mr-2" />
              CSV Script Library
            </h2>
            <p className="text-gray-400">Browse and test {csvScripts.length} curated voice scripts</p>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400">{filteredScripts.length} scripts</span>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search scripts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Sub-Category Filter */}
          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Sub-Categories</option>
            {subCategories.map(subCategory => (
              <option key={subCategory} value={subCategory}>{subCategory}</option>
            ))}
          </select>

          {/* NSFW Level Filter */}
          <select
            value={selectedNSFWLevel}
            onChange={(e) => setSelectedNSFWLevel(e.target.value as any)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Content</option>
            <option value="SFW">Safe for Work</option>
            <option value="NSFW">Adults Only</option>
          </select>
        </div>

        {/* Scripts Grid */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredScripts.map((script) => (
            <div
              key={script.id}
              className="p-4 border border-gray-700 rounded-lg bg-gray-800 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium border',
                      getCategoryColor(script.category)
                    )}>
                      {script.category}
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      getSubCategoryColor(script.subCategory)
                    )}>
                      {script.subCategory}
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      script.nsfw_level === 'NSFW' ? 'bg-error-900/30 text-error-300' : 'bg-success-900/30 text-success-300'
                    )}>
                      {script.nsfw_level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{script.vibe}</p>
                </div>
                
                <Button
                  onClick={() => handleTestScript(script)}
                  disabled={isPlaying || !selectedVoiceId}
                  variant="outline"
                  size="sm"
                  className="ml-3"
                >
                  {testingScriptId === script.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <blockquote className="text-sm italic text-gray-300 border-l-4 border-primary-500/30 pl-3">
                "{script.script}"
              </blockquote>
            </div>
          ))}
        </div>

        {filteredScripts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scripts found matching your criteria.</p>
            <p className="text-sm">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {!selectedVoiceId && (
          <div className="bg-warning-900/20 border border-warning-500/30 text-warning-300 p-4 rounded-lg flex items-center">
            <Volume2 className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">
              Please select a voice in the Voice Selection tab to test these scripts.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default CSVScriptBrowser;