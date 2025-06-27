import React from 'react';
import { mockBooks, mockUser } from '../../utils/mockData';
import ProgressBar from '../ui/ProgressBar';

const BookClubProgress: React.FC = () => {
  const members = [
    {
      user: mockUser,
      progress: 75,
      currentPage: 300,
    },
    {
      user: { ...mockUser, username: 'bookworm2', displayName: 'Sarah' },
      progress: 65,
      currentPage: 260,
    },
    {
      user: { ...mockUser, username: 'bookworm3', displayName: 'Emma' },
      progress: 85,
      currentPage: 340,
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold mb-4">Reading Progress</h3>
        <div className="space-y-4">
          {members.map((member, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img
                    src={member.user.profilePicture}
                    alt={member.user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{member.user.displayName}</span>
                </div>
                <span className="text-sm text-neutral-500">
                  Page {member.currentPage} / {mockBooks[0].totalPages}
                </span>
              </div>
              <ProgressBar value={member.progress} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-4">Reading Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="text-sm text-neutral-500">Average Pages/Day</p>
            <p className="text-xl font-bold">42</p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="text-sm text-neutral-500">Est. Completion</p>
            <p className="text-xl font-bold">5 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookClubProgress;