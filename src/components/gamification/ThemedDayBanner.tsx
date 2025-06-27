import React from 'react';
import { Calendar, Star, Gift, Flame } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { ThemedDay } from '../../types/gamification';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface ThemedDayBannerProps {
  themedDay: ThemedDay;
  className?: string;
  onExploreClick?: () => void;
}

const ThemedDayBanner: React.FC<ThemedDayBannerProps> = ({ 
  themedDay, 
  className,
  onExploreClick 
}) => {
  const getGradientClass = (color: string) => {
    const colorMap: Record<string, string> = {
      '#7C3AED': 'from-purple-900/30 to-purple-800/10 border-purple-700/30',
      '#EF4444': 'from-red-900/30 to-red-800/10 border-red-700/30',
      '#F59E0B': 'from-amber-900/30 to-amber-800/10 border-amber-700/30',
      '#10B981': 'from-emerald-900/30 to-emerald-800/10 border-emerald-700/30',
      '#3B82F6': 'from-blue-900/30 to-blue-800/10 border-blue-700/30',
      '#DB2777': 'from-pink-900/30 to-pink-800/10 border-pink-700/30',
      '#8B5CF6': 'from-violet-900/30 to-violet-800/10 border-violet-700/30',
    };
    return colorMap[color] || 'from-red-900/30 to-red-800/10 border-red-700/30';
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardBody className={cn(
        'bg-gradient-to-r text-white p-6 border',
        getGradientClass(themedDay.theme_color)
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="text-6xl"
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              {themedDay.icon}
            </motion.div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">Today's Theme</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">{themedDay.name}</h2>
              <p className="text-lg opacity-90">{themedDay.description}</p>
            </div>
          </div>
          
          <div className="text-right">
            <Button
              onClick={onExploreClick}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Gift className="mr-2 h-4 w-4" />
              Explore Today's Rewards
            </Button>
          </div>
        </div>

        {/* Multiplier Display */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <motion.div 
            className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold">
              {themedDay.special_multipliers.reading_points}x
            </div>
            <div className="text-sm opacity-90">Reading Points</div>
          </motion.div>
          <motion.div 
            className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold">
              {themedDay.special_multipliers.spicy_scene_points}x
            </div>
            <div className="text-sm opacity-90">Spicy Scene Points</div>
          </motion.div>
          <motion.div 
            className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold">
              {themedDay.special_multipliers.sharing_points}x
            </div>
            <div className="text-sm opacity-90">Sharing Points</div>
          </motion.div>
        </div>

        {/* Special Content Preview */}
        {themedDay.exclusive_content && (
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <Star className="h-4 w-4 text-yellow-300" />
            <span>
              Exclusive content: {themedDay.exclusive_content.voice_clips?.length || 0} voice clips, 
              {' '}{themedDay.exclusive_content.book_recommendations?.length || 0} book recommendations
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ThemedDayBanner;