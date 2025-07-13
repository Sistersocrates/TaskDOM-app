import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { ArrowLeft, Bookmark, Share2, Settings, Save, Loader2, Image, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import ReadingTimer from '../components/ReadingTimer';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Input from '../components/ui/Input';
import VoicePraiseSettings from '../components/VoicePraiseSettings';
import ReadingProgressSync from '../components/ReadingProgressSync';
import ReadingProgressIndicator from '../components/ReadingProgressIndicator';
import QuickShareButtons from '../components/QuickShareButtons';
import SpiceRating from '../components/SpiceRating';
import { mockBooks } from '../utils/mockData';
import { Book } from '../types';
import { useVoicePraiseStore } from '../store/voicePraiseStore';
import { useSocialShare } from '../hooks/useSocialShare';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useBookCovers } from '../hooks/useBookCovers';

const ReadingPage: React.FC = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [spiceRating, setSpiceRating] = useState<number>(0);
  
  const { isLoading: isLoadingCover } = useBookCovers(book ? [book] : []);

  const playPraise = useVoicePraiseStore(state => state.playPraise);
  const { shareProgress } = useSocialShare();
  const {
    progress,
    updateProgress,
    startSession,
    endSession,
    addBookmark,
    currentSession
  } = useReadingProgress(bookId || '');
  
  useEffect(() => {
    const foundBook = mockBooks.find(b => b.id === bookId);
    if (foundBook) {
      setBook(foundBook);
      setSpiceRating(foundBook.spiceRating);
      
      // Initialize with book's current page if no progress exists
      if (!progress) {
        setCurrentPage(foundBook.currentPage);
      }
    }
  }, [bookId, progress]);

  useEffect(() => {
    // Set current page from progress when it loads
    if (progress) {
      setCurrentPage(progress.current_page);
    }
  }, [progress]);

  useEffect(() => {
    // Initialize voice praise engine
    useVoicePraiseStore.getState().initialize();
  }, []);

  useEffect(() => {
    // Start reading session when page loads
    if (bookId && !currentSession) {
      startSession();
      // Play session start praise
      playPraise('session_start');
    }

    // End session when page unloads
    return () => {
      if (currentSession) {
        const pagesRead = Math.max(0, currentPage - (progress?.current_page || 0));
        endSession(pagesRead, 0); // Minutes will be calculated by timer
        // Play session end praise
        playPraise('session_end');
      }
    };
  }, [bookId, currentSession, startSession, endSession, currentPage, progress, playPraise]);
  
  if (!book) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Book not found</p>
        </div>
      </MainLayout>
    );
  }
  
  const handleTimerComplete = () => {
    playPraise("session_end");
  };
  
  const handlePageUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = parseInt(e.target.value, 10);
    if (!isNaN(newPage) && newPage >= 0 && newPage <= book.totalPages) {
      setCurrentPage(newPage);
      setHasUnsavedChanges(true);
      
      // Auto-save progress after a short delay
      setTimeout(() => {
        saveProgress(newPage);
      }, 1000);
    }
  };

  const saveProgress = async (pageToSave?: number) => {
    const pageNumber = pageToSave || currentPage;
    await updateProgress(pageNumber, book.totalPages);
    setHasUnsavedChanges(false);
    
    // Trigger praise for progress milestones
    const progressPercentage = (pageNumber / book.totalPages) * 100;
    if (progressPercentage >= 25 && progressPercentage < 26) {
      playPraise("progress_25");
    } else if (progressPercentage >= 50 && progressPercentage < 51) {
      playPraise("progress_50");
    } else if (progressPercentage >= 75 && progressPercentage < 76) {
      playPraise("progress_75");
    } else if (progressPercentage >= 100) {
      playPraise("progress_100");
    }
  };

  const handleAddSpicyScene = async () => {
    await addBookmark(currentPage, note, 'spicy_scene');
    setNote('');
    setShowSpicySceneModal(false);
    playPraise("spicy_scene");
  };

  const handleAddBookmark = async () => {
    await addBookmark(currentPage, note, 'bookmark');
    setNote('');
  };

  const handleImageError = async () => {
    setCoverError(true);
    setRetryCount(prev => prev + 1);
    
    // Try to find an alternative cover
    try {
      setIsLoadingCover(true);
      
      // Try Open Library as a fallback
      const openLibraryCover = await openLibraryService.getBestCoverImage(
        book.isbn, 
        book.title, 
        book.author
      );
      
      if (openLibraryCover) {
        setCoverImage(openLibraryCover);
        setCoverError(false);
      } else {
        // Ultimate fallback
        setCoverImage('https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg');
      }
    } catch (error) {
      console.error('Failed to fetch fallback cover:', error);
      setCoverImage('https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg');
    } finally {
      setIsLoadingCover(false);
    }
  };

  const handleShareProgress = () => {
    if (book) {
      shareProgress(book);
    }
  };

  const handleSpiceRatingChange = (rating: number) => {
    setSpiceRating(rating);
    // In a real app, you would update the book's spice rating in the database
  };
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-primary-500"
          >
            <ArrowLeft size={24} className="mr-2" />
            Back to Library
          </button>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleAddBookmark}
            >
              <Bookmark size={18} className="mr-2" />
              Bookmark
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handleShareProgress}
            >
              <Share2 size={18} className="mr-2" />
              Share
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={18} className="mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Progress Sync Status */}
        <ReadingProgressSync bookId={book.id} className="mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Book Cover with 9:16 Aspect Ratio */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <CardBody className="p-0">
                <div className="relative aspect-[9/16] w-full">
                  {isLoadingCover && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    </div>
                  )}
                  
                  {coverError ? (
                    <div className="w-full h-full bg-card flex items-center justify-center">
                      <div className="text-center p-6">
                        <Image className="h-12 w-12 text-border mx-auto mb-3" />
                        <p className="text-secondary-text">Cover image not available</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      loading="lazy"
                    />
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Spice Rating */}
            <Card className="mt-4">
              <CardBody>
                <h3 className="text-lg font-semibold mb-3 text-white">Spice Rating</h3>
                <div className="flex items-center justify-between">
                  <SpiceRating 
                    value={spiceRating} 
                    onChange={handleSpiceRatingChange} 
                    size="lg" 
                  />
                  <span className="text-sm text-gray-400">
                    {spiceRating}/5
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* Spicy Scenes */}
            <Card className="mt-4">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Spicy Scenes</h3>
              </CardHeader>
              <CardBody>
                {book.spicyScenes && book.spicyScenes.length > 0 ? (
                  <div className="space-y-3">
                    {book.spicyScenes.map(scene => (
                      <div key={scene.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-white">Page {scene.page}</span>
                          <SpiceRating value={scene.rating} readonly size="sm" />
                        </div>
                        {scene.note && (
                          <p className="text-xs text-gray-400 mt-1">{scene.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <BookOpen className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No spicy scenes marked yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setShowSpicySceneModal(true)}
                    >
                      Mark Spicy Scene
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
          
          {/* Right Column: Book Info and Reading Controls */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2 text-white font-cinzel">{book.title}</h1>
                    <p className="text-gray-400">{book.author}</p>
                  </div>
                  <QuickShareButtons
                    type="progress"
                    data={{ book }}
                    variant="minimal"
                  />
                </div>
                
                {/* Progress Indicator */}
                <div className="mt-4">
                  <ReadingProgressIndicator bookId={book.id} />
                </div>
              </CardBody>
            </Card>
            
            {/* Reading Timer and Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReadingTimer
                defaultMinutes={30}
                onComplete={handleTimerComplete}
                className="h-full"
              />
              
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Update Progress</h2>
                    {hasUnsavedChanges && (
                      <Button
                        onClick={() => saveProgress()}
                        size="sm"
                        className="flex items-center"
                      >
                        <Save size={16} className="mr-1" />
                        Save
                      </Button>
                    )}
                  </div>
                  
                  <Input
                    type="number"
                    label="Current Page"
                    value={currentPage}
                    onChange={handlePageUpdate}
                    min={0}
                    max={book.totalPages}
                  />
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-white">Quick Notes</h3>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add your thoughts, quotes, or mark a spicy scene..."
                      className="w-full h-32 p-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-800 text-white"
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleAddSpicyScene}
                    >
                      Mark Spicy Scene
                    </Button>
                    <Button onClick={() => saveProgress()}>
                      Save Progress
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Voice Settings (Conditional) */}
            {showSettings && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-white">Voice Settings</h2>
                </CardHeader>
                <CardBody>
                  <VoicePraiseSettings />
                </CardBody>
              </Card>
            )}

            {/* Book Details */}
            {book.description && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-white">Book Description</h2>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-300">{book.description}</p>
                  
                  {book.tropes && book.tropes.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-white mb-2">Tropes</h3>
                      <div className="flex flex-wrap gap-2">
                        {book.tropes.map((trope, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700"
                          >
                            {trope}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReadingPage;