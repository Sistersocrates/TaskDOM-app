import React, { useState, useEffect } from 'react';
import { Plus, Users, Lock, Globe, BookOpen } from 'lucide-react';
import { BookClub } from '../../types/bookclub';
import { BookClubService } from '../../services/bookClubService';
import { useUserStore } from '../../store/userStore';
import Button from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import CreateBookClubModal from './CreateBookClubModal';

interface BookClubListProps {
  onSelectClub: (club: BookClub) => void;
}

const BookClubList: React.FC<BookClubListProps> = ({ onSelectClub }) => {
  const [clubs, setClubs] = useState<BookClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useUserStore();

  useEffect(() => {
    loadClubs();
  }, [user]);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const clubsData = await BookClubService.getBookClubs(user?.id);
      setClubs(clubsData);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (clubData: any) => {
    try {
      console.log('Creating book club with data:', clubData);
      
      // Validate required fields
      if (!clubData.name?.trim()) {
        throw new Error('Club name is required');
      }
      
      const newClub = await BookClubService.createBookClub(clubData);
      console.log('Book club created successfully:', newClub);
      
      setClubs(prev => [newClub, ...prev]);
      setShowCreateModal(false);
      onSelectClub(newClub);
      
      // Show success message (you could add a toast notification here)
      alert('Book club created successfully!');
      
    } catch (error) {
      console.error('Error creating club:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to create book club';
      alert(`Error: ${errorMessage}`);
      
      // Don't close modal on error so user can try again
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      await BookClubService.joinClub(clubId);
      await loadClubs(); // Refresh the list
    } catch (error) {
      console.error('Error joining club:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Book Clubs</h2>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center">
          <Plus size={18} className="mr-2" />
          Create Club
        </Button>
      </div>

      {clubs.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">No Book Clubs Yet</h3>
            <p className="text-neutral-500 mb-4">
              Create your first book club or join an existing one to start discussing your favorite reads!
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Club
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Card
              key={club.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectClub(club)}
            >
              <CardBody>
                {club.cover_image_url && (
                  <img
                    src={club.cover_image_url}
                    alt={club.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg flex-1">{club.name}</h3>
                  <div className="flex items-center ml-2">
                    {club.is_private ? (
                      <Lock size={16} className="text-neutral-400" />
                    ) : (
                      <Globe size={16} className="text-neutral-400" />
                    )}
                  </div>
                </div>

                {club.description && (
                  <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                    {club.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-neutral-500 mb-3">
                  <div className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {club.member_count || 0} members
                  </div>
                  <div className="text-xs">
                    {club.is_private ? 'Private' : 'Public'}
                  </div>
                </div>

                {club.current_book && (
                  <div className="bg-neutral-50 p-3 rounded-lg">
                    <p className="text-xs text-neutral-500 mb-1">Currently Reading</p>
                    <p className="font-medium text-sm">{club.current_book.book_title}</p>
                    {club.current_book.book_author && (
                      <p className="text-xs text-neutral-500">by {club.current_book.book_author}</p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinClub(club.id);
                    }}
                  >
                    Join Club
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClub(club);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateBookClubModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateClub}
        />
      )}
    </div>
  );
};

export default BookClubList;

