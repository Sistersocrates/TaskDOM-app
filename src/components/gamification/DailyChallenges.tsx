import React from 'react';
import { Target, Clock, Award, CheckCircle, Lock, BookOpen, Flame, Share2, Plus } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { DailyChallenge } from '../../types/gamification';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface DailyChallengesProps {
  challenges: DailyChallenge[];
  className?: string;
  onChallengeClick?: (challenge: DailyChallenge) => void;
}

const DailyChallenges: React.FC<DailyChallengesProps> = ({ 
  challenges, 
  className,
  onChallengeClick 
}) => {
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

  const calculateProgress = (challenge: DailyChallenge) => {
    const totalRequired = challenge.requirements.reduce((sum, req) => sum + req.target, 0);
    const totalCurrent = challenge.requirements.reduce((sum, req) => sum + req.current, 0);
    return Math.min((totalCurrent / totalRequired) * 100, 100);
  };

  const isCompleted = (challenge: DailyChallenge) => {
    return challenge.requirements.every(req => req.current >= req.target);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-xl font-bold flex items-center text-white">
          <Target className="mr-2 text-red-400" />
          Daily Challenges
        </h3>
        <p className="text-gray-400">Complete challenges to earn exclusive rewards</p>
      </CardHeader>

      <CardBody className="space-y-4">
        {challenges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>New challenges will be available soon!</p>
          </div>
        ) : (
          challenges.map((challenge) => {
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
                onClick={() => onChallengeClick?.(challenge)}
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
  );
};

export default DailyChallenges;