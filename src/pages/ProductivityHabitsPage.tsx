import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Calendar, Clock, Target, TrendingUp, Plus, CheckCircle, Flame, BookOpen, Coffee, Dumbbell, Moon, Droplets, Edit3, Trash2, BarChart3, Settings, FolderSync as Sync, ExternalLink, Award, Zap, List, AlignLeft, Save, X, Check, Bell, Sparkles } from 'lucide-react';
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

// Predefined habits by category
const PREDEFINED_HABITS = {
  reading: [
    { name: 'Daily Reading Ritual', icon: '📚', description: 'Read for at least 30 minutes every day' },
    { name: 'Conquer a Chapter', icon: '📖', description: 'Complete at least one chapter daily' },
    { name: 'Tame the TBR Hydra', icon: '🐉', description: 'Reduce your to-be-read pile' },
    { name: 'Rate the Spice', icon: '🌶️', description: 'Rate the spice level of what you read today' },
    { name: 'Explore New Tropes', icon: '🔍', description: 'Try a book with a trope you haven\'t read before' },
    { name: 'Expand the Library', icon: '🏛️', description: 'Add a new book to your collection' },
    { name: 'Leave an Offering (Review)', icon: '✍️', description: 'Write a review for a completed book' },
    { name: 'Share the Lore', icon: '📣', description: 'Share your reading progress or thoughts' }
  ],
  personal: [
    { name: 'Hone Your Craft', icon: '🧵', description: 'Practice a creative skill for 20 minutes' },
    { name: 'Decipher Ancient Tomes', icon: '📜', description: 'Learn something new today' },
    { name: 'Train for Battle (Fitness)', icon: '💪', description: 'Complete a workout or physical activity' },
    { name: 'Brew a Potion (Hydration)', icon: '🧪', description: 'Drink at least 8 glasses of water' },
    { name: 'Mind Fortress (Meditation)', icon: '🧘', description: 'Meditate for at least 10 minutes' },
    { name: 'Scry the Soul (Journaling)', icon: '📓', description: 'Write in your journal' },
    { name: 'Seek Forbidden Knowledge', icon: '🔮', description: 'Research a topic you\'re curious about' }
  ],
  productivity: [
    { name: 'Dominate the Day', icon: '📅', description: 'Plan your day in the morning' },
    { name: 'Slay the Inbox Dragon', icon: '📧', description: 'Clear your email inbox' },
    { name: 'Sanctum Upkeep', icon: '🧹', description: 'Clean or organize your space' },
    { name: 'Forge Alliances (Social)', icon: '🤝', description: 'Connect with a friend or family member' },
    { name: 'Manage the Treasury', icon: '💰', description: 'Review your finances' },
    { name: 'Organize the Armory', icon: '🗃️', description: 'Declutter a space or digital files' },
    { name: 'Prepare Provisions (Meal Prep)', icon: '🍱', description: 'Prepare meals in advance' }
  ]
};

const ProductivityHabitsPage: React.FC = () => {
  const { playPraise } = useVoicePraiseStore();
  const { user } = useUserStore();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'habits' | 'calendar' | 'analytics' | 'braindump'>('overview');
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  
  // Enhanced habit creation state
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
  const [selectedCategory, setSelectedCategory] = useState('reading');
  const [selectedPredefinedHabit, setSelectedPredefinedHabit] = useState<number | null>(null);
  
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

  const handleSelectPredefinedHabit = (index: number) => {
    const habit = PREDEFINED_HABITS[selectedCategory as keyof typeof PREDEFINED_HABITS][index];
    setSelectedPredefinedHabit(index);
    setNewHabit(prev => ({
      ...prev,
      name: habit.name,
      description: habit.description,
      icon: habit.icon
    }));
  };

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
    setSelectedPredefinedHabit(null);
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

  const handleToggleHabit = (id: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id ? { ...habit, completedToday: !habit.completedToday } : habit
    ));
  };
  
  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
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

  const renderIconOptions = () => {
    const icons = ['📚', '💧', '🏃', '🧘', '🌙', '☀️', '📝', '🎯', '⏰', '🍎', '🧠', '❤️', '📵', '🔄', '👥', '⭐'];
    
    return (
      <div className="grid grid-cols-8 gap-2">
        {icons.map((icon, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setNewHabit(prev => ({ ...prev, icon }))}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              newHabit.icon === icon ? 'bg-accent text-white' : 'bg-card hover:bg-border'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    );
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
              {/* Habits List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map((habit) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <Card className={`overflow-hidden transition-all duration-300 ${
                      habit.completedToday ? 'border-success-600/50 bg-success-900/10' : ''
                    }`}>
                      <CardBody className="p-0">
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 flex items-center justify-center text-xl rounded-lg bg-card border border-border mr-3">
                                {habit.icon}
                              </div>
                              <div>
                                <h3 className="font-medium text-white">{habit.name}</h3>
                                <p className="text-xs text-gray-400">{habit.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleToggleHabit(habit.id)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                  habit.completedToday 
                                    ? 'bg-success-600/20 text-success-400 hover:bg-success-600/30' 
                                    : 'bg-card hover:bg-border text-gray-400 hover:text-white'
                                }`}
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteHabit(habit.id)}
                                className="w-8 h-8 rounded-lg bg-card hover:bg-border text-gray-400 hover:text-error-400 flex items-center justify-center transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm">
                              <Flame className="h-4 w-4 text-accent mr-1" />
                              <span className="text-gray-400">
                                {habit.streak} day streak
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {habit.completedToday ? 'Completed today' : 'Not completed yet'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-1 w-full bg-border">
                          <div 
                            className="h-full bg-accent transition-all duration-500"
                            style={{ width: habit.completedToday ? '100%' : '0%' }}
                          ></div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Tips Section */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold text-white">Reading Habit Tips</h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="p-2 bg-purple-900/20 rounded-lg border border-purple-700/30 mr-3">
                        <Clock className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white mb-1">Consistent Time</h3>
                        <p className="text-sm text-gray-400">Read at the same time each day to build a strong habit.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 bg-green-900/20 rounded-lg border border-green-700/30 mr-3">
                        <BookOpen className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white mb-1">Start Small</h3>
                        <p className="text-sm text-gray-400">Begin with just 10 minutes of reading and gradually increase.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 bg-blue-900/20 rounded-lg border border-blue-700/30 mr-3">
                        <Bell className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white mb-1">Set Reminders</h3>
                        <p className="text-sm text-gray-400">Use notifications to remind you of your reading time.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 bg-amber-900/20 rounded-lg border border-amber-700/30 mr-3">
                        <Sparkles className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white mb-1">Reward Yourself</h3>
                        <p className="text-sm text-gray-400">Celebrate streaks and milestones to stay motivated.</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
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

        {/* Enhanced Add Habit Modal */}
        {showAddHabit && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg max-h-[90vh] flex flex-col"
            >
              <Card className="flex flex-col max-h-full">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border flex-shrink-0">
                  <h2 className="text-xl font-bold text-white">Add New Reading Habit</h2>
                  <button
                    onClick={() => setShowAddHabit(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </CardHeader>
                <CardBody className="p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Habit Category
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.keys(PREDEFINED_HABITS).map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category);
                              setSelectedPredefinedHabit(null);
                            }}
                            className={`p-2 rounded-lg text-center transition-all ${
                              selectedCategory === category 
                                ? 'bg-accent/20 border border-accent/50 text-white' 
                                : 'bg-card border border-border text-gray-400 hover:bg-border'
                            }`}
                          >
                            <div className="capitalize">{category}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Predefined Habits */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select a Predefined Habit
                      </label>
                      <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                        {PREDEFINED_HABITS[selectedCategory as keyof typeof PREDEFINED_HABITS].map((habit, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectPredefinedHabit(index)}
                            className={`w-full p-3 text-left flex items-center transition-all ${
                              selectedPredefinedHabit === index 
                                ? 'bg-accent/20 text-white' 
                                : 'hover:bg-card text-gray-300'
                            }`}
                          >
                            <span className="text-xl mr-3">{habit.icon}</span>
                            <div>
                              <div className="font-medium">{habit.name}</div>
                              <div className="text-xs text-gray-400">{habit.description}</div>
                            </div>
                            {selectedPredefinedHabit === index && (
                              <Check className="ml-auto h-5 w-5 text-accent" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <h3 className="text-lg font-medium text-white mb-4">Customize Habit</h3>
                      
                      {/* Custom Habit Name */}
                      <div className="mb-4">
                        <Input
                          label="Habit Name"
                          value={newHabit.name}
                          onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Read for 30 minutes"
                          fullWidth
                        />
                      </div>
                      
                      {/* Custom Description */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newHabit.description}
                          onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of this habit"
                          className="w-full p-3 bg-card border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                          rows={2}
                        />
                      </div>
                      
                      {/* Icon Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Icon
                        </label>
                        {renderIconOptions()}
                      </div>
                    </div>
                  </div>
                </CardBody>
                
                {/* Action Buttons - Fixed at bottom */}
                <div className="flex justify-end space-x-3 p-4 border-t border-border mt-auto">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddHabit(false)}
                  >
                    <X size={18} className="mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddHabit}
                    disabled={!newHabit.name.trim()}
                  >
                    <Save size={18} className="mr-2" />
                    Save Habit
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductivityHabitsPage;

