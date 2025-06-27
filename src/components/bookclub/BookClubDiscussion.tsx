import React, { useState } from 'react';
import { MessageCircle, Heart, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import { mockUser } from '../../utils/mockData';

const BookClubDiscussion: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(1);
  
  const discussions = [
    {
      id: '1',
      user: mockUser,
      chapter: 1,
      content: "The tension in this chapter was incredible! Especially when...",
      likes: 12,
      replies: 3,
      isNSFW: true,
      timestamp: new Date()
    },
    {
      id: '2',
      user: { ...mockUser, username: 'bookworm2' },
      chapter: 1,
      content: "I love how the author built up the chemistry between them.",
      likes: 8,
      replies: 1,
      isNSFW: false,
      timestamp: new Date()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {Array.from({ length: 10 }, (_, i) => (
          <Button
            key={i}
            variant={activeChapter === i + 1 ? 'primary' : 'outline'}
            onClick={() => setActiveChapter(i + 1)}
            size="sm"
          >
            Chapter {i + 1}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {discussions.map((discussion) => (
          <div key={discussion.id} className="border-b border-neutral-200 pb-4">
            <div className="flex items-start space-x-3">
              <img
                src={discussion.user.profilePicture}
                alt={discussion.user.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-grow">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{discussion.user.username}</span>
                  <span className="text-xs text-neutral-500">
                    {discussion.timestamp.toLocaleDateString()}
                  </span>
                  {discussion.isNSFW && (
                    <span className="text-xs bg-error-100 text-error-600 px-2 py-0.5 rounded-full flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      NSFW
                    </span>
                  )}
                </div>
                <p className="mt-2">{discussion.content}</p>
                <div className="mt-3 flex items-center space-x-4">
                  <button className="flex items-center text-neutral-500 hover:text-primary-500">
                    <Heart size={18} className="mr-1" />
                    {discussion.likes}
                  </button>
                  <button className="flex items-center text-neutral-500 hover:text-primary-500">
                    <MessageCircle size={18} className="mr-1" />
                    {discussion.replies} replies
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookClubDiscussion;