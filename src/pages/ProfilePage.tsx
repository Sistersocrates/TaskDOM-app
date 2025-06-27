import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import SpiceRating from '../components/SpiceRating';
import Button from '../components/ui/Button';
import { mockUser, mockBooks, popularTropes } from '../utils/mockData';
import { BookOpen, Users, Heart, Settings, Loader2, Edit, Share2 } from 'lucide-react';
import { googleBooksService } from '../services/googleBooksService';
import { openLibraryService } from '../services/openLibraryService';
import { Book } from '../types';
import { motion } from 'framer-motion';

const ProfilePage: React.FC = () => {
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>(mockBooks.slice(0, 4));
  const [isLoadingCovers, setIsLoadingCovers] = useState(false);

  // Fetch enhanced book covers on component mount
  useEffect(() => {
    const enhanceBookCovers = async () => {
      setIsLoadingCovers(true);
      
      const enhancedBooks = await Promise.all(
        favoriteBooks.map(async (book) => {
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
      
      setFavoriteBooks(enhancedBooks);
      setIsLoadingCovers(false);
    };
    
    enhanceBookCovers();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={mockUser.profilePicture}
              alt={mockUser.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-red-900/30"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{mockUser.displayName}</h1>
              <p className="text-gray-400">@{mockUser.username}</p>
              <p className="text-sm text-gray-500">{mockUser.pronouns}</p>
            </div>
          </div>
          <Button variant="outline" className="flex items-center">
            <Settings size={18} className="mr-2" />
            Edit Profile
          </Button>
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
                <SpiceRating value={4} readonly size="sm" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Favorite Books */}
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
              // Loading skeleton
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
                          // Fallback image if loading fails
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

        {/* Favorite Tropes */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-white">Favorite Tropes</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {popularTropes.slice(0, 12).map((trope) => (
                <span
                  key={trope}
                  className="px-3 py-1 bg-red-900/20 text-red-300 rounded-full text-sm border border-red-900/30"
                >
                  {trope}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Reading Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-white">Reading Activity</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 border-b border-gray-800 pb-4">
                  <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center border border-red-900/30">
                    <BookOpen className="text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Finished reading Chapter 12</p>
                    <p className="text-sm text-gray-400">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;