import { useState, useEffect, useCallback } from 'react';
import { readingProgressService, ReadingProgress, ReadingSession } from '../services/readingProgressService';

interface UseReadingProgressReturn {
  progress: ReadingProgress | null;
  isLoading: boolean;
  error: string | null;
  currentSession: ReadingSession | null;
  updateProgress: (currentPage: number, totalPages?: number, chapterId?: string, chapterName?: string) => Promise<void>;
  startSession: () => Promise<void>;
  endSession: (pagesRead: number, minutesRead: number) => Promise<void>;
  addBookmark: (pageNumber: number, note?: string, type?: 'bookmark' | 'highlight' | 'note' | 'spicy_scene') => Promise<void>;
  syncProgress: () => Promise<void>;
}

export const useReadingProgress = (bookId: string): UseReadingProgressReturn => {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [currentSession, setCurrentSession] = useState<ReadingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial progress
  const loadProgress = useCallback(async () => {
    if (!bookId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const progressData = await readingProgressService.getReadingProgress(bookId);
      setProgress(progressData);
    } catch (err) {
      setError('Failed to load reading progress');
      console.error('Error loading progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  // Update reading progress
  const updateProgress = useCallback(async (
    currentPage: number,
    totalPages?: number,
    chapterId?: string,
    chapterName?: string
  ) => {
    if (!bookId) return;

    try {
      setError(null);
      
      // Store offline first for immediate feedback
      if (totalPages) {
        readingProgressService.storeOfflineProgress(bookId, currentPage, totalPages, chapterId, chapterName);
      }

      const updatedProgress = await readingProgressService.updateReadingProgress(
        bookId,
        currentPage,
        totalPages,
        chapterId,
        chapterName
      );

      if (updatedProgress) {
        setProgress(updatedProgress);
      }
    } catch (err) {
      setError('Failed to update reading progress');
      console.error('Error updating progress:', err);
      
      // Store offline if online update fails
      if (totalPages) {
        readingProgressService.storeOfflineProgress(bookId, currentPage, totalPages, chapterId, chapterName);
      }
    }
  }, [bookId]);

  // Start reading session
  const startSession = useCallback(async () => {
    if (!bookId) return;

    try {
      setError(null);
      const session = await readingProgressService.startReadingSession(bookId);
      setCurrentSession(session);
    } catch (err) {
      setError('Failed to start reading session');
      console.error('Error starting session:', err);
    }
  }, [bookId]);

  // End reading session
  const endSession = useCallback(async (pagesRead: number, minutesRead: number) => {
    if (!currentSession) return;

    try {
      setError(null);
      const updatedSession = await readingProgressService.endReadingSession(
        currentSession.id,
        pagesRead,
        minutesRead
      );
      
      if (updatedSession) {
        setCurrentSession(updatedSession);
      }
    } catch (err) {
      setError('Failed to end reading session');
      console.error('Error ending session:', err);
    }
  }, [currentSession]);

  // Add bookmark
  const addBookmark = useCallback(async (
    pageNumber: number,
    note?: string,
    type: 'bookmark' | 'highlight' | 'note' | 'spicy_scene' = 'bookmark'
  ) => {
    if (!bookId) return;

    try {
      setError(null);
      await readingProgressService.addBookmark(bookId, pageNumber, note, type);
    } catch (err) {
      setError('Failed to add bookmark');
      console.error('Error adding bookmark:', err);
    }
  }, [bookId]);

  // Sync offline progress
  const syncProgress = useCallback(async () => {
    try {
      setError(null);
      await readingProgressService.syncOfflineProgress();
      await loadProgress(); // Reload after sync
    } catch (err) {
      setError('Failed to sync progress');
      console.error('Error syncing progress:', err);
    }
  }, [loadProgress]);

  // Load progress on mount and when bookId changes
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Set up real-time subscription
  useEffect(() => {
    if (!bookId) return;

    const subscription = readingProgressService.subscribeToProgressUpdates(
      bookId,
      (updatedProgress) => {
        setProgress(updatedProgress);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [bookId]);

  // Sync offline progress on app start
  useEffect(() => {
    const handleOnline = () => {
      syncProgress();
    };

    window.addEventListener('online', handleOnline);
    
    // Initial sync if online
    if (navigator.onLine) {
      syncProgress();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncProgress]);

  return {
    progress,
    isLoading,
    error,
    currentSession,
    updateProgress,
    startSession,
    endSession,
    addBookmark,
    syncProgress
  };
};