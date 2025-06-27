import React from 'react';
import { Card, CardBody, CardHeader } from './ui/Card';
import { Trophy, BookOpen, Clock, Target } from 'lucide-react';
import ProgressBar from './ui/ProgressBar';
import { ReadingGoal } from '../types';
import { motion } from 'framer-motion';

interface DailyGoalCardProps {
  goal: ReadingGoal;
  current: number;
  className?: string;
}

const DailyGoalCard: React.FC<DailyGoalCardProps> = ({ goal, current, className }) => {
  const progress = Math.min(Math.round((current / goal.amount) * 100), 100);
  
  const getIcon = () => {
    switch (goal.type) {
      case 'pages':
        return <BookOpen className="h-6 w-6 text-accent-text" />;
      case 'minutes':
        return <Clock className="h-6 w-6 text-accent-text" />;
      case 'chapters':
        return <BookOpen className="h-6 w-6 text-accent-text" />;
      default:
        return <Trophy className="h-6 w-6 text-accent-text" />;
    }
  };
  
  const getLabel = () => {
    switch (goal.type) {
      case 'pages':
        return 'pages';
      case 'minutes':
        return 'minutes';
      case 'chapters':
        return 'chapters';
      default:
        return 'units';
    }
  };
  
  return (
    <Card className={className} variant="dark">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-accent/20 rounded-lg border border-accent/50">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-medium text-primary-text font-cinzel">Daily Reading Goal</h3>
            <p className="text-sm text-secondary-text">Stay consistent, stay motivated</p>
          </div>
        </div>
        <Target className="h-5 w-5 text-accent-text" />
      </CardHeader>
      
      <CardBody>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-secondary-text">
              {current} of {goal.amount} {getLabel()}
            </span>
            <span className="text-lg font-bold text-accent-text">
              {progress}%
            </span>
          </div>
          <ProgressBar 
            value={progress} 
            color={progress >= 100 ? 'success' : 'primary'} 
            height="lg"
            animated={progress < 100}
            glowing={progress >= 100}
          />
        </div>
        
        {progress >= 100 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-success-900/30 to-success-800/20 border border-success-700/50 text-success-300 p-4 rounded-lg flex items-center"
          >
            <Trophy className="h-6 w-6 mr-3 text-success-400" />
            <div>
              <span className="font-medium block">Goal achieved!</span>
              <span className="text-sm text-success-400">You're absolutely crushing it today!</span>
            </div>
          </motion.div>
        ) : (
          <div className="text-sm text-secondary-text">
            {progress < 50 
              ? `You're making progress! Keep going to reach your daily goal.` 
              : `Almost there! Just ${goal.amount - current} ${getLabel()} to go.`}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DailyGoalCard;