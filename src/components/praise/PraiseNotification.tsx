// PraiseNotification.tsx - Component for displaying praise notifications

import React, { useState, useEffect } from 'react';
import { X, Heart, ThumbsUp, Volume2, VolumeX } from 'lucide-react';
import { PraiseNotification as PraiseNotificationType, PraiseModalProps } from '../../types/praise';
import { PraiseService } from '../../services/praiseService';

interface PraiseNotificationProps {
  notification: PraiseNotificationType;
  onClose: () => void;
  onReaction?: (reaction: 'liked' | 'loved' | 'dismissed') => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

export const PraiseNotification: React.FC<PraiseNotificationProps> = ({
  notification,
  onClose,
  onReaction,
  autoClose = true,
  duration = 5000,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Auto close timer
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation
  };

  const handleReaction = async (reaction: 'liked' | 'loved' | 'dismissed') => {
    if (hasReacted) return;
    
    setHasReacted(true);
    onReaction?.(reaction);

    // If dismissed, close immediately
    if (reaction === 'dismissed') {
      handleClose();
    }
  };

  const playAudio = async () => {
    if (!notification.script.audio_url) return;

    try {
      setIsAudioPlaying(true);
      const audio = new Audio(notification.script.audio_url);
      audio.onended = () => setIsAudioPlaying(false);
      audio.onerror = () => setIsAudioPlaying(false);
      await audio.play();
    } catch (error) {
      console.error('Error playing praise audio:', error);
      setIsAudioPlaying(false);
    }
  };

  const getCategoryColor = (category: string) => {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dominant_dirty':
        return '🔥';
      case 'flirty_fun':
        return '😘';
      case 'book_club':
        return '📚';
      case 'analytics':
        return '📊';
      case 'achievement':
        return '🏆';
      default:
        return '✨';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${className}`}>
      <div className={`
        max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
        overflow-hidden transform transition-all duration-300 hover:scale-105
      `}>
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getCategoryColor(notification.script.category)} p-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getCategoryIcon(notification.script.category)}</span>
              <span className="text-white font-medium text-sm">
                Praise Received
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {notification.script.audio_url && (
                <button
                  onClick={playAudio}
                  disabled={isAudioPlaying}
                  className="text-white hover:text-gray-200 transition-colors p-1"
                  title="Play audio praise"
                >
                  {isAudioPlaying ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3">
            {notification.script.script_text}
          </p>

          {/* Context info if available */}
          {notification.context && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {notification.context.achievement && (
                <span>🎉 {notification.context.achievement}</span>
              )}
              {notification.context.milestone && (
                <span>📈 {notification.context.milestone}</span>
              )}
            </div>
          )}

          {/* Reaction buttons */}
          {!hasReacted && (
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleReaction('loved')}
                  className="flex items-center space-x-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-xs"
                >
                  <Heart className="w-3 h-3" />
                  <span>Love</span>
                </button>
                <button
                  onClick={() => handleReaction('liked')}
                  className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-xs"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Like</span>
                </button>
              </div>
              <button
                onClick={() => handleReaction('dismissed')}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {hasReacted && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Thanks for the feedback! ✨
            </div>
          )}
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className={`h-full bg-gradient-to-r ${getCategoryColor(notification.script.category)} transition-all ease-linear`}
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear`
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Praise Modal for full-screen praise display
export const PraiseModal: React.FC<PraiseModalProps> = ({
  isOpen,
  onClose,
  praise,
  onPraiseDelivered
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    if (isOpen && praise.deliveryMethod === 'audio' && praise.script.audio_url) {
      playAudio();
    }
  }, [isOpen]);

  const playAudio = async () => {
    if (!praise.script.audio_url) return;

    try {
      setIsAudioPlaying(true);
      const audio = new Audio(praise.script.audio_url);
      audio.onended = () => setIsAudioPlaying(false);
      audio.onerror = () => setIsAudioPlaying(false);
      await audio.play();
    } catch (error) {
      console.error('Error playing praise audio:', error);
      setIsAudioPlaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getCategoryColor(praise.script.category)} p-6 text-center`}>
          <div className="text-4xl mb-2">{getCategoryIcon(praise.script.category)}</div>
          <h2 className="text-white text-xl font-bold">You Earned Praise!</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-6">
            {praise.script.script_text}
          </p>

          {/* Audio controls */}
          {praise.script.audio_url && (
            <div className="mb-6">
              <button
                onClick={playAudio}
                disabled={isAudioPlaying}
                className={`
                  flex items-center justify-center space-x-2 mx-auto px-4 py-2 rounded-full
                  ${isAudioPlaying 
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                  } transition-colors
                `}
              >
                {isAudioPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Playing...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Play Audio</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Continue Reading
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get category colors (shared)
const getCategoryColor = (category: string) => {
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

// Helper function to get category icons (shared)
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'dominant_dirty':
      return '🔥';
    case 'flirty_fun':
      return '😘';
    case 'book_club':
      return '📚';
    case 'analytics':
      return '📊';
    case 'achievement':
      return '🏆';
    default:
      return '✨';
  }
};

