import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Video } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardBody } from '../ui/Card';
import { CreateMeetingForm } from '../../types/bookclub';
import { ClubBook } from '../../types/bookclub';

interface CreateMeetingModalProps {
  onClose: () => void;
  onSubmit: (meetingData: CreateMeetingForm) => void;
  books: ClubBook[];
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({ 
  onClose, 
  onSubmit, 
  books 
}) => {
  const [formData, setFormData] = useState<CreateMeetingForm>({
    title: '',
    description: '',
    meeting_date: '',
    duration_minutes: 60,
    meeting_url: '',
    meeting_type: 'virtual',
    location: '',
    max_attendees: undefined,
    book_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.meeting_date) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        book_id: formData.book_id || undefined
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateMeetingForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardBody>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Schedule Meeting</h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Meeting Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Chapter 5 Discussion"
              required
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="What will you discuss in this meeting?"
                rows={3}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <Input
              label="Date & Time"
              type="datetime-local"
              value={formData.meeting_date}
              onChange={(e) => handleInputChange('meeting_date', e.target.value)}
              min={today}
              required
            />

            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
              min={15}
              max={480}
              step={15}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Meeting Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="meeting_type"
                    value="virtual"
                    checked={formData.meeting_type === 'virtual'}
                    onChange={(e) => handleInputChange('meeting_type', e.target.value)}
                    className="mr-3"
                  />
                  <Video size={18} className="mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">Virtual Meeting</p>
                    <p className="text-sm text-neutral-500">Online video call</p>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="meeting_type"
                    value="in-person"
                    checked={formData.meeting_type === 'in-person'}
                    onChange={(e) => handleInputChange('meeting_type', e.target.value)}
                    className="mr-3"
                  />
                  <MapPin size={18} className="mr-2 text-green-500" />
                  <div>
                    <p className="font-medium">In-Person</p>
                    <p className="text-sm text-neutral-500">Physical location</p>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="meeting_type"
                    value="hybrid"
                    checked={formData.meeting_type === 'hybrid'}
                    onChange={(e) => handleInputChange('meeting_type', e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex mr-2">
                    <Video size={16} className="text-blue-500" />
                    <MapPin size={16} className="text-green-500 -ml-1" />
                  </div>
                  <div>
                    <p className="font-medium">Hybrid</p>
                    <p className="text-sm text-neutral-500">Both online and in-person</p>
                  </div>
                </label>
              </div>
            </div>

            {(formData.meeting_type === 'virtual' || formData.meeting_type === 'hybrid') && (
              <Input
                label="Meeting URL"
                value={formData.meeting_url}
                onChange={(e) => handleInputChange('meeting_url', e.target.value)}
                placeholder="https://zoom.us/j/..."
                type="url"
              />
            )}

            {(formData.meeting_type === 'in-person' || formData.meeting_type === 'hybrid') && (
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Central Library, Room 201"
              />
            )}

            <Input
              label="Max Attendees (Optional)"
              type="number"
              value={formData.max_attendees || ''}
              onChange={(e) => handleInputChange('max_attendees', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Leave empty for unlimited"
              min={2}
            />

            {books.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Related Book (Optional)
                </label>
                <select
                  value={formData.book_id}
                  onChange={(e) => handleInputChange('book_id', e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a book...</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.book_title} {book.book_author && `by ${book.book_author}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                disabled={loading || !formData.title.trim() || !formData.meeting_date}
                className="flex-1"
              >
                {loading ? 'Scheduling...' : 'Schedule Meeting'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateMeetingModal;

