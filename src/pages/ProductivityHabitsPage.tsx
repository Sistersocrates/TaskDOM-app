import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Calendar, Clock, Target, TrendingUp, Plus, CheckCircle, Flame, BookOpen, Coffee, Dumbbell, Moon, Droplets, Edit3, Trash2, BarChart3, Settings, FolderSync as Sync, ExternalLink, Award, Zap, List, AlignLeft, Save, X } from 'lucide-react';
import { useVoicePraiseStore } from '../store/voicePraiseStore';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'reading' | 'health' | 'productivity' | 'wellness';
  targetType: 'daily' | 'weekly' | 'monthly';
  targetValue: number;
  unit: string;
  icon: string;
  color: string;
  streak: number;
  completedToday: boolean;
  todayProgress: number;
  weeklyProgress: number[];
  monthlyProgress: number[];
  isActive: boolean;
  createdAt: Date;
  lastCompleted?: Date;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'reading' | 'habit' | 'goal';
  description?: string;
  color: string;
}

interface BraindumpNote {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isBulletList: boolean;
  tags: string[];
}

const ProductivityHabitsPage: React.FC = () => {
  const { playPraise } = useVoicePraiseStore();
  const { user } = useUserStore();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'habits' | 'calendar' | 'analytics' | 'braindump'>('overview');
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'reading' as const,
    targetType: 'daily' as const,
    targetValue: 1,
    unit: 'times',
    icon: '📚',
    color: '#DC2626'
  });
  
  // Braindump state
  const [notes, setNotes] = useState<BraindumpNote[]>([]);
  const [currentNote, setCurrentNote] = useState<BraindumpNote | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isBulletList, setIsBulletList] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Initialize with some default habits
  useEffect(() => {
    const defaultHabits: Habit[] = [
      {
        id: '1',
        name: 'Daily Reading',
        description: 'Read for at least 30 minutes every day',
        category: 'reading',
        targetType: 'daily',
        targetValue: 30,
        unit: 'minutes',
        icon: '📚',
        color: '#DC2626',
        streak: 5,
        completedToday: true,
        todayProgress: 45,
        weeklyProgress: [30, 45, 60, 25, 40, 45, 35],
        monthlyProgress: Array.from({ length: 30 }, () => Math.floor(Math.random() * 60) + 10),
        isActive: true,
        createdAt: new Date(),
        lastCompleted: new Date()
      },
      {
        id: '2',
        name: 'Spicy Scene Tracking',
        description: 'Mark interesting scenes in books',
        category: 'reading',
        targetType: 'weekly',
        targetValue: 5,
        unit: 'scenes',
        icon: '🌶️',
        color: '#EF4444',
        streak: 3,
        completedToday: false,
        todayProgress: 2,
        weeklyProgress: [3, 5, 4, 6, 2, 2, 0],
        monthlyProgress: Array.from({ length: 30 }, () => Math.floor(Math.random() * 8)),
        isActive: true,
        createdAt: new Date()
      },
      {
        id: '3',
        name: 'Water Intake',
        description: 'Drink 8 glasses of water daily',
        category: 'health',
        targetType: 'daily',
        targetValue: 8,
        unit: 'glasses',
        icon: '💧',
        color: '#3B82F6',
        streak: 12,
        completedToday: false,
        todayProgress: 5,
        weeklyProgress: [8, 7, 8, 6, 8, 5, 0],
        monthlyProgress: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 2),
        isActive: true,
        createdAt: new Date()
      },
      {
        id: '4',
        name: 'Exercise',
        description: 'Work out for 30 minutes',
        category: 'health',
        targetType: 'daily',
        targetValue: 30,
        unit: 'minutes',
        icon: '💪',
        color: '#10B981',
        streak: 2,
        completedToday: true,
        todayProgress: 45,
        weeklyProgress: [30, 0, 45, 30, 0, 45, 0],
        monthlyProgress: Array.from({ length: 30 }, () => Math.floor(Math.random() * 60)),
        isActive: true,
        createdAt: new Date()
      }
    ];
    setHabits(defaultHabits);
    
    // Initialize with some sample notes
    const sampleNotes: BraindumpNote[] = [
      {
        id: '1',
        content: "Books to read this month:\n- Fourth Wing by Rebecca Yarros\n- A Court of Thorns and Roses by Sarah J. Maas\n- The Love Hypothesis by Ali Hazelwood",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        isBulletList: true,
        tags: ['books', 'tbr']
      },
      {
        id: '2',
        content: "Reading goals for the year:\n1. Read 50 books\n2. Try at least 5 new authors\n3. Read more fantasy romance\n4. Join a book club",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        isBulletList: true,
        tags: ['goals', 'reading']
      },
      {
        id: '3',
        content: "Thoughts on Fourth Wing: This book completely blew me away! The world-building is incredible, and the romance is so well developed. Can't wait for the sequel!",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isBulletList: false,
        tags: ['review', 'fantasy']
      }
    ];
    setNotes(sampleNotes);
  }, []);

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) return;

    const habit: Habit = {
      id: Date.now().toString(),
      ...newHabit,
      streak: 0,
      completedToday: false,
      todayProgress: 0,
      weeklyProgress: Array.from({ length: 7 }, () => 0),
      monthlyProgress: Array.from({ length: 30 }, () => 0),
      isActive: true,
      createdAt: new Date()
    };

    setHabits(prev => [...prev, habit]);
    setNewHabit({
      name: '',
      description: '',
      category: 'reading',
      targetType: 'daily',
      targetValue: 1,
      unit: 'times',
      icon: '📚',
      color: '#DC2626'
    });
    setShowAddHabit(false);
    playPraise('task_complete');
  };

  const updateHabitProgress = (habitId: string, progress: number) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const wasCompleted = habit.completedToday;
        const isNowCompleted = progress >= habit.targetValue;
        
        // Play praise if habit was just completed
        if (!wasCompleted && isNowCompleted) {
          playPraise('daily_goal');
        }

        return {
          ...habit,
          todayProgress: progress,
          completedToday: isNowCompleted,
          lastCompleted: isNowCompleted ? new Date() : habit.lastCompleted,
          streak: isNowCompleted && !wasCompleted ? habit.streak + 1 : habit.streak
        };
      }
      return habit;
    }));
  };

  const connectGoogleCalendar = async () => {
    // Mock Google Calendar connection
    setIsCalendarConnected(true);
    
    // Generate some mock calendar events
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Reading Session - ACOTAR',
        start: new Date(2024, 11, 15, 19, 0),
        end: new Date(2024, 11, 15, 20, 0),
        type: 'reading',
        description: 'Continue reading A Court of Thorns and Roses',
        color: '#DC2626'
      },
      {
        id: '2',
        title: 'Book Club Meeting',
        start: new Date(2024, 11, 16, 18, 0),
        end: new Date(2024, 11, 16, 19, 30),
        type: 'reading',
        description: 'Discuss chapters 10-15',
        color: '#7C3AED'
      },
      {
        id: '3',
        title: 'Daily Reading Goal',
        start: new Date(2024, 11, 17, 20, 0),
        end: new Date(2024, 11, 17, 20, 30),
        type: 'goal',
        description: '30 minutes reading target',
        color: '#059669'
      }
    ];
    
    setCalendarEvents(mockEvents);
    playPraise('achievement');
  };

  const getTotalStreakDays = () => {
    return habits.reduce((total, habit) => total + habit.streak, 0);
  };

  const getCompletedHabitsToday = () => {
    return habits.filter(habit => habit.completedToday).length;
  };

  const getWeeklyCompletionRate = () => {
    const totalPossible = habits.length * 7;
    const totalCompleted = habits.reduce((sum, habit) => 
      sum + habit.weeklyProgress.filter(day => day >= habit.targetValue).length, 0
    );
    return Math.round((totalCompleted / totalPossible) * 100);
  };

  const categoryIcons = {
    reading: BookOpen,
    health: Dumbbell,
    productivity: Target,
    wellness: Moon
  };

  const categoryColors = {
    reading: 'bg-red-900/20 text-red-300',
    health: 'bg-green-900/20 text-green-300',
    productivity: 'bg-blue-900/20 text-blue-300',
    wellness: 'bg-purple-900/20 text-purple-300'
  };
  
  // Braindump functions
  const createNewNote = () => {
    setCurrentNote(null);
    setNoteContent('');
    setIsBulletList(false);
    setNoteTags([]);
    setIsEditingNote(true);
  };
  
  const editNote = (note: BraindumpNote) => {
    setCurrentNote(note);
    setNoteContent(note.content);
    setIsBulletList(note.isBulletList);
    setNoteTags(note.tags);
    setIsEditingNote(true);
  };
  
  const saveNote = () => {
    if (!noteContent.trim()) {
      setIsEditingNote(false);
      return;
    }
    
    const now = new Date();
    
    if (currentNote) {
      // Update existing note
      setNotes(prev => prev.map(note => 
        note.id === currentNote.id 
          ? { ...note, content: noteContent, updatedAt: now, isBulletList, tags: noteTags }
          : note
      ));
    } else {
      // Create new note
      const newNote: BraindumpNote = {
        id: Date.now().toString(),
        content: noteContent,
        createdAt: now,
        updatedAt: now,
        isBulletList,
        tags: noteTags
      };
      setNotes(prev => [newNote, ...prev]);
    }
    
    setIsEditingNote(false);
    setCurrentNote(null);
    setNoteContent('');
    setIsBulletList(false);
    setNoteTags([]);
    
    // Play praise for completing a note
    playPraise('task_complete');
  };
  
  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    
    if (currentNote?.id === id) {
      setIsEditingNote(false);
      setCurrentNote(null);
      setNoteContent('');
    }
  };
  
  const addTag = () => {
    if (newTag.trim() && !noteTags.includes(newTag.trim())) {
      setNoteTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const removeTag = (tag: string) => {
    setNoteTags(prev => prev.filter(t => t !== tag));
  };
  
  const formatNoteContent = (content: string, isBulletList: boolean) => {
    if (!isBulletList) return content;
    
    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('- ')) return line;
      if (line.trim().startsWith('• ')) return line;
      if (line.trim().startsWith('* ')) return line;
      if (line.trim().startsWith('1. ')) return line;
      if (line.trim().startsWith('2. ')) return line;
      if (line.trim().startsWith('3. ')) return line;
      if (line.trim().startsWith('4. ')) return line;
      if (line.trim().startsWith('5. ')) return line;
      if (line.trim().startsWith('6. ')) return line;
      if (line.trim().startsWith('7. ')) return line;
      if (line.trim().startsWith('8. ')) return line;
      if (line.trim().startsWith('9. ')) return line;
      if (line.trim().startsWith('10. ')) return line;
      if (line.trim() === '') return line;
      return `- ${line}`;
    }).join('\n');
  };
  
  const filterNotesByTag = (tag: string) => {
    if (tag === 'all') return notes;
    return notes.filter(note => note.tags.includes(tag));
  };
  
  const getAllTags = () => {
    const allTags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Target className="mr-3" />
              Productivity & Habits
            </h1>
            <p className="text-gray-400 mt-2">
              Track your reading habits and personal goals in one place
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={connectGoogleCalendar}
              variant={isCalendarConnected ? 'primary' : 'outline'}
              className="flex items-center"
            >
              {isCalendarConnected ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Calendar Connected
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Connect Google Calendar
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowAddHabit(true)}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="p-3 bg-red-900/20 rounded-lg">
                <Flame className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Streak Days</p>
                <p className="text-2xl font-bold text-white">{getTotalStreakDays()}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="p-3 bg-green-900/20 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Completed Today</p>
                <p className="text-2xl font-bold text-white">{getCompletedHabitsToday()}/{habits.length}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="p-3 bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Weekly Success Rate</p>
                <p className="text-2xl font-bold text-white">{getWeeklyCompletionRate()}%</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-4">
              <div className="p-3 bg-purple-900/20 rounded-lg">
                <Award className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Habits</p>
                <p className="text-2xl font-bold text-white">{habits.filter(h => h.isActive).length}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Card>
          <CardBody className="p-0">
            <div className="flex border-b border-red-900/30">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'habits', label: 'Habits', icon: Target },
                { key: 'calendar', label: 'Calendar', icon: Calendar },
                { key: 'analytics', label: 'Analytics', icon: TrendingUp },
                { key: 'braindump', label: 'Braindump', icon: AlignLeft }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                    activeTab === key
                      ? 'border-b-2 border-primary-500 text-primary-400 bg-primary-900/20'
                      : 'text-gray-400 hover:text-primary-400 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 mx-auto mb-1" />
                  {label}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Today's Habits */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white">Today's Habits</h2>
                  <p className="text-gray-400">Track your daily progress</p>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {habits.filter(h => h.targetType === 'daily').map((habit) => {
                      const Icon = categoryIcons[habit.category];
                      const progress = (habit.todayProgress / habit.targetValue) * 100;
                      
                      return (
                        <div
                          key={habit.id}
                          className="p-4 border border-gray-700 rounded-lg bg-gray-800 hover:border-primary-500/50 transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${categoryColors[habit.category]}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium text-white">{habit.name}</h3>
                                <p className="text-sm text-gray-400">{habit.description}</p>
                              </div>
                            </div>
                            {habit.completedToday && (
                              <CheckCircle className="h-6 w-6 text-green-400" />
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-white">
                                {habit.todayProgress} / {habit.targetValue} {habit.unit}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  habit.completedToday ? 'bg-green-500' : 'bg-primary-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {habit.streak} day streak
                              </span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateHabitProgress(habit.id, Math.max(0, habit.todayProgress - 1))}
                                >
                                  -
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateHabitProgress(habit.id, habit.todayProgress + 1)}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>

              {/* Weekly Overview */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white">Weekly Overview</h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-xs text-gray-400 mb-2">{day}</div>
                        <div className="space-y-1">
                          {habits.slice(0, 4).map((habit) => {
                            const completed = habit.weeklyProgress[index] >= habit.targetValue;
                            return (
                              <div
                                key={habit.id}
                                className={`w-full h-2 rounded ${
                                  completed ? 'bg-green-500' : 'bg-gray-700'
                                }`}
                                title={`${habit.name}: ${habit.weeklyProgress[index]}/${habit.targetValue} ${habit.unit}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {activeTab === 'habits' && (
            <motion.div
              key="habits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Habit Categories */}
              {Object.entries(
                habits.reduce((acc, habit) => {
                  if (!acc[habit.category]) acc[habit.category] = [];
                  acc[habit.category].push(habit);
                  return acc;
                }, {} as Record<string, Habit[]>)
              ).map(([category, categoryHabits]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                
                return (
                  <Card key={category}>
                    <CardHeader>
                      <h2 className="text-xl font-semibold text-white flex items-center">
                        <Icon className="mr-2" />
                        {category.charAt(0).toUpperCase() + category.slice(1)} Habits
                      </h2>
                    </CardHeader>
                    <CardBody>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryHabits.map((habit) => (
                          <div
                            key={habit.id}
                            className="p-4 border border-gray-700 rounded-lg bg-gray-800"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{habit.icon}</span>
                                <div>
                                  <h3 className="font-medium text-white">{habit.name}</h3>
                                  <p className="text-xs text-gray-400">{habit.targetType}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button size="sm" variant="ghost">
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-400 mb-3">{habit.description}</p>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Target</span>
                                <span className="text-white">{habit.targetValue} {habit.unit}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Streak</span>
                                <span className="text-white flex items-center">
                                  <Flame className="h-3 w-3 mr-1 text-orange-400" />
                                  {habit.streak} days
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Status</span>
                                <span className={`text-sm ${habit.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                                  {habit.isActive ? 'Active' : 'Paused'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Calendar Integration</h2>
                    {isCalendarConnected && (
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Sync className="mr-2 h-4 w-4" />
                        Sync Now
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  {!isCalendarConnected ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                      <h3 className="text-lg font-medium text-white mb-2">Connect Your Google Calendar</h3>
                      <p className="text-gray-400 mb-6">
                        Sync your reading sessions and habit reminders with Google Calendar
                      </p>
                      <Button onClick={connectGoogleCalendar} className="flex items-center mx-auto">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Connect Google Calendar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">Upcoming Events</h3>
                        <span className="text-sm text-green-400 flex items-center">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Connected
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {calendarEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-4 border border-gray-700 rounded-lg bg-gray-800 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: event.color }}
                              />
                              <div>
                                <h4 className="font-medium text-white">{event.title}</h4>
                                <p className="text-sm text-gray-400">
                                  {event.start.toLocaleDateString()} at {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {event.description && (
                                  <p className="text-xs text-gray-500">{event.description}</p>
                                )}
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              event.type === 'reading' ? 'bg-red-900/30 text-red-300' :
                              event.type === 'habit' ? 'bg-blue-900/30 text-blue-300' :
                              'bg-green-900/30 text-green-300'
                            }`}>
                              {event.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-white">Completion Trends</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {habits.map((habit) => {
                        const weeklyCompletion = habit.weeklyProgress.filter(day => day >= habit.targetValue).length;
                        const completionRate = (weeklyCompletion / 7) * 100;
                        
                        return (
                          <div key={habit.id} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-white">{habit.name}</span>
                              <span className="text-sm text-gray-400">{Math.round(completionRate)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 bg-primary-500 rounded-full transition-all duration-300"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-white">Streak Analysis</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {habits.sort((a, b) => b.streak - a.streak).map((habit) => (
                        <div key={habit.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{habit.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-white">{habit.name}</p>
                              <p className="text-xs text-gray-400">{habit.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Flame className="h-4 w-4 text-orange-400" />
                            <span className="text-sm font-medium text-white">{habit.streak}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-white">Monthly Heatmap</h2>
                  <p className="text-gray-400">Visual representation of your habit consistency</p>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: 30 }, (_, index) => {
                      const completedHabits = habits.filter(habit => 
                        habit.monthlyProgress[index] >= habit.targetValue
                      ).length;
                      const intensity = completedHabits / habits.length;
                      
                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded-sm ${
                            intensity === 0 ? 'bg-gray-800' :
                            intensity < 0.33 ? 'bg-red-900/30' :
                            intensity < 0.66 ? 'bg-red-700/50' :
                            'bg-red-500'
                          }`}
                          title={`Day ${index + 1}: ${completedHabits}/${habits.length} habits completed`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                    <span>Less</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gray-800 rounded-sm" />
                      <div className="w-3 h-3 bg-red-900/30 rounded-sm" />
                      <div className="w-3 h-3 bg-red-700/50 rounded-sm" />
                      <div className="w-3 h-3 bg-red-500 rounded-sm" />
                    </div>
                    <span>More</span>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
          
          {/* Braindump Tab */}
          {activeTab === 'braindump' && (
            <motion.div
              key="braindump"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <AlignLeft className="mr-2" />
                  Braindump Notes
                </h2>
                <Button
                  onClick={createNewNote}
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Note Editor */}
                <div className="lg:col-span-2">
                  <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        {isEditingNote 
                          ? currentNote 
                            ? 'Edit Note' 
                            : 'New Note' 
                          : 'Note Editor'}
                      </h3>
                      {isEditingNote && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingNote(false)}
                            className="flex items-center"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={saveNote}
                            className="flex items-center"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardBody>
                      {isEditingNote ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Button
                              variant={isBulletList ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => setIsBulletList(!isBulletList)}
                              className="flex items-center"
                            >
                              <List className="h-4 w-4 mr-1" />
                              Bullet List
                            </Button>
                          </div>
                          
                          <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Write your thoughts, ideas, or to-do list here..."
                            className="w-full h-64 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono"
                          />
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {noteTags.map(tag => (
                                <div 
                                  key={tag} 
                                  className="flex items-center bg-red-900/20 text-red-300 px-2 py-1 rounded-full text-xs border border-red-900/30"
                                >
                                  {tag}
                                  <button 
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 text-red-300 hover:text-red-100"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add a tag..."
                                className="flex-grow"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag();
                                  }
                                }}
                              />
                              <Button
                                onClick={addTag}
                                size="sm"
                                variant="outline"
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                          <div className="text-center">
                            <AlignLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Select a note to view or edit, or create a new note</p>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
                
                {/* Notes List */}
                <div className="lg:col-span-1">
                  <Card className="h-full">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-white">Your Notes</h3>
                    </CardHeader>
                    <CardBody className="overflow-y-auto max-h-[600px]">
                      {notes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <AlignLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No notes yet</p>
                          <Button 
                            onClick={createNewNote}
                            size="sm"
                            className="mt-4"
                          >
                            Create Your First Note
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {notes.map(note => (
                            <motion.div
                              key={note.id}
                              className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 hover:border-primary-500/50 transition-all cursor-pointer"
                              onClick={() => editNote(note)}
                              whileHover={{ x: 5 }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                  {note.isBulletList ? (
                                    <List className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <AlignLeft className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className="text-xs text-gray-400">
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.id);
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-400" />
                                </Button>
                              </div>
                              
                              <div className="text-sm text-white line-clamp-3 whitespace-pre-line">
                                {note.content}
                              </div>
                              
                              {note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {note.tags.map(tag => (
                                    <span 
                                      key={tag}
                                      className="text-xs bg-red-900/20 text-red-300 px-2 py-0.5 rounded-full border border-red-900/30"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Habit Modal */}
        {showAddHabit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">Add New Habit</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Habit Name"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Daily Reading"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newHabit.description}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your habit..."
                    className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
                  >
                    <option value="reading">Reading</option>
                    <option value="health">Health</option>
                    <option value="productivity">Productivity</option>
                    <option value="wellness">Wellness</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target</label>
                    <Input
                      type="number"
                      value={newHabit.targetValue}
                      onChange={(e) => setNewHabit(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Unit</label>
                    <Input
                      value={newHabit.unit}
                      onChange={(e) => setNewHabit(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g., minutes, times"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                  <div className="grid grid-cols-6 gap-2">
                    {['📚', '🌶️', '💧', '💪', '🧘', '☕', '🎯', '⏰'].map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewHabit(prev => ({ ...prev, icon }))}
                        className={`p-2 text-2xl border rounded-lg transition-all ${
                          newHabit.icon === icon 
                            ? 'border-primary-500 bg-primary-900/20' 
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setShowAddHabit(false)}
                    variant="outline"
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddHabit}
                    fullWidth
                  >
                    Add Habit
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductivityHabitsPage;