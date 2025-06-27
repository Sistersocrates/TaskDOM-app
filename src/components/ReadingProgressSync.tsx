import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { cn } from '../utils/cn';

interface ReadingProgressSyncProps {
  bookId: string;
  className?: string;
}

const ReadingProgressSync: React.FC<ReadingProgressSyncProps> = ({ bookId, className }) => {
  const { progress, isLoading, error, syncProgress } = useReadingProgress(bookId);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncProgress();
      setLastSyncTime(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (error) {
      return <AlertCircle className="h-4 w-4 text-error-500" />;
    }
    
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-warning-500" />;
    }
    
    if (isLoading || isSyncing) {
      return <RefreshCw className="h-4 w-4 text-primary-500 animate-spin" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-success-500" />;
  };

  const getStatusText = () => {
    if (error) {
      return 'Sync error';
    }
    
    if (!isOnline) {
      return 'Offline mode';
    }
    
    if (isLoading || isSyncing) {
      return 'Syncing...';
    }
    
    if (lastSyncTime) {
      return `Synced ${lastSyncTime.toLocaleTimeString()}`;
    }
    
    return 'Synced';
  };

  const getDeviceInfo = () => {
    if (!progress?.device_info) return null;
    
    const { device_type, browser, os } = progress.device_info;
    return `${device_type} • ${browser} • ${os}`;
  };

  return (
    <div className={cn('flex items-center justify-between p-3 bg-neutral-50 rounded-lg', className)}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{getStatusText()}</span>
            {!isOnline && (
              <span className="text-xs bg-warning-100 text-warning-800 px-2 py-0.5 rounded-full">
                Changes saved locally
              </span>
            )}
          </div>
          {progress && (
            <div className="text-xs text-neutral-500">
              Page {progress.current_page} of {progress.total_pages} • {progress.percentage_read}% complete
            </div>
          )}
          {getDeviceInfo() && (
            <div className="text-xs text-neutral-400">
              Last read on: {getDeviceInfo()}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {isOnline && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center"
          >
            <RefreshCw className={cn('h-3 w-3 mr-1', isSyncing && 'animate-spin')} />
            Sync
          </Button>
        )}
        
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-success-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-warning-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingProgressSync;