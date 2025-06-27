import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl === 'https://your-project-ref.supabase.co') {
  throw new Error('Missing or invalid VITE_SUPABASE_URL environment variable. Please set it to your actual Supabase project URL in the .env file.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('Missing or invalid VITE_SUPABASE_ANON_KEY environment variable. Please set it to your actual Supabase anon key in the .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". Please ensure it's a valid URL starting with https://`);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  current_page: number;
  total_pages: number;
  percentage_read: number;
  chapter_id?: string;
  chapter_name?: string;
  reading_session_id?: string;
  device_info: Record<string, any>;
  last_read_at: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  start_time: string;
  end_time?: string;
  pages_read: number;
  minutes_read: number;
  device_info: Record<string, any>;
  created_at: string;
}

interface ReadingBookmark {
  id: string;
  user_id: string;
  book_id: string;
  page_number: number;
  note?: string;
  bookmark_type: 'bookmark' | 'highlight' | 'note' | 'spicy_scene';
  created_at: string;
}

interface DeviceInfo {
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screen_size: string;
  user_agent: string;
}

class ReadingProgressService {
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*\bMobile\b)/i.test(userAgent);
    
    return {
      device_type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      browser: this.getBrowserName(),
      os: this.getOSName(),
      screen_size: `${window.screen.width}x${window.screen.height}`,
      user_agent: userAgent
    };
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOSName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  async getReadingProgress(bookId: string): Promise<ReadingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('book_id', bookId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching reading progress:', error);
      return null;
    }
  }

  async updateReadingProgress(
    bookId: string,
    currentPage: number,
    totalPages?: number,
    chapterId?: string,
    chapterName?: string
  ): Promise<ReadingProgress | null> {
    try {
      const deviceInfo = this.getDeviceInfo();

      const { data, error } = await supabase.rpc('upsert_reading_progress', {
        p_book_id: bookId,
        p_current_page: currentPage,
        p_total_pages: totalPages,
        p_chapter_id: chapterId,
        p_chapter_name: chapterName,
        p_device_info: deviceInfo
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      return null;
    }
  }

  async getAllReadingProgress(): Promise<ReadingProgress[]> {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .order('last_read_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all reading progress:', error);
      return [];
    }
  }

  async startReadingSession(bookId: string): Promise<ReadingSession | null> {
    try {
      const deviceInfo = this.getDeviceInfo();

      const { data, error } = await supabase
        .from('reading_sessions')
        .insert({
          book_id: bookId,
          device_info: deviceInfo
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error starting reading session:', error);
      return null;
    }
  }

  async endReadingSession(
    sessionId: string,
    pagesRead: number,
    minutesRead: number
  ): Promise<ReadingSession | null> {
    try {
      const { data, error } = await supabase
        .from('reading_sessions')
        .update({
          end_time: new Date().toISOString(),
          pages_read: pagesRead,
          minutes_read: minutesRead
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error ending reading session:', error);
      return null;
    }
  }

  async getReadingSessions(bookId?: string, limit = 10): Promise<ReadingSession[]> {
    try {
      let query = supabase
        .from('reading_sessions')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(limit);

      if (bookId) {
        query = query.eq('book_id', bookId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching reading sessions:', error);
      return [];
    }
  }

  async addBookmark(
    bookId: string,
    pageNumber: number,
    note?: string,
    bookmarkType: ReadingBookmark['bookmark_type'] = 'bookmark'
  ): Promise<ReadingBookmark | null> {
    try {
      const { data, error } = await supabase
        .from('reading_bookmarks')
        .insert({
          book_id: bookId,
          page_number: pageNumber,
          note,
          bookmark_type: bookmarkType
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return null;
    }
  }

  async getBookmarks(bookId: string): Promise<ReadingBookmark[]> {
    try {
      const { data, error } = await supabase
        .from('reading_bookmarks')
        .select('*')
        .eq('book_id', bookId)
        .order('page_number', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  async deleteBookmark(bookmarkId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reading_bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      return false;
    }
  }

  // Real-time subscription for progress updates
  subscribeToProgressUpdates(
    bookId: string,
    callback: (progress: ReadingProgress) => void
  ) {
    return supabase
      .channel(`reading_progress:${bookId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reading_progress',
          filter: `book_id=eq.${bookId}`
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as ReadingProgress);
          }
        }
      )
      .subscribe();
  }

  // Sync progress from local storage (offline support)
  async syncOfflineProgress(): Promise<void> {
    try {
      const offlineProgress = localStorage.getItem('offline_reading_progress');
      if (!offlineProgress) return;

      const progressData = JSON.parse(offlineProgress);
      
      for (const [bookId, progress] of Object.entries(progressData)) {
        const progressInfo = progress as any;
        await this.updateReadingProgress(
          bookId,
          progressInfo.currentPage,
          progressInfo.totalPages,
          progressInfo.chapterId,
          progressInfo.chapterName
        );
      }

      // Clear offline data after successful sync
      localStorage.removeItem('offline_reading_progress');
    } catch (error) {
      console.error('Error syncing offline progress:', error);
    }
  }

  // Store progress locally for offline use
  storeOfflineProgress(
    bookId: string,
    currentPage: number,
    totalPages: number,
    chapterId?: string,
    chapterName?: string
  ): void {
    try {
      const offlineProgress = JSON.parse(
        localStorage.getItem('offline_reading_progress') || '{}'
      );

      offlineProgress[bookId] = {
        currentPage,
        totalPages,
        chapterId,
        chapterName,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('offline_reading_progress', JSON.stringify(offlineProgress));
    } catch (error) {
      console.error('Error storing offline progress:', error);
    }
  }
}

export const readingProgressService = new ReadingProgressService();