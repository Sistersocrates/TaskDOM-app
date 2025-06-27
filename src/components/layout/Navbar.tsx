import React, { useState } from 'react';
import { Book, Home, User, BarChart, BookOpen, Menu, X, Flame, Trophy, Volume2, Target, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Link, useLocation } from 'react-router-dom';
import UserMenu from '../auth/UserMenu';
import { useUserStore } from '../../store/userStore';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
}

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, hasPermission } = useUserStore();
  
  const navItems: NavItem[] = [
    { name: 'Home', icon: <Home size={20} />, path: '/' },
    { name: 'Library', icon: <Book size={20} />, path: '/library', permission: 'read:all' },
    { name: 'Productivity', icon: <Target size={20} />, path: '/productivity', permission: 'read:all' },
    { name: 'Streaks', icon: <Flame size={20} />, path: '/streaks', permission: 'read:all' },
    { name: 'Analytics', icon: <BarChart size={20} />, path: '/analytics', permission: 'read:all' },
    { name: 'Voice', icon: <Volume2 size={20} />, path: '/praise-customizer', permission: 'use:voice' },
  ];
  
  // Filter nav items based on permissions
  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );
  
  return (
    <header className="bg-card border-b border-border shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-accent to-accent-hover rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-accent-text" />
              </div>
              <span className="ml-2 text-xl font-bold font-cinzel text-accent-text">TaskDOM</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-4 items-center">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200',
                    location.pathname === item.path
                      ? 'text-accent-text bg-accent/20 border border-accent/30'
                      : 'text-secondary-text hover:text-primary-text hover:bg-border'
                  )}
                >
                  {item.icon}
                  <span className="ml-1">{item.name}</span>
                </Link>
              ))}
              <Link
                to="/privacy-policy"
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200',
                  location.pathname === '/privacy-policy'
                    ? 'text-accent-text bg-accent/20 border border-accent/30'
                    : 'text-secondary-text hover:text-primary-text hover:bg-border'
                )}
              >
                <Shield size={20} />
                <span className="ml-1">Privacy</span>
              </Link>
            </nav>
          )}
          
          {/* User profile */}
          <div className="flex items-center">
            <UserMenu />
            
            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button
                type="button"
                className="text-secondary-text hover:text-primary-text transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border shadow-lg">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium flex items-center transition-all duration-200',
                  location.pathname === item.path
                    ? 'bg-accent/20 text-accent-text border border-accent/30'
                    : 'text-secondary-text hover:bg-border hover:text-primary-text'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            ))}
            <Link
              to="/privacy-policy"
              className={cn(
                'block px-3 py-2 rounded-md text-base font-medium flex items-center transition-all duration-200',
                location.pathname === '/privacy-policy'
                  ? 'bg-accent/20 text-accent-text border border-accent/30'
                  : 'text-secondary-text hover:bg-border hover:text-primary-text'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield size={20} />
              <span className="ml-2">Privacy Policy</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;