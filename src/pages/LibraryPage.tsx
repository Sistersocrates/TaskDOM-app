import React, { useState } from 'react';
import { BookOpen, Users, Calendar, TrendingUp, Search, Plus, Filter, Share2 } from 'lucide-react';
import { BookClub } from '../types/bookclub';
import { Book } from '../types';
import BookClubList from '../components/bookclub/BookClubList';
import BookClubDetail from '../components/bookclub/BookClubDetail';
import BookCard from '../components/BookCard';
import BookSearchModal from '../components/BookSearchModal';
import QuickShareButtons from '../components/QuickShareButtons';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { useSocialShare } from '../hooks/useSocialShare';
import { mockBooks } from '../utils/mockData';
import MainLayout from '../components/layout/MainLayout';

type LibraryTab = 'books' | 'clubs' | 'reading-stats' | 'challenges';
type BookStatus = 'all' | 'currentlyReading' | 'wantToRead' | 'finished' | 'dnf';
type SortOption = 'title' | 'author' | 'spiceRating' | 'progress' | 'dateAdded';

const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('books');
  const [selectedClub, setSelectedClub] = useState<BookClub | null>(null);
  
  // Personal Library State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const { shareReadingList, shareTBR } = useSocialShare();

  const tabs = [
    { id: 'books' as LibraryTab, label: 'My Books', icon: BookOpen },
    { id: 'clubs' as LibraryTab, label: 'Book Clubs', icon: Users },
    { id: 'reading-stats' as LibraryTab, label: 'Reading Stats', icon: TrendingUp },
    { id: 'challenges' as LibraryTab, label: 'Challenges', icon: Calendar }
  ];

  const handleSelectClub = (club: BookClub) => {
    setSelectedClub(club);
  };

  const handleBackToClubs = () => {
    setSelectedClub(null);
  };

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

  const renderPersonalLibrary = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Personal Library</h2>
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
          { key: 'currentlyReading', label: 'Reading', count: statusCounts.currentlyReading, color: 'bg-accent/30 text-accent-text' },
          { key: 'wantToRead', label: 'Want to Read', count: statusCounts.wantToRead, color: 'bg-purple-900/30 text-purple-300' },
          { key: 'finished', label: 'Finished', count: statusCounts.finished, color: 'bg-green-900/30 text-green-300' },
          { key: 'dnf', label: 'DNF', count: statusCounts.dnf, color: 'bg-gray-800 text-gray-400' }
        ].map(({ key, label, count, color }) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(key as BookStatus)}
            className={`p-4 rounded-lg text-center transition-all hover:shadow-md relative group ${
              selectedStatus === key ? 'ring-2 ring-accent' : ''
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
                  className="text-xs hover:text-accent-text"
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
            className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white"
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
            className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white"
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
      
      {/* Book Grid */}
      {sortedBooks.length > 0 ? (
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
      ) : (
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
  );

  const renderReadingStats = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Reading Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Reading Stats Cards */}
        <Card className="bg-card border-border">
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-accent-text mb-2">{books.length}</div>
            <div className="text-sm text-gray-400">Total Books</div>
          </CardBody>
        </Card>
        
        <Card className="bg-card border-border">
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {books.filter(b => b.status === 'finished').length}
            </div>
            <div className="text-sm text-gray-400">Books Finished</div>
          </CardBody>
        </Card>
        
        <Card className="bg-card border-border">
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {books.filter(b => b.status === 'currentlyReading').length}
            </div>
            <div className="text-sm text-gray-400">Currently Reading</div>
          </CardBody>
        </Card>
        
        <Card className="bg-card border-border">
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-accent-text mb-2">
              {Math.round(books.reduce((acc, book) => acc + (book.currentPage / book.totalPages * 100), 0) / books.length) || 0}%
            </div>
            <div className="text-sm text-gray-400">Avg Progress</div>
          </CardBody>
        </Card>
      </div>

      {/* Reading Progress Chart Placeholder */}
      <Card className="bg-card border-border">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Reading Progress Over Time</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
              <p>Reading progress chart will be displayed here</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Reading Challenges</h2>
      
      <Card className="bg-card border-border">
        <CardBody className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Reading Challenges</h3>
          <p className="text-gray-400 mb-6">
            Set reading goals and track your progress throughout the year.
          </p>
          <Button className="mx-auto">
            <Plus size={20} className="mr-2" />
            Create Challenge
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    if (selectedClub) {
      return (
        <BookClubDetail 
          club={selectedClub} 
          onBack={handleBackToClubs}
        />
      );
    }

    switch (activeTab) {
      case 'books':
        return renderPersonalLibrary();

      case 'clubs':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Book Clubs</h2>
            <BookClubList onSelectClub={handleSelectClub} />
          </div>
        );

      case 'reading-stats':
        return renderReadingStats();

      case 'challenges':
        return renderChallenges();

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Library</h1>
        <p className="text-gray-400">
          Manage your books, join book clubs, track your reading journey, and connect with fellow readers.
        </p>
      </div>

      {/* Only show tabs if not viewing a specific club */}
      {!selectedClub && (
        <div className="border-b border-border mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-accent text-accent-text'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </MainLayout>
  );
};

export default LibraryPage;

