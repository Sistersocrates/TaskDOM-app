import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import BookCard from '../components/BookCard';
import TaskItem from '../components/TaskItem';
import ReadingTimer from '../components/ReadingTimer';
import DailyGoalCard from '../components/DailyGoalCard';
import SpiceRating from '../components/SpiceRating';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import QuickShareButtons from '../components/QuickShareButtons';
import { Plus, BookOpen, Clock, Award, BookMarked, Flame, TrendingUp, Share2 } from 'lucide-react';
import { mockBooks, mockTasks, mockUser } from '../utils/mockData';
import { Task } from '../types';
import { useVoicePraiseStore } from '../store/voicePraiseStore';
import { useSocialShare } from '../hooks/useSocialShare';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { googleBooksService } from '../services/googleBooksService';
import { openLibraryService } from '../services/openLibraryService';
import { useUserStore } from '../store/userStore';

const HomePage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [minutesRead, setMinutesRead] = useState<number>(25);
  const [books, setBooks] = useState(mockBooks);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  
  const playPraise = useVoicePraiseStore(state => state.playPraise);
  const { shareProgress, shareStreak, shareReadingList } = useSocialShare();
  const { user } = useUserStore();
  
  // Filtered books - currently reading
  const currentlyReading = books.filter(book => book.status === 'currentlyReading');
  
  // Fetch enhanced book covers on component mount
  useEffect(() => {
    const enhanceBookCovers = async () => {
      setIsLoadingBooks(true);
      
      const enhancedBooks = await Promise.all(
        books.map(async (book) => {
          try {
            // Try to get enhanced cover from Google Books
            let enhancedCover = null;
            
            // Try by ISBN first
            if (book.isbn) {
              const googleBook = await googleBooksService.getBookByISBN(book.isbn);
              if (googleBook?.imageLinks) {
                enhancedCover = googleBook.imageLinks.large || 
                               googleBook.imageLinks.medium || 
                               googleBook.imageLinks.small || 
                               googleBook.imageLinks.thumbnail;
              }
            }
            
            // If no cover from ISBN, try searching by title and author
            if (!enhancedCover) {
              const searchResults = await googleBooksService.searchBooks(`${book.title} ${book.author}`, 1);
              if (searchResults.length > 0 && searchResults[0].imageLinks) {
                const imageLinks = searchResults[0].imageLinks;
                enhancedCover = imageLinks.large || 
                               imageLinks.medium || 
                               imageLinks.small || 
                               imageLinks.thumbnail;
              }
            }
            
            // If still no cover, try Open Library
            if (!enhancedCover) {
              enhancedCover = await openLibraryService.getBestCoverImage(
                book.isbn, 
                book.title, 
                book.author
              );
            }
            
            // Return book with enhanced cover if found
            if (enhancedCover) {
              return { ...book, coverImage: enhancedCover };
            }
            
            // Return original book if no enhanced cover found
            return book;
          } catch (error) {
            console.error(`Error enhancing cover for ${book.title}:`, error);
            return book;
          }
        })
      );
      
      setBooks(enhancedBooks);
      setIsLoadingBooks(false);
    };
    
    enhanceBookCovers();
  }, []);
  
  // Handle task completion
  const handleTaskComplete = (id: string, completed: boolean) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed } : task
    ));
    
    if (completed) {
      // Play task completion praise using selected voice
      playPraise('task_complete');
    }
  };
  
  // Handle task deletion
  const handleTaskDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // Add new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        completed: false,
        createdAt: new Date()
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    }
  };
  
  // Timer complete handler
  const handleTimerComplete = () => {
    setMinutesRead(minutesRead + 30); // Add timer default (30) to minutes read
    
    // Check if daily goal is reached
    if (minutesRead + 30 >= mockUser.dailyReadingGoal.amount) {
      playPraise('daily_goal');
    }
  };

  // Share handlers
  const handleShareStreak = () => {
    shareStreak(5); // Mock 5-day streak
  };

  const handleShareLibrary = () => {
    shareReadingList(books);
  };

  // Get user's first name for personalized greeting
  const getFirstName = () => {
    if (user?.displayName) {
      // Split display name and get first part
      return user.displayName.split(' ')[0];
    }
    return 'Reader'; // Fallback
  };
  
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-900/50 rounded-xl p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-3 text-white">
                  Welcome back, <span className="text-red-400">{getFirstName()}</span>!
                </h1>
                <p className="text-gray-300 text-lg">Ready for another spicy reading session?</p>
              </div>
              <div className="flex items-center space-x-2">
                <QuickShareButtons
                  type="streak"
                  data={{ streakDays: 5 }}
                  variant="minimal"
                />
                <Button
                  onClick={handleShareStreak}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Share2 size={16} className="mr-1" />
                  Share Streak
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-red-900/30 flex items-center"
              >
                <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/50 mr-4">
                  <Clock className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Time Read Today</p>
                  <p className="text-2xl font-bold text-red-400">{minutesRead} mins</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-red-900/30 flex items-center"
              >
                <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/50 mr-4">
                  <BookOpen className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Current Books</p>
                  <p className="text-2xl font-bold text-red-400">{currentlyReading.length}</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-red-900/30 flex items-center"
              >
                <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/50 mr-4">
                  <Flame className="h-6 w-6 text-red-400" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Reading Streak</p>
                    <p className="text-2xl font-bold text-red-400">5 days</p>
                  </div>
                  <QuickShareButtons
                    type="streak"
                    data={{ streakDays: 5 }}
                    variant="minimal"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Reading stats and timer */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DailyGoalCard 
                goal={mockUser.dailyReadingGoal} 
                current={minutesRead} 
              />
              
              <ReadingTimer 
                defaultMinutes={30} 
                onComplete={handleTimerComplete} 
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <BookMarked className="mr-3 text-red-400" /> 
                  Currently Reading
                </h2>
                <div className="flex items-center space-x-3">
                  <QuickShareButtons
                    type="progress"
                    data={{ book: currentlyReading[0] }}
                    variant="minimal"
                  />
                  <Link to="/library">
                    <Button variant="outline" size="sm">
                      View All Books
                    </Button>
                  </Link>
                </div>
              </div>
              
              {isLoadingBooks ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-800 rounded-lg aspect-[9/16] w-full mb-2"></div>
                      <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {currentlyReading.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative group"
                    >
                      <Link to={`/reading/${book.id}`}>
                        <BookCard book={book} size="md" />
                      </Link>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <QuickShareButtons
                          type="progress"
                          data={{ book }}
                          variant="minimal"
                          className="bg-black/50 p-2 rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right column: Tasks and Reading List */}
          <div className="space-y-6">
            <Card variant="dark">
              <CardHeader>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Award className="mr-2 text-red-400" />
                  Daily Tasks
                </h2>
              </CardHeader>
              
              <CardBody>
                <form onSubmit={handleAddTask} className="mb-6">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Add a new task..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-grow"
                    />
                    <Button type="submit" size="sm">
                      <Plus size={18} />
                    </Button>
                  </div>
                </form>
                
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onComplete={handleTaskComplete}
                      onDelete={handleTaskDelete}
                    />
                  ))}
                </div>
                
                {tasks.length === 0 && (
                  <p className="text-center text-gray-500 py-6">
                    No tasks yet. Add some to get started!
                  </p>
                )}
              </CardBody>
            </Card>
            
            <Card variant="dark">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <TrendingUp className="mr-2 text-red-400" />
                    My Reading List
                  </h2>
                  <Button
                    onClick={handleShareLibrary}
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                  >
                    <Share2 size={16} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardBody>
                <div className="space-y-4">
                  {isLoadingBooks ? (
                    // Loading skeleton
                    Array(3).fill(0).map((_, index) => (
                      <div key={index} className="animate-pulse flex items-center p-3 bg-gray-800/50 rounded-lg">
                        <div className="bg-gray-700 w-12 h-16 rounded mr-3"></div>
                        <div className="flex-grow">
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                          <div className="h-2 bg-gray-700 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    books
                      .filter(book => book.status === 'wantToRead')
                      .slice(0, 3)
                      .map((book) => (
                        <motion.div 
                          key={book.id} 
                          whileHover={{ x: 5 }}
                          className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-red-700/50 transition-all cursor-pointer group"
                        >
                          <img 
                            src={book.coverImage} 
                            alt={book.title} 
                            className="w-12 h-16 object-cover rounded mr-3 shadow-sm"
                            onError={(e) => {
                              // Fallback image if loading fails
                              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg';
                            }}
                          />
                          <div className="flex-grow min-w-0">
                            <h3 className="font-medium text-sm text-white truncate">{book.title}</h3>
                            <p className="text-xs text-gray-400">{book.author}</p>
                            <div className="mt-1">
                              <SpiceRating value={book.spiceRating} size="sm" readonly />
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <QuickShareButtons
                              type="progress"
                              data={{ book }}
                              variant="minimal"
                            />
                          </div>
                        </motion.div>
                      ))
                  )}
                </div>
                
                <Link to="/library">
                  <Button variant="outline" fullWidth className="mt-6">
                    View All Books
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </div>
        </div>
        
        {/* Built with Bolt Badge */}
        <div className="flex justify-center mt-8 pt-6 border-t border-gray-800">
          <a 
            href="https://stackblitz.com/bolt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors border border-gray-700/50"
          >
            <span className="text-sm text-gray-400">Built with</span>
            <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Bolt</span>
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;