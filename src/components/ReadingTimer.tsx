import React, { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';
import { Play, Pause, RotateCcw, Clock, Plus, Minus, Settings } from 'lucide-react';
import { cn } from '../utils/cn';
import { useVoicePraiseStore } from '../store/voicePraiseStore';
import { motion } from 'framer-motion';

interface ReadingTimerProps {
  onComplete?: () => void;
  defaultMinutes?: number;
  className?: string;
}

const ReadingTimer: React.FC<ReadingTimerProps> = ({ 
  onComplete,
  defaultMinutes = 30,
  className 
}) => {
  const [seconds, setSeconds] = useState(defaultMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [showPraise, setShowPraise] = useState(false);
  const [praiseMessage, setPraiseMessage] = useState('');
  const [timerDuration, setTimerDuration] = useState(defaultMinutes);
  const [showSettings, setShowSettings] = useState(false);
  
  const playPraise = useVoicePraiseStore(state => state.playPraise);
  const timerRef = useRef<number | null>(null);
  
  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Toggle timer
  const toggle = () => {
    if (!isActive) {
      // Starting timer - play motivation
      playPraise('session_start');
      setPraiseMessage("That's it. Be a good girl and get to work for me.");
      setShowPraise(true);
      setTimeout(() => setShowPraise(false), 5000);
    } else {
      // Pausing timer
      playPraise('motivation');
      setPraiseMessage("Interruptions have consequences, sweetheart.");
      setShowPraise(true);
      setTimeout(() => setShowPraise(false), 5000);
    }
    setIsActive(!isActive);
  };
  
  // Reset timer
  const reset = () => {
    setIsActive(false);
    setSeconds(timerDuration * 60);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Adjust timer duration
  const adjustDuration = (amount: number) => {
    const newDuration = Math.max(1, timerDuration + amount);
    setTimerDuration(newDuration);
    if (!isActive) {
      setSeconds(newDuration * 60);
    }
  };
  
  // Apply custom duration
  const applyCustomDuration = () => {
    if (!isActive) {
      setSeconds(timerDuration * 60);
    }
    setShowSettings(false);
  };
  
  // Timer effect
  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = window.setInterval(() => {
        setSeconds(seconds => {
          const newSeconds = seconds - 1;
          
          // Play milestone praise at specific intervals
          if (newSeconds > 0) {
            const elapsed = (timerDuration * 60) - newSeconds;
            
            // 15 minute milestone
            if (elapsed === 15 * 60) {
              playPraise('milestone_15min');
              setPraiseMessage("You're doing so well. Keep going for me.");
              setShowPraise(true);
              setTimeout(() => setShowPraise(false), 5000);
            }
            // 30 minute milestone
            else if (elapsed === 30 * 60) {
              playPraise('milestone_30min');
              setPraiseMessage("Halfway there. I'm impressed with your focus.");
              setShowPraise(true);
              setTimeout(() => setShowPraise(false), 5000);
            }
            // 60 minute milestone
            else if (elapsed === 60 * 60) {
              playPraise('milestone_60min');
              setPraiseMessage("A full hour of dedication. You're exceeding expectations.");
              setShowPraise(true);
              setTimeout(() => setShowPraise(false), 5000);
            }
          }
          
          return newSeconds;
        });
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Timer completed
      playPraise('session_end');
      setPraiseMessage("That's my obedient little overachiever.");
      setShowPraise(true);
      setTimeout(() => setShowPraise(false), 5000);
      if (onComplete) {
        onComplete();
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, seconds, timerDuration, onComplete, playPraise]);
  
  const progress = ((timerDuration * 60 - seconds) / (timerDuration * 60)) * 100;
  
  return (
    <div className={cn('bg-card border border-border rounded-xl p-6 relative overflow-hidden', className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-accent-text flex items-center font-cinzel">
            <Clock className="mr-2" />
            Reading Timer
          </h3>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-secondary-text">
              {Math.round(progress)}% Complete
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(!showSettings)}
              className="p-1"
            >
              <Settings size={18} className="text-secondary-text hover:text-primary-text" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <motion.div 
            className="text-6xl font-mono font-bold text-accent-text mb-6"
            animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
          >
            {formatTime()}
          </motion.div>
          
          {/* Progress ring */}
          <div className="relative w-32 h-32 mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-border"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                className="text-accent transition-all duration-300"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-sm text-secondary-text text-center">
                <div>{Math.floor((timerDuration * 60 - seconds) / 60)}m</div>
                <div className="text-xs">elapsed</div>
              </div>
            </div>
          </div>
          
          {/* Timer controls */}
          <div className="flex space-x-4 mb-4">
            <Button 
              onClick={toggle} 
              variant={isActive ? 'secondary' : 'primary'}
              className="flex items-center px-6 py-3"
            >
              {isActive ? <Pause size={18} className="mr-2" /> : <Play size={18} className="mr-2" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>
            
            <Button 
              onClick={reset} 
              variant="outline"
              className="flex items-center px-4 py-3"
            >
              <RotateCcw size={18} className="mr-2" />
              Reset
            </Button>
          </div>
          
          {/* Timer settings */}
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-gray-800/50 border border-border rounded-lg p-4 mb-4"
            >
              <h4 className="text-sm font-medium text-white mb-3">Adjust Timer Duration</h4>
              <div className="flex items-center justify-between mb-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustDuration(-5)}
                  disabled={timerDuration <= 5}
                  className="p-1"
                >
                  <Minus size={16} />
                </Button>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center bg-gray-700 border border-gray-600 rounded-md p-1 text-white"
                    min="1"
                  />
                  <span className="ml-2 text-gray-300">minutes</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustDuration(5)}
                  className="p-1"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex justify-end">
                <Button 
                  size="sm" 
                  onClick={applyCustomDuration}
                  disabled={isActive}
                >
                  Apply
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Praise message */}
          {showPraise && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-4 bg-accent/20 border border-accent/50 text-accent-text rounded-lg text-center max-w-sm"
            >
              {praiseMessage}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingTimer;