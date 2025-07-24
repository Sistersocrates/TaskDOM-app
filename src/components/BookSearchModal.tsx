import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Loader2, Book, Star, Calendar, Users, Image, AlertCircle } from 'lucide-react';
import { Card, CardBody } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { googleBooksService, GoogleBook } from '../services/googleBooksService';
import { openLibraryService } from '../services/openLibraryService';
import { cn } from '../utils/cn';

interface BookSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (book: any) => void;
}

const BookSearchModal: React.FC<BookSearchModalProps> = ({ isOpen, onClose, onAddBook }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [authorQuery, setAuthorQuery] = useState('');
  const [isbnQuery, setIsbnQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'author' | 'isbn'>('search');
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      // Load popular romance books when modal opens
      loadPopularBooks();
    }
  }, [isOpen]);

  const loadPopularBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const books = await googleBooksService.getPopularRomanceBooks(12);
      setSearchResults(books);
    } catch (err) {
      setError('Failed to load popular books');
      console.error('Error loading popular books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setImageLoadingStates({});
      setImageErrors({});
      const books = await googleBooksService.searchRomanceBooks(searchQuery.trim(), 20);
      setSearchResults(books);
    } catch (err) {
      setError('Failed to search books. Please try again.');
      console.error('Error searching books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorQuery.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setImageLoadingStates({});
      setImageErrors({});
      const books = await googleBooksService.searchByAuthor(authorQuery.trim(), 20);
      setSearchResults(books);
    } catch (err) {
      setError('Failed to search books by author. Please try again.');
      console.error('Error searching books by author:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleISBNSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isbnQuery.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setImageLoadingStates({});
      setImageErrors({});
      
      // Try Google Books first
      let book = await googleBooksService.getBookByISBN(isbnQuery.trim());
      
      // If not found in Google Books, try Open Library
      if (!book) {
        const openLibraryBooks = await openLibraryService.searchBooks('', '', 1);
        if (openLibraryBooks.length > 0) {
          const olBook = openLibraryBooks[0];
          const coverUrl = await openLibraryService.getBestCoverImage(isbnQuery.trim());
          
          // Convert Open Library book to Google Book format
          book = {
            id: olBook.key,
            title: olBook.title,
            authors: olBook.authors?.map(a => a.name) || ['Unknown Author'],
            pageCount: olBook.number_of_pages,
            publishedDate: olBook.first_publish_year?.toString(),
            imageLinks: coverUrl ? { thumbnail: coverUrl } : undefined,
            industryIdentifiers: [{ type: 'ISBN_13', identifier: isbnQuery.trim() }],
            categories: olBook.subjects?.slice(0, 5) || []
          };
        }
      }
      
      if (book) {
        setSearchResults([book]);
      } else {
        setError('No book found with that ISBN');
        setSearchResults([]);
      }
    } catch (err) {
      setError('Failed to find book by ISBN. Please check the ISBN and try again.');
      console.error('Error searching by ISBN:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = (googleBook: GoogleBook) => {
    const internalBook = googleBooksService.convertToInternalBook(googleBook);
    onAddBook(internalBook);
    onClose();
  };

  const handleImageLoad = (bookId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [bookId]: false }));
  };

  const handleImageError = async (bookId: string, book: GoogleBook) => {
    setImageErrors(prev => ({ ...prev, [bookId]: true }));
    setImageLoadingStates(prev => ({ ...prev, [bookId]: false }));
    
    // Try to find alternative cover from Open Library
    try {
      const isbn = book.industryIdentifiers?.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier;
      const author = book.authors?.join(', ');
      
      const fallbackCover = await openLibraryService.getBestCoverImage(isbn, book.title, author);
      
      if (fallbackCover) {
        // Update the book's image in search results
        setSearchResults(prev => prev.map(b => 
          b.id === bookId 
            ? { 
                ...b, 
                imageLinks: { 
                  ...b.imageLinks, 
                  thumbnail: fallbackCover,
                  small: fallbackCover,
                  medium: fallbackCover,
                  large: fallbackCover
                } 
              }
            : b
        ));
        setImageErrors(prev => ({ ...prev, [bookId]: false }));
      }
    } catch (error) {
      console.error('Failed to fetch fallback cover:', error);
    }
  };

  const formatAuthors = (authors?: string[]) => {
    if (!authors || authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return authors.join(' & ');
    return `${authors[0]} & ${authors.length - 1} others`;
  };

  const formatPublishedDate = (date?: string) => {
    if (!date) return '';
    try {
      return new Date(date).getFullYear().toString();
    } catch {
      return date;
    }
  };

  const getImageSrc = (book: GoogleBook) => {
    return book.imageLinks?.thumbnail || 
           book.imageLinks?.small || 
           book.imageLinks?.medium || 
           'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-red-900/30">
          <div>
            <h2 className="text-2xl font-bold text-white">Add New Book</h2>
            <p className="text-sm text-gray-400 mt-1">
              Search Google Books with Open Library fallback for covers
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-red-900/30">
          <button
            onClick={() => setActiveTab('search')}
            className={cn(
              'flex-1 px-6 py-3 text-center font-medium transition-colors',
              activeTab === 'search'
                ? 'border-b-2 border-primary-500 text-primary-400 bg-red-900/20'
                : 'text-gray-400 hover:text-primary-400 hover:bg-gray-800'
            )}
          >
            <Search className="h-5 w-5 mx-auto mb-1" />
            Search Books
          </button>
          <button
            onClick={() => setActiveTab('author')}
            className={cn(
              'flex-1 px-6 py-3 text-center font-medium transition-colors',
              activeTab === 'author'
                ? 'border-b-2 border-primary-500 text-primary-400 bg-red-900/20'
                : 'text-gray-400 hover:text-primary-400 hover:bg-gray-800'
            )}
          >
            <Users className="h-5 w-5 mx-auto mb-1" />
            Search by Author
          </button>
          <button
            onClick={() => setActiveTab('isbn')}
            className={cn(
              'flex-1 px-6 py-3 text-center font-medium transition-colors',
              activeTab === 'isbn'
                ? 'border-b-2 border-primary-500 text-primary-400 bg-red-900/20'
                : 'text-gray-400 hover:text-primary-400 hover:bg-gray-800'
            )}
          >
            <Book className="h-5 w-5 mx-auto mb-1" />
            Add by ISBN
          </button>
        </div>

        <CardBody className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <form onSubmit={handleSearch} className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="Search for books, authors, or titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow"
                  fullWidth
                />
                <Button type="submit" disabled={isLoading} className="flex items-center">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {!searchQuery && !isLoading && searchResults.length > 0 && (
                <div className="text-center text-gray-400">
                  <h3 className="text-lg font-medium mb-2">Popular Romance Books</h3>
                  <p className="text-sm">Or search above to find specific books</p>
                </div>
              )}
            </div>
          )}

          {/* Author Search Tab */}
          {activeTab === 'author' && (
            <div className="space-y-6">
              <form onSubmit={handleAuthorSearch} className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="Search by author name..."
                  value={authorQuery}
                  onChange={(e) => setAuthorQuery(e.target.value)}
                  className="flex-grow"
                  fullWidth
                />
                <Button type="submit" disabled={isLoading} className="flex items-center">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-white">Author Search</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Find all books by a specific author. Enter the author's name to see their complete bibliography.
                </p>
                <p className="text-sm text-gray-400">
                  <strong>Examples:</strong> "Sarah J. Maas", "Colleen Hoover", "Rebecca Yarros"
                </p>
              </div>
            </div>
          )}

          {/* ISBN Tab */}
          {activeTab === 'isbn' && (
            <div className="space-y-6">
              <form onSubmit={handleISBNSearch} className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="Enter ISBN (10 or 13 digits)..."
                  value={isbnQuery}
                  onChange={(e) => setIsbnQuery(e.target.value)}
                  className="flex-grow"
                  fullWidth
                />
                <Button type="submit" disabled={isLoading} className="flex items-center">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-white">Enhanced Cover Detection</h3>
                <p className="text-sm text-gray-400 mb-2">
                  We search both Google Books and Open Library to find the best available cover image for your book.
                </p>
                <p className="text-sm text-gray-400">
                  <strong>ISBN:</strong> A unique identifier usually found on the back cover or copyright page.
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-error-900/20 border border-error-500/30 text-error-300 p-4 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
                <p className="text-gray-400">Searching for books...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Checking Google Books and Open Library for covers
                </p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((book) => (
                <div
                  key={book.id}
                  className="border border-gray-700 rounded-lg p-4 hover:border-primary-500/50 transition-all bg-gray-800"
                >
                  <div className="flex space-x-4">
                    <div className="relative w-16 h-24 flex-shrink-0">
                      {imageLoadingStates[book.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                      
                      {imageErrors[book.id] ? (
                        <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      ) : (
                        <img
                          src={getImageSrc(book)}
                          alt={book.title}
                          className="w-full h-full object-cover rounded shadow-sm"
                          onLoad={() => handleImageLoad(book.id)}
                          onError={() => handleImageError(book.id, book)}
                          onLoadStart={() => setImageLoadingStates(prev => ({ ...prev, [book.id]: true }))}
                        />
                      )}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-1 text-white">
                        {book.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {formatAuthors(book.authors)}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                        {book.publishedDate && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatPublishedDate(book.publishedDate)}
                          </div>
                        )}
                        {book.pageCount && (
                          <div className="flex items-center">
                            <Book className="h-3 w-3 mr-1" />
                            {book.pageCount} pages
                          </div>
                        )}
                        {book.averageRating && (
                          <div className="flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            {book.averageRating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {book.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                          {book.description}
                        </p>
                      )}

                      <Button
                        onClick={() => handleAddBook(book)}
                        size="sm"
                        className="flex items-center"
                        fullWidth
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Library
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && searchResults.length === 0 && (searchQuery || authorQuery || isbnQuery) && !error && (
            <div className="text-center py-12 text-gray-500">
              <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No books found</p>
              <p className="text-sm">
                {activeTab === 'search' 
                  ? 'Try different search terms or check the spelling'
                  : activeTab === 'author'
                  ? 'Try a different author name or check the spelling'
                  : 'Please check the ISBN and try again'
                }
              </p>
              <p className="text-xs mt-2 text-gray-600">
                Searched Google Books and Open Library
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default BookSearchModal;