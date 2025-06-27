import React from 'react';
import { Flame, Award, Calendar, TrendingUp, Trophy, Star } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { StreakStats } from '../../types/gamification';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface StreakDisplayProps {
  stats: StreakStats;
  className?: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ stats, className }) => {
  const maxStreak = Math.max(...stats.active_streaks.map(s => s.current_streak), 0);
  const totalStreakDays = stats.active_streaks.reduce((sum, s) => sum + s.current_streak, 0);

  const getStreakEmoji = (days: number) => {
    if (days >= 30) return '🔥🔥🔥';
    if (days >= 14) return '🔥🔥';
    if (days >= 7) return '🔥';
    if (days >= 3) return '✨';
    return '🌟';
  };

  const getStreakTitle = (days: number) => {
    if (days >= 30) return 'Legendary Streak!';
    if (days >= 14) return 'Epic Streak!';
    if (days >= 7) return 'Hot Streak!';
    if (days >= 3) return 'Building Heat!';
    return 'Getting Started!';
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-r from-red-900/30 to-red-800/10 border-b border-red-900/30 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <Flame className="mr-2 text-red-400" />
              Smut Streaks
            </h3>
            <p className="text-gray-300">Keep the fire burning!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{maxStreak}</div>
            <div className="text-sm text-gray-300">day streak</div>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-6 bg-gradient-to-br from-gray-900/30 to-transparent">
        {/* Main Streak Display */}
        <motion.div 
          className="text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-2">{getStreakEmoji(maxStreak)}</div>
          <h4 className="text-2xl font-bold text-red-400 mb-1">
            {getStreakTitle(maxStreak)}
          </h4>
          <p className="text-gray-300">
            You're on a {maxStreak}-day reading streak!
          </p>
        </motion.div>

        {/* Level Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium flex items-center text-gray-300">
              <Award className="mr-1 h-4 w-4 text-yellow-500" />
              Level {stats.current_level}
            </span>
            <span className="text-sm text-gray-400">
              {stats.points_to_next_level} points to next level
            </span>
          </div>
          <ProgressBar 
            value={(stats.total_points % 1000) / 10} 
            height="md" 
            color="primary"
            animated
          />
        </div>

        {/* Individual Streaks */}
        <div className="grid grid-cols-2 gap-4">
          {stats.active_streaks.map((streak) => (
            <motion.div 
              key={streak.id} 
              className="text-center p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/30 rounded-lg border border-gray-700/50"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-red-400">
                {streak.current_streak}
              </div>
              <div className="text-xs text-gray-300 capitalize">
                {streak.streak_type.replace('_', ' ')}
              </div>
              <div className="text-xs text-gray-400">
                Best: {streak.longest_streak}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">
              {stats.total_points.toLocaleString()}
            </div>
            <div className="text-xs text-gray-300">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">
              {stats.completed_challenges_today}
            </div>
            <div className="text-xs text-gray-300">Challenges Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {stats.unlocked_rewards_count}
            </div>
            <div className="text-xs text-gray-300">Rewards Unlocked</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default StreakDisplay;