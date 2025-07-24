import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Settings, Plus, Calendar, MessageCircle, BarChart3, BookOpen } from 'lucide-react';
import { BookClub, ClubMember, ClubBook } from '../../types/bookclub';
import { BookClubService } from '../../services/bookClubService';
import { useUserStore } from '../../store/userStore';
import Button from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import BookClubChat from './BookClubChat';
import BookClubDiscussion from './BookClubDiscussion';
import BookClubProgress from './BookClubProgress';
import BookClubMeetings from './BookClubMeetings';
import BookClubMembers from './BookClubMembers';
import AddBookModal from './AddBookModal';

interface BookClubDetailProps {
  club: BookClub;
  onBack: () => void;
}

type TabType = 'chat' | 'discussions' | 'progress' | 'meetings' | 'members';

const BookClubDetail: React.FC<BookClubDetailProps> = ({ club, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [books, setBooks] = useState<ClubBook[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUserStore();

  useEffect(() => {
    loadClubData();
  }, [club.id, user]);

  const loadClubData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [membersData, booksData, role] = await Promise.all([
        BookClubService.getClubMembers(club.id),
        BookClubService.getClubBooks(club.id),
        BookClubService.getUserRole(club.id, user.id)
      ]);

      setMembers(membersData);
      setBooks(booksData);
      setUserRole(role);
    } catch (error) {
      console.error('Error loading club data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (bookData: any) => {
    try {
      const newBook = await BookClubService.addBookToClub(club.id, bookData);
      setBooks(prev => [newBook, ...prev]);
      setShowAddBookModal(false);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleSetCurrentBook = async (bookId: string) => {
    try {
      await BookClubService.setCurrentBook(club.id, bookId);
      await loadClubData(); // Refresh data
    } catch (error) {
      console.error('Error setting current book:', error);
    }
  };

  const currentBook = books.find(book => book.status === 'current');
  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || isAdmin;

  const tabs = [
    { id: 'chat' as TabType, label: 'Chat', icon: MessageCircle },
    { id: 'discussions' as TabType, label: 'Discussions', icon: MessageCircle },
    { id: 'progress' as TabType, label: 'Progress', icon: BarChart3 },
    { id: 'meetings' as TabType, label: 'Meetings', icon: Calendar },
    { id: 'members' as TabType, label: 'Members', icon: Users }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{club.name}</h1>
            <p className="text-neutral-600">{members.length} members</p>
          </div>
        </div>
        {isAdmin && (
          <Button variant="outline">
            <Settings size={18} className="mr-2" />
            Settings
          </Button>
        )}
      </div>

      {/* Club Info */}
      <Card>
        <CardBody>
          <div className="flex items-start space-x-4">
            {club.cover_image_url && (
              <img
                src={club.cover_image_url}
                alt={club.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              {club.description && (
                <p className="text-neutral-600 mb-4">{club.description}</p>
              )}
              
              {currentBook ? (
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600 font-medium">Currently Reading</p>
                      <h3 className="font-bold text-lg">{currentBook.book_title}</h3>
                      {currentBook.book_author && (
                        <p className="text-neutral-600">by {currentBook.book_author}</p>
                      )}
                    </div>
                    {currentBook.book_cover_url && (
                      <img
                        src={currentBook.book_cover_url}
                        alt={currentBook.book_title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-50 p-4 rounded-lg text-center">
                  <BookOpen size={32} className="mx-auto text-neutral-400 mb-2" />
                  <p className="text-neutral-600 mb-2">No book selected</p>
                  {isModerator && (
                    <Button size="sm" onClick={() => setShowAddBookModal(true)}>
                      Add First Book
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Books Section */}
      {books.length > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Club Books</h3>
              {isModerator && (
                <Button size="sm" onClick={() => setShowAddBookModal(true)}>
                  <Plus size={16} className="mr-1" />
                  Add Book
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className={`p-3 rounded-lg border ${
                    book.status === 'current' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {book.book_cover_url && (
                      <img
                        src={book.book_cover_url}
                        alt={book.book_title}
                        className="w-10 h-14 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{book.book_title}</h4>
                      {book.book_author && (
                        <p className="text-xs text-neutral-600">{book.book_author}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          book.status === 'current' 
                            ? 'bg-green-100 text-green-700'
                            : book.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {book.status}
                        </span>
                        {isModerator && book.status !== 'current' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetCurrentBook(book.id)}
                          >
                            Set Current
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
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
        {activeTab === 'chat' && <BookClubChat clubId={club.id} />}
        {activeTab === 'discussions' && (
          <BookClubDiscussion 
            clubId={club.id} 
            currentBook={currentBook}
            canModerate={isModerator}
          />
        )}
        {activeTab === 'progress' && currentBook && (
          <BookClubProgress 
            clubId={club.id} 
            book={currentBook}
            members={members}
          />
        )}
        {activeTab === 'meetings' && (
          <BookClubMeetings 
            clubId={club.id}
            canCreateMeetings={isModerator}
            books={books}
          />
        )}
        {activeTab === 'members' && (
          <BookClubMembers 
            clubId={club.id}
            members={members}
            userRole={userRole}
            onMembersChange={loadClubData}
          />
        )}
      </div>

      {/* Modals */}
      {showAddBookModal && (
        <AddBookModal
          onClose={() => setShowAddBookModal(false)}
          onSubmit={handleAddBook}
        />
      )}
    </div>
  );
};

export default BookClubDetail;

