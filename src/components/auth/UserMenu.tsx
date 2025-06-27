import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, BookOpen, Bell } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import Button from '../ui/Button';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useUserStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse"></div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
        <Button 
          size="sm"
          onClick={() => navigate('/login')}
        >
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <img
          src={user.profilePicture}
          alt={user.displayName}
          className="h-8 w-8 rounded-full object-cover border-2 border-accent/50"
        />
        <span className="hidden md:block text-sm font-medium text-primary-text">
          {user.displayName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <img
                src={user.profilePicture}
                alt={user.displayName}
                className="h-10 w-10 rounded-full object-cover border border-border"
              />
              <div>
                <p className="font-medium text-primary-text">{user.displayName}</p>
                <p className="text-xs text-secondary-text">@{user.username}</p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-primary-text hover:bg-border transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-3 h-4 w-4 text-secondary-text" />
              Profile
            </Link>
            <Link
              to="/library"
              className="flex items-center px-4 py-2 text-sm text-primary-text hover:bg-border transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen className="mr-3 h-4 w-4 text-secondary-text" />
              My Library
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-primary-text hover:bg-border transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-3 h-4 w-4 text-secondary-text" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2 text-sm text-primary-text hover:bg-border transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4 text-secondary-text" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;