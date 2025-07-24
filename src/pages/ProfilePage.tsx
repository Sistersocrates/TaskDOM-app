import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import SpiceRating from '../components/SpiceRating';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { mockUser, mockBooks, popularTropes } from '../utils/mockData';
import { 
  BookOpen, 
  Users, 
  Heart, 
  Settings, 
  Edit, 
  Share2, 
  Save, 
  X, 
  Camera, 
  Mail, 
  Lock, 
  Bell, 
  Shield,
  User,
  Eye,
  EyeOff,
  Check,
  AlertCircle
} from 'lucide-react';
import { googleBooksService } from '../services/googleBooksService';
import { openLibraryService } from '../services/openLibraryService';
import { Book } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileFormData {
  displayName: string;
  username: string;
  email: string;
  bio: string;
  pronouns: string;
  spiceTolerance: number;
  favoriteGenres: string[];
  favoriteBooks: string[];
  isPrivateProfile: boolean;
  allowDirectMessages: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  readingGoal: number;
}

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account' | 'privacy'>('profile');
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>(mockBooks.slice(0, 4));
  const [isLoadingCovers, setIsLoadingCovers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: mockUser.displayName,
    username: mockUser.username,
    email: mockUser.email || 'user@example.com',
    bio: mockUser.bio || '',
    pronouns: mockUser.pronouns,
    spiceTolerance: 4,
    favoriteGenres: ['Romance', 'Fantasy', 'Contemporary'],
    favoriteBooks: [],
    isPrivateProfile: false,
    allowDirectMessages: true,
    emailNotifications: true,
    pushNotifications: false,
    readingGoal: 50
  });

  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});

  // Fetch enhanced book covers on component mount
  useEffect(() => {
    const enhanceBookCovers = async () => {
      setIsLoadingCovers(true);
      
      const enhancedBooks = await Promise.all(
        favoriteBooks.map(async (book) => {
          try {
            let enhancedCover = null;
            
            if (book.isbn) {
              const googleBook = await googleBooksService.getBookByISBN(book.isbn);
              if (googleBook?.imageLinks) {
                enhancedCover = googleBook.imageLinks.large || 
                               googleBook.imageLinks.medium || 
                               googleBook.imageLinks.small || 
                               googleBook.imageLinks.thumbnail;
              }
            }
            
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
            
            if (!enhancedCover) {
              enhancedCover = await openLibraryService.getBestCoverImage(
                book.isbn, 
                book.title, 
                book.author
              );
            }
            
            if (enhancedCover) {
              return { ...book, coverImage: enhancedCover };
            }
            
            return book;
          } catch (error) {
            console.error(`Error enhancing cover for ${book.title}:`, error);
            return book;
          }
        })
      );
      
      setFavoriteBooks(enhancedBooks);
      setIsLoadingCovers(false);
    };
    
    enhanceBookCovers();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    if (formData.readingGoal < 1 || formData.readingGoal > 1000) {
      newErrors.readingGoal = 'Reading goal must be between 1 and 1000 books';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveStatus('error');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would make actual API calls to save the data
      console.log('Saving profile data:', formData);
      
      setSaveStatus('success');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      displayName: mockUser.displayName,
      username: mockUser.username,
      email: mockUser.email || 'user@example.com',
      bio: mockUser.bio || '',
      pronouns: mockUser.pronouns,
      spiceTolerance: 4,
      favoriteGenres: ['Romance', 'Fantasy', 'Contemporary'],
      favoriteBooks: [],
      isPrivateProfile: false,
      allowDirectMessages: true,
      emailNotifications: true,
      pushNotifications: false,
      readingGoal: 50
    });
    setErrors({});
    setIsEditing(false);
    setSaveStatus('idle');
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
        </CardHeader>
        <CardBody>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={mockUser.profilePicture}
                alt={formData.displayName}
                className="w-24 h-24 rounded-full object-cover border-4 border-red-900/30"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 rounded-full p-2 transition-colors">
                  <Camera size={16} className="text-white" />
                </button>
              )}
            </div>
            {isEditing && (
              <div>
                <Button variant="outline" className="mb-2">
                  Upload New Picture
                </Button>
                <p className="text-sm text-gray-400">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Basic Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name *
              </label>
              {isEditing ? (
                <div>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Enter your display name"
                    className={errors.displayName ? 'border-red-500' : ''}
                  />
                  {errors.displayName && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.displayName}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-white">{formData.displayName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username *
              </label>
              {isEditing ? (
                <div>
                  <Input
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter your username"
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-white">@{formData.username}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pronouns
            </label>
            {isEditing ? (
              <Input
                value={formData.pronouns}
                onChange={(e) => handleInputChange('pronouns', e.target.value)}
                placeholder="e.g., she/her, he/him, they/them"
              />
            ) : (
              <p className="text-white">{formData.pronouns}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            {isEditing ? (
              <div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself and your reading preferences..."
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                    errors.bio ? 'border-red-500' : 'border-gray-600'
                  }`}
                  rows={4}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.bio}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 ml-auto">
                    {formData.bio.length}/500
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-white">{formData.bio || 'No bio added yet.'}</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      {/* Reading Preferences */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Reading Preferences</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Spice Tolerance
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <SpiceRating 
                  value={formData.spiceTolerance} 
                  onChange={(value) => handleInputChange('spiceTolerance', value)}
                  size="lg"
                />
                <p className="text-sm text-gray-400">
                  This helps us recommend books that match your comfort level
                </p>
              </div>
            ) : (
              <SpiceRating value={formData.spiceTolerance} readonly size="lg" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Annual Reading Goal
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-3">
                <Input
                  type="number"
                  value={formData.readingGoal}
                  onChange={(e) => handleInputChange('readingGoal', parseInt(e.target.value) || 0)}
                  min="1"
                  max="1000"
                  className={`w-32 ${errors.readingGoal ? 'border-red-500' : ''}`}
                />
                <span className="text-gray-300">books per year</span>
              </div>
            ) : (
              <p className="text-white">{formData.readingGoal} books per year</p>
            )}
            {errors.readingGoal && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.readingGoal}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Favorite Genres
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Romance', 'Fantasy', 'Contemporary', 'Historical', 'Paranormal', 'Sci-Fi', 'Mystery', 'Thriller', 'Young Adult', 'New Adult', 'LGBTQ+', 'Dark Romance'].map((genre) => (
                  <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.favoriteGenres.includes(genre)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('favoriteGenres', [...formData.favoriteGenres, genre]);
                        } else {
                          handleInputChange('favoriteGenres', formData.favoriteGenres.filter(g => g !== genre));
                        }
                      }}
                      className="rounded border-gray-600 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-300">{genre}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.favoriteGenres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-red-900/20 text-red-300 rounded-full text-sm border border-red-900/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Favorite Tropes */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Favorite Tropes</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {popularTropes.slice(0, 12).map((trope) => (
              <span
                key={trope}
                className="px-3 py-1 bg-red-900/20 text-red-300 rounded-full text-sm border border-red-900/30 cursor-pointer hover:bg-red-900/30 transition-colors"
              >
                {trope}
              </span>
            ))}
          </div>
          {isEditing && (
            <Button variant="outline" className="mt-4">
              Customize Tropes
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Account Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            {isEditing ? (
              <div>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-white">{formData.email}</p>
            )}
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Change Password
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="New password"
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive updates about your reading progress and book recommendations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
                disabled={!isEditing}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-sm text-gray-400">Get notified about reading streaks and achievements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pushNotifications}
                onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
                disabled={!isEditing}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Privacy Settings</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Private Profile</p>
              <p className="text-sm text-gray-400">Only approved followers can see your reading activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPrivateProfile}
                onChange={(e) => handleInputChange('isPrivateProfile', e.target.checked)}
                className="sr-only peer"
                disabled={!isEditing}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Allow Direct Messages</p>
              <p className="text-sm text-gray-400">Let other users send you private messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowDirectMessages}
                onChange={(e) => handleInputChange('allowDirectMessages', e.target.checked)}
                className="sr-only peer"
                disabled={!isEditing}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </CardBody>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Data Management</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Button variant="outline" className="w-full mb-2">
              Download My Data
            </Button>
            <p className="text-sm text-gray-400">
              Download a copy of all your reading data and account information
            </p>
          </div>
          
          <div>
            <Button variant="destructive" className="w-full mb-2">
              Delete Account
            </Button>
            <p className="text-sm text-gray-400">
              Permanently delete your account and all associated data
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={mockUser.profilePicture}
              alt={formData.displayName}
              className="w-24 h-24 rounded-full object-cover border-4 border-red-900/30"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{formData.displayName}</h1>
              <p className="text-gray-400">@{formData.username}</p>
              <p className="text-sm text-gray-500">{formData.pronouns}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Save Status */}
            <AnimatePresence>
              {saveStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center text-green-400"
                >
                  <Check size={18} className="mr-1" />
                  <span className="text-sm">Saved!</span>
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center text-red-400"
                >
                  <AlertCircle size={18} className="mr-1" />
                  <span className="text-sm">Error saving</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            {isEditing ? (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="flex items-center"
              >
                <Edit size={18} className="mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="flex items-center space-x-4">
              <BookOpen className="h-10 w-10 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Books Read</p>
                <p className="text-2xl font-bold text-white">42</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-4">
              <Users className="h-10 w-10 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Following</p>
                <p className="text-2xl font-bold text-white">128</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-4">
              <Heart className="h-10 w-10 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Spice Tolerance</p>
                <SpiceRating value={formData.spiceTolerance} readonly size="sm" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'preferences', label: 'Preferences', icon: Heart },
              { id: 'account', label: 'Account', icon: Settings },
              { id: 'privacy', label: 'Privacy', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'account' && renderAccountTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
        </div>

        {/* Favorite Books Section */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-bold text-white">Favorite Books</h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="flex items-center">
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <Share2 size={16} className="mr-1" />
                  Share
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {isLoadingCovers ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-800 aspect-[9/16] w-full rounded-lg mb-2"></div>
                      <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {favoriteBooks.map((book) => (
                    <motion.div 
                      key={book.id} 
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="aspect-[9/16] w-full mb-2 overflow-hidden rounded-lg shadow-md">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg';
                          }}
                          loading="lazy"
                        />
                      </div>
                      <p className="font-medium text-sm truncate text-white">{book.title}</p>
                      <SpiceRating value={book.spiceRating} size="sm" readonly />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ProfilePage;

