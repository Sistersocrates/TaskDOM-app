import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Instagram, Copy, Check } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

interface SocialShareButtonProps {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'copy';
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  via?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button' | 'pill';
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  platform,
  url,
  title,
  description = '',
  hashtags = [],
  via = 'TaskDOM',
  className,
  size = 'md',
  variant = 'button'
}) => {
  const [copied, setCopied] = useState(false);

  const platformConfig = {
    facebook: {
      name: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: Facebook,
      shareUrl: (url: string, title: string, description: string) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title + (description ? ': ' + description : ''))}`
    },
    twitter: {
      name: 'X (Twitter)',
      color: 'bg-black hover:bg-gray-800',
      icon: Twitter,
      shareUrl: (url: string, title: string, description: string, hashtags: string[], via: string) => {
        const text = title + (description ? ': ' + description : '');
        const hashtagString = hashtags.length > 0 ? hashtags.map(tag => `#${tag.replace('#', '')}`).join(' ') : '';
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=${via}&hashtags=${encodeURIComponent(hashtagString)}`;
      }
    },
    linkedin: {
      name: 'LinkedIn',
      color: 'bg-blue-700 hover:bg-blue-800',
      icon: Linkedin,
      shareUrl: (url: string, title: string, description: string) =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`
    },
    instagram: {
      name: 'Instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      icon: Instagram,
      shareUrl: () => '#' // Instagram doesn't support direct URL sharing
    },
    copy: {
      name: 'Copy Link',
      color: 'bg-gray-600 hover:bg-gray-700',
      icon: copied ? Check : Copy,
      shareUrl: () => '#'
    }
  };

  const config = platformConfig[platform];

  const handleShare = async () => {
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
      return;
    }

    if (platform === 'instagram') {
      // For Instagram, we'll show a message about copying the link
      await navigator.clipboard.writeText(url);
      alert('Link copied! You can now paste it in your Instagram story or bio.');
      return;
    }

    let shareUrl: string;
    if (platform === 'twitter') {
      shareUrl = config.shareUrl(url, title, description, hashtags, via);
    } else {
      shareUrl = config.shareUrl(url, title, description);
    }

    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  const sizeClasses = {
    sm: variant === 'icon' ? 'p-2' : 'px-3 py-1.5 text-sm',
    md: variant === 'icon' ? 'p-3' : 'px-4 py-2 text-base',
    lg: variant === 'icon' ? 'p-4' : 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const IconComponent = config.icon;

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={cn(
          'rounded-full text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
          config.color,
          sizeClasses[size],
          className
        )}
        title={`Share on ${config.name}`}
      >
        <IconComponent size={iconSizes[size]} />
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={handleShare}
        className={cn(
          'inline-flex items-center rounded-full text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
          config.color,
          sizeClasses[size],
          className
        )}
      >
        <IconComponent size={iconSizes[size]} className="mr-2" />
        {config.name}
      </button>
    );
  }

  return (
    <Button
      onClick={handleShare}
      className={cn(
        'inline-flex items-center text-white transition-all duration-200',
        config.color,
        className
      )}
      size={size}
    >
      <IconComponent size={iconSizes[size]} className="mr-2" />
      {config.name}
    </Button>
  );
};

export default SocialShareButton;