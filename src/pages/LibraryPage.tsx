import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Book } from '../types';
import { mockBooks } from '../utils/mockData';
import { Search, Plus, Filter, BookOpen, Share2, Loader2 } from 'lucide-react';
import BookCard from '../components/BookCard';
import BookSearchModal from '../components/BookSearchModal';
import QuickShareButtons from '../components/QuickShareButtons';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useSocialShare } from '../hooks/useSocialShare';
import { useBookCovers } from '../hooks/useBookCovers';

type BookStatus = 'all' | 'currentlyReading' | 'wantToRead' | 'finished' | 'dnf';
type SortOption = 'title' | 'author' | 'spiceRating' | 'progress' | 'dateAdded';

const LibraryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [localBooks, setLocalBooks] = useState<Book[]>(mockBooks);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const { books, isLoading } = useBookCovers(localBooks);
  const { shareReadingList, shareTBR } = useSocialShare();
  
  // Filter books based on search query and status
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (book.isbn && book.isbn.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });
  
  // Sort books based on selected option
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'spiceRating':
        return b.spiceRating - a.spiceRating;
      case 'progress':
        return (b.currentPage / b.totalPages) - (a.currentPage / a.totalPages);
      case 'dateAdded':
        // For now, sort by ID as a proxy for date added
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  const handleAddBook = (newBook: any) => {
    // Add the new book to the library
    const bookWithDefaults = {
      ...newBook,
      id: `google-${newBook.id}`, // Prefix to avoid conflicts
      currentPage: 0,
      spiceRating: 0,
      status: 'wantToRead' as const,
      spicyScenes: [],
      tropes: newBook.tropes || []
    };
    
    setBooks(prevBooks => [bookWithDefaults, ...prevBooks]);
  };

  const getStatusCounts = () => {
    return {
      all: books.length,
      currentlyReading: books.filter(b => b.status === 'currentlyReading').length,
      wantToRead: books.filter(b => b.status === 'wantToRead').length,
      finished: books.filter(b => b.status === 'finished').length,
      dnf: books.filter(b => b.status === 'dnf').length
    };
  };

  const statusCounts = getStatusCounts();

  const handleShareLibrary = () => {
    shareReadingList(books);
  };

  const handleShareTBR = () => {
    const tbrBooks = books.filter(book => book.status === 'wantToRead');
    shareTBR(tbrBooks);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Library</h1>
            <p className="text-gray-400">
              {books.length} book{books.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <QuickShareButtons
              type="achievement"
              data={{ achievement: 'library_milestone', totalBooks: books.length }}
              variant="minimal"
            />
            <Button
              onClick={handleShareLibrary}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Share2 size={16} className="mr-1" />
              Share Library
            </Button>
            <Button 
              className="flex items-center"
              onClick={() => setIsSearchModalOpen(true)}
            >
              <Plus size={20} className="mr-2" />
              Add Book
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { key: 'all', label: 'Total Books', count: statusCounts.all, color: 'bg-gray-800 text-gray-300' },
            { key: 'currentlyReading', label: 'Reading', count: statusCounts.currentlyReading, color: 'bg-primary-900/30 text-primary-300' },
            { key: 'wantToRead', label: 'Want to Read', count: statusCounts.wantToRead, color: 'bg-secondary-900/30 text-secondary-300' },
            { key: 'finished', label: 'Finished', count: statusCounts.finished, color: 'bg-success-900/30 text-success-300' },
            { key: 'dnf', label: 'DNF', count: statusCounts.dnf, color: 'bg-gray-800 text-gray-400' }
          ].map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setSelectedStatus(key as BookStatus)}
              className={`p-4 rounded-lg text-center transition-all hover:shadow-md relative group ${
                selectedStatus === key ? 'ring-2 ring-primary-500' : ''
              } ${color}`}
            >
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm">{label}</div>
              {key === 'wantToRead' && count > 0 && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareTBR();
                    }}
                    className="text-xs hover:text-primary-400"
                  >
                    <Share2 size={12} />
                  </button>
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              fullWidth
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as BookStatus)}
            >
              <option value="all">All Books ({statusCounts.all})</option>
              <option value="currentlyReading">Currently Reading ({statusCounts.currentlyReading})</option>
              <option value="wantToRead">Want to Read ({statusCounts.wantToRead})</option>
              <option value="finished">Finished ({statusCounts.finished})</option>
              <option value="dnf">DNF ({statusCounts.dnf})</option>
            </select>
            
            <select
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="title">Sort by Title</option>
              <option value="author">Sort by Author</option>
              <option value="spiceRating">Sort by Spice Rating</option>
              <option value="progress">Sort by Progress</option>
              <option value="dateAdded">Sort by Date Added</option>
            </select>
          </div>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
              <p className="text-lg text-gray-400">Fetching book covers...</p>
              <p className="text-sm text-gray-500 mt-2">
                Checking Google Books and Open Library for high-quality covers
              </p>
            </div>
          </div>
        )}
        
        {/* Book Grid */}
        {!isLoading && sortedBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {sortedBooks.map((book) => (
              <div key={book.id} className="relative group">
                <BookCard
                  book={book}
                  onClick={() => console.log('Open book details:', book.id)}
                  size="md"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <QuickShareButtons
                    type="progress"
                    data={{ book }}
                    variant="minimal"
                    className="bg-black/50 p-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : !isLoading && (
          /* Empty State */
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchQuery || selectedStatus !== 'all'
                ? "No books found"
                : "Your library is empty"}
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              {searchQuery || selectedStatus !== 'all'
                ? "Try adjusting your search or filters."
                : "Start building your collection by adding some books!"}
            </p>
            {(!searchQuery && selectedStatus === 'all') && (
              <Button 
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center mx-auto"
              >
                <Plus size={20} className="mr-2" />
                Add Your First Book
              </Button>
            )}
          </div>
        )}

        {/* Book Search Modal */}
        <BookSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onAddBook={handleAddBook}
        />
      </div>
    </MainLayout>
  );
};

export default LibraryPage;