import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { mockBooks } from '../utils/mockData';
import { Book } from '../types';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Flame, 
  TrendingUp,
  Calendar,
  Heart,
  Share2,
  Star,
  Trophy,
  CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import QuickShareButtons from '../components/QuickShareButtons';
import ProgressBar from '../components/ui/ProgressBar';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  
  // Mock data generation
  const generateReadingData = () => {
    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
    const dates = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    });
    
    return dates.map(date => ({
      date: format(date, 'MMM dd'),
      minutes: Math.floor(Math.random() * 120) + 30,
      pages: Math.floor(Math.random() * 50) + 10
    }));
  };
  
  const readingData = generateReadingData();
  
  // Chart configurations
  const readingTimeChartData = {
    labels: readingData.map(d => d.date),
    datasets: [
      {
        label: 'Reading Time (minutes)',
        data: readingData.map(d => d.minutes),
        fill: true,
        borderColor: 'rgb(219, 39, 119)',
        backgroundColor: 'rgba(219, 39, 119, 0.1)',
        tension: 0.4
      }
    ]
  };
  
  const spicySceneData = {
    labels: ['🌶️', '🌶️🌶️', '🌶️🌶️🌶️', '🌶️🌶️🌶️🌶️', '🌶️🌶️🌶️🌶️🌶️'],
    datasets: [
      {
        data: [10, 15, 25, 20, 30],
        backgroundColor: [
          '#FEE2E2',
          '#FCA5A5',
          '#F87171',
          '#EF4444',
          '#DC2626'
        ]
      }
    ]
  };
  
  const genreData = {
    labels: ['Romance', 'Fantasy', 'Contemporary', 'Dark Romance', 'Paranormal'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          '#FCE7F3',
          '#FBCFE8',
          '#F9A8D4',
          '#F472B6',
          '#EC4899'
        ]
      }
    ]
  };

  // Achievement data
  const achievements = [
    { 
      icon: '📚', 
      title: 'Book Baddie', 
      description: 'Read 10 books', 
      progress: 100, 
      color: 'from-red-900/20 to-red-800/5 border-red-700/30',
      isCompleted: true
    },
    { 
      icon: '🔥', 
      title: 'Spice Queen', 
      description: '50 spicy scenes', 
      progress: 80, 
      color: 'from-orange-900/20 to-orange-800/5 border-orange-700/30',
      isCompleted: false
    },
    { 
      icon: '📅', 
      title: 'Consistent Reader', 
      description: '30 day streak', 
      progress: 60, 
      color: 'from-blue-900/20 to-blue-800/5 border-blue-700/30',
      isCompleted: false
    },
    { 
      icon: '💖', 
      title: 'Genre Explorer', 
      description: '5 genres read', 
      progress: 100, 
      color: 'from-pink-900/20 to-pink-800/5 border-pink-700/30',
      isCompleted: true
    },
    { 
      icon: '🏆', 
      title: 'Reading Champion', 
      description: '100,000 words read', 
      progress: 75, 
      color: 'from-yellow-900/20 to-yellow-800/5 border-yellow-700/30',
      isCompleted: false
    },
    { 
      icon: '🌙', 
      title: 'Night Owl', 
      description: 'Read after midnight', 
      progress: 100, 
      color: 'from-purple-900/20 to-purple-800/5 border-purple-700/30',
      isCompleted: true
    },
    { 
      icon: '🔖', 
      title: 'Bookmark Master', 
      description: 'Create 20 bookmarks', 
      progress: 45, 
      color: 'from-green-900/20 to-green-800/5 border-green-700/30',
      isCompleted: false
    },
    { 
      icon: '📱', 
      title: 'Social Sharer', 
      description: 'Share 10 updates', 
      progress: 90, 
      color: 'from-indigo-900/20 to-indigo-800/5 border-indigo-700/30',
      isCompleted: false
    }
  ];
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Reading Analytics</h1>
            <p className="text-gray-400">Track your reading habits and progress</p>
          </div>
          <Button className="flex items-center">
            <Share2 size={20} className="mr-2" />
            Share Stats
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <Card>
              <CardBody className="flex items-center space-x-4 bg-gradient-to-br from-gray-800/50 to-gray-900/30">
                <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/30">
                  <Clock className="h-10 w-10 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Reading Time</p>
                  <p className="text-2xl font-bold text-white">47.5 hrs</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <Card>
              <CardBody className="flex items-center space-x-4 bg-gradient-to-br from-gray-800/50 to-gray-900/30">
                <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/30">
                  <BookOpen className="h-10 w-10 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Books Completed</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <Card>
              <CardBody className="flex items-center space-x-4 bg-gradient-to-br from-gray-800/50 to-gray-900/30">
                <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/30">
                  <Flame className="h-10 w-10 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Spicy Scenes</p>
                  <p className="text-2xl font-bold text-white">42</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
            <Card>
              <CardBody className="flex items-center space-x-4 bg-gradient-to-br from-gray-800/50 to-gray-900/30">
                <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/30">
                  <Award className="h-10 w-10 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Streak</p>
                  <p className="text-2xl font-bold text-white">7 days</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
        
        {/* Reading Progress Chart */}
        <Card>
          <CardHeader className="border-b border-gray-800">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Reading Progress</h2>
              <div className="flex space-x-2">
                <Button 
                  variant={timeframe === 'week' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={timeframe === 'month' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('month')}
                >
                  Month
                </Button>
                <Button 
                  variant={timeframe === 'year' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('year')}
                >
                  Year
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Line 
              data={readingTimeChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.5)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.5)'
                    }
                  }
                }
              }}
            />
          </CardBody>
        </Card>
        
        {/* Spicy Stats and Genre Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Spice Level Distribution</h2>
            </CardHeader>
            <CardBody>
              <Pie 
                data={spicySceneData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  }
                }}
              />
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader className="border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Genre Distribution</h2>
            </CardHeader>
            <CardBody>
              <Pie 
                data={genreData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  }
                }}
              />
            </CardBody>
          </Card>
        </div>
        
        {/* Reading Achievements */}
        <Card>
          <CardHeader className="border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Trophy className="mr-2 text-yellow-500" />
                Reading Achievements
              </h2>
              <Button variant="outline" size="sm" className="flex items-center">
                <Star className="mr-1 h-4 w-4" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg border bg-gradient-to-br ${achievement.color}`}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <p className="font-medium text-white mb-1">{achievement.title}</p>
                    <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
                    
                    {achievement.isCompleted ? (
                      <div className="flex items-center text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <ProgressBar 
                          value={achievement.progress} 
                          height="sm" 
                          color="primary"
                          animated={achievement.progress < 100}
                        />
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <QuickShareButtons
                        type="achievement"
                        data={{ 
                          achievement: achievement.title, 
                          achievementData: { description: achievement.description } 
                        }}
                        variant="minimal"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;