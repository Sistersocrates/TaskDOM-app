import React from 'react';
import { X, Gift, Play, Download, Users, BookOpen, Star } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { SpicySurprise } from '../../types/gamification';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface SpicySurpriseModalProps {
  surprise: SpicySurprise;
  isOpen: boolean;
  onClose: () => void;
  onClaim: (surprise: SpicySurprise) => void;
}

const SpicySurpriseModal: React.FC<SpicySurpriseModalProps> = ({
  surprise,
  isOpen,
  onClose,
  onClaim
}) => {
  if (!isOpen) return null;

  const getRarityColor = (rarity: SpicySurprise['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-300 bg-gray-800 border-gray-600';
      case 'rare': return 'text-blue-300 bg-blue-900/20 border-blue-700/30';
      case 'epic': return 'text-purple-300 bg-purple-900/20 border-purple-700/30';
      case 'legendary': return 'text-yellow-300 bg-yellow-900/20 border-yellow-700/30';
    }
  };

  const getRarityEmoji = (rarity: SpicySurprise['rarity']) => {
    switch (rarity) {
      case 'common': return '⭐';
      case 'rare': return '💎';
      case 'epic': return '🔥';
      case 'legendary': return '👑';
    }
  };

  const getContentIcon = (contentType: SpicySurprise['content_type']) => {
    switch (contentType) {
      case 'voice_clip': return <Play className="h-5 w-5 text-blue-400" />;
      case 'nsfw_recommendation': return <BookOpen className="h-5 w-5 text-red-400" />;
      case 'exclusive_scene': return <Download className="h-5 w-5 text-purple-400" />;
      case 'club_conversation': return <Users className="h-5 w-5 text-green-400" />;
    }
  };

  const renderContentPreview = () => {
    switch (surprise.content_type) {
      case 'voice_clip':
        return (
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
            <div className="flex items-center space-x-2 mb-2">
              <Play className="h-4 w-4 text-blue-400" />
              <span className="font-medium text-white">Voice Clip</span>
            </div>
            <p className="text-sm text-gray-300">
              Duration: {surprise.content_data.duration || 'Unknown'} seconds
            </p>
            {surprise.content_data.text && (
              <p className="text-sm italic mt-2 text-gray-400">
                "{surprise.content_data.text.substring(0, 100)}..."
              </p>
            )}
          </div>
        );

      case 'nsfw_recommendation':
        return (
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-700/30">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-4 w-4 text-red-400" />
              <span className="font-medium text-white">Spicy Book Recommendation</span>
            </div>
            <p className="text-sm text-gray-300">
              Personalized recommendations based on your reading history
            </p>
            {surprise.content_data.spice_level && (
              <div className="flex items-center mt-2">
                <span className="text-sm mr-2 text-gray-300">Spice Level:</span>
                {Array.from({ length: surprise.content_data.spice_level }).map((_, i) => (
                  <span key={i} className="text-red-400">🌶️</span>
                ))}
              </div>
            )}
          </div>
        );

      case 'exclusive_scene':
        return (
          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-700/30">
            <div className="flex items-center space-x-2 mb-2">
              <Download className="h-4 w-4 text-purple-400" />
              <span className="font-medium text-white">Exclusive Scene</span>
            </div>
            {surprise.content_data.book_title && (
              <p className="text-sm font-medium text-gray-300">
                From: {surprise.content_data.book_title}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              {surprise.content_data.word_count || 'Unknown'} words of exclusive content
            </p>
          </div>
        );

      case 'club_conversation':
        return (
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-green-400" />
              <span className="font-medium text-white">Exclusive Club Access</span>
            </div>
            {surprise.content_data.club_name && (
              <p className="text-sm font-medium text-gray-300">
                Club: {surprise.content_data.club_name}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              Join exclusive discussions with fellow readers
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-lg w-full"
      >
        <Card className="overflow-hidden border border-gray-700">
          <CardHeader className="relative bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <motion.div 
                className="text-4xl"
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {getRarityEmoji(surprise.rarity)}
              </motion.div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full font-medium border',
                    getRarityColor(surprise.rarity)
                  )}>
                    {surprise.rarity.toUpperCase()}
                  </span>
                  {surprise.is_nsfw && (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-900/20 text-red-300 border border-red-700/30">
                      18+
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{surprise.title}</h2>
              </div>
            </div>
          </CardHeader>

          <CardBody className="space-y-4 bg-gradient-to-br from-gray-900 to-gray-800">
            <p className="text-gray-300">{surprise.description}</p>

            {renderContentPreview()}

            {/* Unlock Requirements */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h4 className="font-medium mb-2 text-white">Unlock Requirements Met:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Streak Days:</span>
                  <span className="text-green-400 font-medium flex items-center">
                    <CheckCircle size={14} className="mr-1" />
                    {surprise.unlock_requirements.streak_days} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Activity Points:</span>
                  <span className="text-green-400 font-medium flex items-center">
                    <CheckCircle size={14} className="mr-1" />
                    {surprise.unlock_requirements.activity_points} points
                  </span>
                </div>
                {surprise.unlock_requirements.themed_day && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Special Day:</span>
                    <span className="text-green-400 font-medium flex items-center capitalize">
                      <CheckCircle size={14} className="mr-1" />
                      {surprise.unlock_requirements.themed_day.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => onClaim(surprise)}
                className="flex-grow flex items-center justify-center"
              >
                <Gift className="mr-2 h-4 w-4" />
                Claim Reward
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
              >
                Later
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default SpicySurpriseModal;