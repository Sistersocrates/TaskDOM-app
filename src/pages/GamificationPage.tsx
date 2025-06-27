import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StreakDisplay from '../components/gamification/StreakDisplay';
import ThemedDayBanner from '../components/gamification/ThemedDayBanner';
import DailyChallenges from '../components/gamification/DailyChallenges';
import SpicySurpriseModal from '../components/gamification/SpicySurpriseModal';
import QuickShareButtons from '../components/QuickShareButtons';
import { useGamification } from '../hooks/useGamification';
import { useSocialShare } from '../hooks/useSocialShare';
import { Trophy, Users, Share2, Gift, Loader2, Plus, X, Check, Star, Calendar, Target, BookOpen, Flame, Clock, CheckCircle, Award, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyChallenge } from '../types/gamification';
import { cn } from '../utils/cn';
import ProgressBar from '../components/ui/ProgressBar';

const GamificationPage: React.FC = () => {
  const {
    streakStats,
    todaysChallenges,
    availableRewards,
    currentThemedDay,
    isLoading,
    error,
    recordActivity,
    claimReward,
    shareAchievement,
    refreshData
  } = useGamification();

  const { shareStreak, shareAchievement: socialShareAchievement } = useSocialShare();

  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showAddChallengeModal, setShowAddChallengeModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState<Partial<DailyChallenge>>({
    title: '',
    description: '',
    difficulty: 'medium',
    requirements: [{ type: 'reading_minutes', target: 30, current: 0 }],
    rewards: [{ type: 'points', value: 100, rarity: 'common' }]
  });

  const handleExploreRewards = () => {
    if (availableRewards.length > 0) {
      setSelectedReward(availableRewards[0]);
      setShowRewardModal(true);
    }
  };

  const handleClaimReward = async (reward: any) => {
    await claimReward(reward.id);
    setShowRewardModal(false);
    setSelectedReward(null);
  };

  const handleShareStreak = async () => {
    if (streakStats) {
      const maxStreak = Math.max(...streakStats.active_streaks.map(s => s.current_streak), 0);
      shareStreak(maxStreak);
    }
  };

  const handleShareAchievement = async (achievement: string, data: any) => {
    socialShareAchievement(achievement, data);
  };

  const handleAddChallenge = () => {
    // In a real app, this would send the new challenge to the backend
    console.log('Adding custom challenge:', newChallenge);
    setShowAddChallengeModal(false);
    
    // Reset form
    setNewChallenge({
      title: '',
      description: '',
      difficulty: 'medium',
      requirements: [{ type: 'reading_minutes', target: 30, current: 0 }],
      rewards: [{ type: 'points', value: 100, rarity: 'common' }]
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-lg text-gray-400">Loading your streak data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-error-500 text-lg mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </MainLayout>
    );
  }

  const maxStreak = streakStats ? Math.max(...streakStats.active_streaks.map(s => s.current_streak), 0) : 0;

  // Mock leaderboard data
  const leaderboard = [
    {
      rank: 1,
      username: 'bookworm_queen',
      displayName: 'Sophia',
      profilePicture: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
      streak: 14,
      points: 2500
    },
    {
      rank: 2,
      username: 'page_turner',
      displayName: 'Emma',
      profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      streak: 12,
      points: 2350
    },
    {
      rank: 3,
      username: 'novel_addict',
      displayName: 'Olivia',
      profilePicture: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
      streak: 10,
      points: 2100
    },
    {
      rank: 4,
      username: 'bookish_soul',
      displayName: 'Ava',
      profilePicture: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      streak: 8,
      points: 1950
    },
    {
      rank: 5,
      username: 'midnight_reader',
      displayName: 'Mia',
      profilePicture: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
      streak: 7,
      points: 1820
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Smut Streaks</h1>
            <p className="text-gray-400">Keep the fire burning with daily reading challenges</p>
          </div>
          <div className="flex space-x-3">
            <QuickShareButtons
              type="streak"
              data={{ streakDays: maxStreak }}
              variant="minimal"
            />
            <Button
              variant="outline"
              onClick={handleShareStreak}
              className="flex items-center"
            >
              <Share2 size={18} className="mr-2" />
              Share Streak
            </Button>
            <Button
              onClick={handleExploreRewards}
              disabled={availableRewards.length === 0}
              className="flex items-center"
            >
              <Gift size={18} className="mr-2" />
              View Rewards ({availableRewards.length})
            </Button>
          </div>
        </div>

        {/* Themed Day Banner */}
        <ThemedDayBanner 
          themedDay={currentThemedDay}
          onExploreClick={handleExploreRewards}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Streak Display */}
          <div className="lg:col-span-1">
            {streakStats && (
              <div className="relative">
                <StreakDisplay stats={streakStats} />
                <div className="absolute top-4 right-4">
                  <QuickShareButtons
                    type="streak"
                    data={{ streakDays: maxStreak }}
                    variant="minimal"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Challenges and Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Challenges */}
            <Card>
              <CardHeader className="flex flex-col">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Target className="mr-2 text-red-400" />
                  Daily Challenges
                </h3>
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">Complete challenges to earn exclusive rewards</p>
                  <Button
                    onClick={() => setShowAddChallengeModal(true)}
                    size="sm"
                    className="flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Custom Challenge
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {todaysChallenges.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>New challenges will be available soon!</p>
                  </div>
                ) : (
                  todaysChallenges.map((challenge) => {
                    const progress = calculateProgress(challenge);
                    const completed = isCompleted(challenge);

                    return (
                      <motion.div
                        key={challenge.id}
                        className={cn(
                          'border rounded-lg p-4 transition-all cursor-pointer bg-gradient-to-br',
                          completed 
                            ? 'from-green-900/20 to-green-800/5 border-green-700/30' 
                            : 'from-gray-800/50 to-gray-900/30 border-gray-700 hover:border-red-700/50'
                        )}
                        onClick={() => {}}
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-lg">{getDifficultyIcon(challenge.difficulty)}</span>
                              <h4 className="font-semibold text-white">{challenge.title}</h4>
                              <span className={cn(
                                'text-xs px-2 py-1 rounded-full font-medium border',
                                getDifficultyColor(challenge.difficulty)
                              )}>
                                {challenge.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">
                              {challenge.description}
                            </p>
                          </div>
                          
                          {completed && (
                            <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                          )}
                        </div>

                        {/* Requirements */}
                        <div className="space-y-2 mb-3">
                          {challenge.requirements.map((req, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                {getRequirementIcon(req.type)}
                                <span className="ml-2 capitalize text-gray-300">
                                  {req.type.replace('_', ' ')}: {req.current}/{req.target}
                                </span>
                              </div>
                              <div className="w-24">
                                <ProgressBar 
                                  value={(req.current / req.target) * 100} 
                                  height="sm"
                                  color={req.current >= req.target ? 'success' : 'primary'}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Rewards */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm">
                            <Award className="h-4 w-4 text-yellow-400" />
                            <span className="text-gray-300">
                              {challenge.rewards.length} reward{challenge.rewards.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <Button
                            size="sm"
                            variant={completed ? 'primary' : 'outline'}
                            disabled={!completed}
                            className="flex items-center"
                          >
                            {completed ? (
                              <>
                                <Award className="mr-1 h-3 w-3" />
                                Claim Rewards
                              </>
                            ) : (
                              <>
                                <Lock className="mr-1 h-3 w-3" />
                                {Math.round(progress)}% Complete
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                <p className="text-gray-400">Earn points and maintain your streaks</p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        recordActivity('reading_session', { minutes: 30 });
                        handleShareAchievement('completed_reading_session', { minutes: 30 });
                      }}
                      className="flex flex-col items-center p-4 h-auto w-full bg-gradient-to-br from-red-900/20 to-red-800/5 border border-red-900/30"
                    >
                      <div className="text-2xl mb-2">📚</div>
                      <span className="text-sm">Log Reading</span>
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        recordActivity('spicy_scene_marked', { rating: 4 });
                        handleShareAchievement('marked_spicy_scene', { rating: 4 });
                      }}
                      className="flex flex-col items-center p-4 h-auto w-full bg-gradient-to-br from-red-900/20 to-red-800/5 border border-red-900/30"
                    >
                      <div className="text-2xl mb-2">🌶️</div>
                      <span className="text-sm">Mark Scene</span>
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        recordActivity('content_shared', { platform: 'social' });
                        handleShareAchievement('shared_content', { platform: 'social' });
                      }}
                      className="flex flex-col items-center p-4 h-auto w-full bg-gradient-to-br from-red-900/20 to-red-800/5 border border-red-900/30"
                    >
                      <div className="text-2xl mb-2">📱</div>
                      <span className="text-sm">Share Content</span>
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        recordActivity('club_participation', { discussion_id: 'daily' });
                        handleShareAchievement('joined_discussion', { discussion_id: 'daily' });
                      }}
                      className="flex flex-col items-center p-4 h-auto w-full bg-gradient-to-br from-red-900/20 to-red-800/5 border border-red-900/30"
                    >
                      <div className="text-2xl mb-2">👥</div>
                      <span className="text-sm">Join Discussion</span>
                    </Button>
                  </motion.div>
                </div>
              </CardBody>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center text-white">
                    <Trophy className="mr-2 text-yellow-500" />
                    Weekly Leaderboard
                  </h3>
                  <div className="flex items-center space-x-2">
                    <QuickShareButtons
                      type="achievement"
                      data={{ achievement: 'leaderboard_position', position: 1 }}
                      variant="minimal"
                    />
                    <Button variant="outline" size="sm">
                      View Full Leaderboard
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {leaderboard.map((user) => (
                    <motion.div 
                      key={user.rank} 
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700/50 hover:border-red-900/50 transition-all"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          user.rank === 1 ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/50' :
                          user.rank === 2 ? 'bg-gray-800/50 text-gray-300 border border-gray-500/50' :
                          user.rank === 3 ? 'bg-amber-900/50 text-amber-300 border border-amber-500/50' :
                          'bg-gray-800 text-gray-400 border border-gray-600/30'
                        }`}>
                          {user.rank}
                        </div>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={user.profilePicture} 
                            alt={user.username} 
                            className="w-8 h-8 rounded-full object-cover border border-gray-700"
                          />
                          <div>
                            <p className="font-medium text-white">{user.displayName}</p>
                            <p className="text-xs text-gray-400">@{user.username}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-orange-400 text-sm">
                          <Flame className="h-4 w-4 mr-1" />
                          <span>{user.streak} days</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{user.points.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">points</p>
                        </div>
                        {user.rank === 1 && (
                          <QuickShareButtons
                            type="achievement"
                            data={{ achievement: 'leaderboard_first_place', points: user.points }}
                            variant="minimal"
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Reading Achievements */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Star className="mr-2 text-yellow-500" />
                  Reading Achievements
                </h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: '📚', title: 'Bookworm', description: '10 books completed', color: 'from-red-900/20 to-red-800/5' },
                    { icon: '🔥', title: 'Hot Streak', description: '7-day streak', color: 'from-orange-900/20 to-orange-800/5' },
                    { icon: '🌶️', title: 'Spice Hunter', description: '25 spicy scenes', color: 'from-red-900/20 to-red-800/5' },
                    { icon: '🏆', title: 'Top Reader', description: 'Leaderboard #1', color: 'from-yellow-900/20 to-yellow-800/5' }
                  ].map((achievement, index) => (
                    <motion.div
                      key={index}
                      className={`text-center p-4 rounded-lg border border-gray-700/50 bg-gradient-to-br ${achievement.color}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <p className="font-medium text-white">{achievement.title}</p>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Add Custom Challenge Modal */}
        <AnimatePresence>
          {showAddChallengeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-lg"
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Create Custom Challenge</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddChallengeModal(false)}
                      className="p-1"
                    >
                      <X size={20} />
                    </Button>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Challenge Title</label>
                      <Input
                        value={newChallenge.title}
                        onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                        placeholder="e.g., Weekend Reading Marathon"
                        fullWidth
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                      <textarea
                        value={newChallenge.description}
                        onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                        placeholder="Describe your challenge..."
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Challenge Type</label>
                        <select
                          value={newChallenge.requirements?.[0]?.type || 'reading_minutes'}
                          onChange={(e) => setNewChallenge({
                            ...newChallenge, 
                            requirements: [{ 
                              type: e.target.value as any, 
                              target: newChallenge.requirements?.[0]?.target || 30, 
                              current: 0 
                            }]
                          })}
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        >
                          <option value="reading_minutes">Reading Minutes</option>
                          <option value="pages_read">Pages Read</option>
                          <option value="spicy_scenes">Spicy Scenes</option>
                          <option value="content_share">Content Sharing</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Target Amount</label>
                        <Input
                          type="number"
                          value={newChallenge.requirements?.[0]?.target || 30}
                          onChange={(e) => setNewChallenge({
                            ...newChallenge, 
                            requirements: [{ 
                              type: newChallenge.requirements?.[0]?.type || 'reading_minutes', 
                              target: parseInt(e.target.value) || 30, 
                              current: 0 
                            }]
                          })}
                          min={1}
                          fullWidth
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                      <div className="flex space-x-2">
                        {['easy', 'medium', 'hard', 'legendary'].map((difficulty) => (
                          <Button
                            key={difficulty}
                            variant={newChallenge.difficulty === difficulty ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setNewChallenge({...newChallenge, difficulty: difficulty as any})}
                            className="flex-1"
                          >
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Reward Points</label>
                      <Input
                        type="number"
                        value={newChallenge.rewards?.[0]?.value || 100}
                        onChange={(e) => setNewChallenge({
                          ...newChallenge, 
                          rewards: [{ 
                            type: 'points', 
                            value: parseInt(e.target.value) || 100, 
                            rarity: 'common' 
                          }]
                        })}
                        min={10}
                        fullWidth
                      />
                    </div>
                    
                    <div className="pt-4 flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddChallengeModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddChallenge}
                        className="flex-1 flex items-center justify-center"
                        disabled={!newChallenge.title || !newChallenge.description}
                      >
                        <Check size={18} className="mr-2" />
                        Create Challenge
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spicy Surprise Modal */}
        {selectedReward && (
          <SpicySurpriseModal
            surprise={selectedReward}
            isOpen={showRewardModal}
            onClose={() => {
              setShowRewardModal(false);
              setSelectedReward(null);
            }}
            onClaim={handleClaimReward}
          />
        )}
      </div>
    </MainLayout>
  );
};

// Helper functions for challenges
const calculateProgress = (challenge: DailyChallenge) => {
  const totalRequired = challenge.requirements.reduce((sum, req) => sum + req.target, 0);
  const totalCurrent = challenge.requirements.reduce((sum, req) => sum + req.current, 0);
  return Math.min((totalCurrent / totalRequired) * 100, 100);
};

const isCompleted = (challenge: DailyChallenge) => {
  return challenge.requirements.every(req => req.current >= req.target);
};

const getDifficultyColor = (difficulty: DailyChallenge['difficulty']) => {
  switch (difficulty) {
    case 'easy': return 'text-green-400 bg-green-900/20 border-green-700/30';
    case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30';
    case 'hard': return 'text-red-400 bg-red-900/20 border-red-700/30';
    case 'legendary': return 'text-purple-400 bg-purple-900/20 border-purple-700/30';
    default: return 'text-gray-400 bg-gray-800 border-gray-700';
  }
};

const getDifficultyIcon = (difficulty: DailyChallenge['difficulty']) => {
  switch (difficulty) {
    case 'easy': return '⭐';
    case 'medium': return '⭐⭐';
    case 'hard': return '⭐⭐⭐';
    case 'legendary': return '👑';
    default: return '⭐';
  }
};

const getRequirementIcon = (type: string) => {
  switch (type) {
    case 'reading_minutes': return <Clock className="h-4 w-4 text-blue-400" />;
    case 'spicy_scenes': return <Flame className="h-4 w-4 text-red-400" />;
    case 'pages_read': return <BookOpen className="h-4 w-4 text-green-400" />;
    case 'content_share': return <Share2 className="h-4 w-4 text-purple-400" />;
    default: return <Target className="h-4 w-4 text-gray-400" />;
  }
};

export default GamificationPage;