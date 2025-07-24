import React, { useState } from 'react';
import { X, Upload, Globe, Lock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardBody } from '../ui/Card';
import { CreateBookClubForm } from '../../types/bookclub';

interface CreateBookClubModalProps {
  onClose: () => void;
  onSubmit: (clubData: CreateBookClubForm) => void;
}

const CreateBookClubModal: React.FC<CreateBookClubModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateBookClubForm>({
    name: '',
    description: '',
    cover_image_url: '',
    is_private: false,
    max_members: 50
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error creating club:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateBookClubForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-card border-border">
        <CardBody className="bg-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Create Book Club</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Club Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter club name"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your book club..."
                rows={3}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            <Input
              label="Cover Image URL (Optional)"
              value={formData.cover_image_url}
              onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
              type="url"
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Privacy Setting
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    checked={!formData.is_private}
                    onChange={() => handleInputChange('is_private', false)}
                    className="mr-3"
                  />
                  <Globe size={18} className="mr-2 text-green-500" />
                  <div>
                    <p className="font-medium text-white">Public</p>
                    <p className="text-sm text-gray-400">Anyone can find and join this club</p>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="privacy"
                    checked={formData.is_private}
                    onChange={() => handleInputChange('is_private', true)}
                    className="mr-3"
                  />
                  <Lock size={18} className="mr-2 text-orange-500" />
                  <div>
                    <p className="font-medium text-white">Private</p>
                    <p className="text-sm text-gray-400">Only invited members can join</p>
                  </div>
                </label>
              </div>
            </div>

            <Input
              label="Maximum Members"
              type="number"
              value={formData.max_members}
              onChange={(e) => handleInputChange('max_members', parseInt(e.target.value))}
              min={2}
              max={500}
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
                disabled={loading || !formData.name.trim()}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Club'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateBookClubModal;

