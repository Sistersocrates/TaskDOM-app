import React from 'react';
import { Share2 } from 'lucide-react';
import SocialShareButton from './social/SocialShareButton';
import { useSocialShare } from '../hooks/useSocialShare';
import { Book } from '../types';
import { cn } from '../utils/cn';

interface QuickShareButtonsProps {
  type: 'progress' | 'streak' | 'achievement';
  data: {
    book?: Book;
    streakDays?: number;
    achievement?: string;
    achievementData?: any;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'full';
}

const QuickShareButtons: React.FC<QuickShareButtonsProps> = ({
  type,
  data,
  className,
  size = 'sm',
  variant = 'minimal'
}) => {
  const { shareProgress, shareStreak, shareAchievement } = useSocialShare();

  const handleShare = () => {
    switch (type) {
      case 'progress':
        if (data.book) shareProgress(data.book);
        break;
      case 'streak':
        if (data.streakDays) shareStreak(data.streakDays);
        break;
      case 'achievement':
        if (data.achievement) shareAchievement(data.achievement, data.achievementData);
        break;
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleShare}
        className={cn(
          'inline-flex items-center text-gray-400 hover:text-red-400 transition-colors',
          className
        )}
        title="Share this achievement"
      >
        <Share2 size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
      </button>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="text-sm text-gray-400">Share:</span>
      <div className="flex space-x-1">
        <SocialShareButton
          platform="facebook"
          url="#"
          title="Check out my reading progress!"
          variant="icon"
          size={size}
        />
        <SocialShareButton
          platform="twitter"
          url="#"
          title="Check out my reading progress!"
          variant="icon"
          size={size}
        />
        <SocialShareButton
          platform="copy"
          url="#"
          title="Check out my reading progress!"
          variant="icon"
          size={size}
        />
      </div>
    </div>
  );
};

export default QuickShareButtons;