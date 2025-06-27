import React from 'react';
import { BookOpen, Clock, Bookmark } from 'lucide-react';
import ProgressBar from './ui/ProgressBar';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { cn } from '../utils/cn';

interface ReadingProgressIndicatorProps {
  bookId: string;
  className?: string;
  showDetails?: boolean;
}

const ReadingProgressIndicator: React.FC<ReadingProgressIndicatorProps> = ({
  bookId,
  className,
  showDetails = true
}) => {
  const { progress, isLoading } = useReadingProgress(bookId);

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-4 bg-neutral-200 rounded mb-2"></div>
        <div className="h-2 bg-neutral-200 rounded"></div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className={cn('text-center text-neutral-500', className)}>
        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No reading progress yet</p>
      </div>
    );
  }

  const formatLastRead = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Reading Progress</span>
          <span className="text-sm text-neutral-500">
            {progress.percentage_read}%
          </span>
        </div>
        <ProgressBar 
          value={progress.percentage_read} 
          height="md" 
          color="primary"
          animated={progress.percentage_read < 100}
        />
      </div>

      {showDetails && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Current Page */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-primary-500" />
            <div>
              <p className="font-medium">Page {progress.current_page}</p>
              <p className="text-neutral-500">of {progress.total_pages}</p>
            </div>
          </div>

          {/* Last Read */}
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-primary-500" />
            <div>
              <p className="font-medium">Last read</p>
              <p className="text-neutral-500">{formatLastRead(progress.last_read_at)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Info */}
      {progress.chapter_name && (
        <div className="flex items-center space-x-2 p-2 bg-primary-50 rounded-lg">
          <Bookmark className="h-4 w-4 text-primary-500" />
          <div>
            <p className="text-sm font-medium">Current Chapter</p>
            <p className="text-sm text-primary-700">{progress.chapter_name}</p>
          </div>
        </div>
      )}

      {/* Device Sync Info */}
      {progress.device_info && (
        <div className="text-xs text-neutral-400 border-t pt-2">
          <p>
            Synced from {progress.device_info.device_type} • {progress.device_info.browser}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReadingProgressIndicator;