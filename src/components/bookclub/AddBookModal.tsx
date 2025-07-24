import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardBody } from '../ui/Card';
import { CreateClubBookForm } from '../../types/bookclub';

interface AddBookModalProps {
  onClose: () => void;
  onSubmit: (bookData: CreateClubBookForm) => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateClubBookForm>({
    book_title: '',
    book_author: '',
    book_isbn: '',
    book_cover_url: '',
    total_pages: undefined,
    start_date: '',
    target_end_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.book_title.trim()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error adding book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateClubBookForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const searchGoogleBooks = async () => {
    if (!formData.book_title.trim()) return;

    try {
      // This would integrate with Google Books API
      // For now, just a placeholder
      console.log('Searching for:', formData.book_title);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardBody>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add Book to Club</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                label="Book Title"
                value={formData.book_title}
                onChange={(e) => handleInputChange('book_title', e.target.value)}
                placeholder="Enter book title"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={searchGoogleBooks}
                className="mt-6"
              >
                <Search size={18} />
              </Button>
            </div>

            <Input
              label="Author"
              value={formData.book_author}
              onChange={(e) => handleInputChange('book_author', e.target.value)}
              placeholder="Author name"
            />

            <Input
              label="ISBN (Optional)"
              value={formData.book_isbn}
              onChange={(e) => handleInputChange('book_isbn', e.target.value)}
              placeholder="ISBN-10 or ISBN-13"
            />

            <Input
              label="Cover Image URL (Optional)"
              value={formData.book_cover_url}
              onChange={(e) => handleInputChange('book_cover_url', e.target.value)}
              placeholder="https://example.com/cover.jpg"
              type="url"
            />

            <Input
              label="Total Pages (Optional)"
              type="number"
              value={formData.total_pages || ''}
              onChange={(e) => handleInputChange('total_pages', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Number of pages"
              min={1}
            />

            <Input
              label="Start Date (Optional)"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
            />

            <Input
              label="Target End Date (Optional)"
              type="date"
              value={formData.target_end_date}
              onChange={(e) => handleInputChange('target_end_date', e.target.value)}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.book_title.trim()}
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Add Book'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddBookModal;

