import React, { useState } from 'react';
import { Crown, Shield, User, Mail, MoreVertical, UserMinus, UserPlus } from 'lucide-react';
import { ClubMember } from '../../types/bookclub';
import { BookClubService } from '../../services/bookClubService';
import { useUserStore } from '../../store/userStore';
import Button from '../ui/Button';
import { Card, CardBody } from '../ui/Card';

interface BookClubMembersProps {
  clubId: string;
  members: ClubMember[];
  userRole: string | null;
  onMembersChange: () => void;
}

const BookClubMembers: React.FC<BookClubMembersProps> = ({ 
  clubId, 
  members, 
  userRole, 
  onMembersChange 
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { user } = useUserStore();

  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || isAdmin;

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    try {
      setLoading(memberId);
      const member = members.find(m => m.id === memberId);
      if (member) {
        await BookClubService.updateMemberRole(clubId, member.user_id, newRole);
        onMembersChange();
      }
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      setLoading(memberId);
      const member = members.find(m => m.id === memberId);
      if (member) {
        await BookClubService.removeMember(clubId, member.user_id);
        onMembersChange();
      }
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown size={16} className="text-yellow-500" />;
      case 'moderator': return <Shield size={16} className="text-blue-500" />;
      default: return <User size={16} className="text-neutral-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-700';
      case 'moderator': return 'bg-blue-100 text-blue-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const canManageMember = (member: ClubMember) => {
    if (!isModerator) return false;
    if (member.user_id === user?.id) return false; // Can't manage yourself
    if (member.role === 'admin' && userRole !== 'admin') return false; // Only admins can manage admins
    return true;
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Members ({members.length})</h3>
        {isModerator && (
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus size={18} className="mr-2" />
            Invite Members
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={member.user?.avatar_url || '/default-avatar.png'}
                    alt={member.user?.display_name || 'User'}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">
                        {member.user?.display_name || 'Anonymous User'}
                      </h4>
                      {member.user_id === user?.id && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600">{member.user?.email}</p>
                    <p className="text-xs text-neutral-500">
                      Joined {formatJoinDate(member.joined_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getRoleColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    <span className="capitalize">{member.role}</span>
                  </div>

                  {canManageMember(member) && (
                    <div className="relative">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                        disabled={loading === member.id}
                        className="text-sm border border-neutral-300 rounded px-2 py-1"
                      >
                        <option value="member">Member</option>
                        <option value="moderator">Moderator</option>
                        {isAdmin && <option value="admin">Admin</option>}
                      </select>
                    </div>
                  )}

                  {canManageMember(member) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={loading === member.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <UserMinus size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <User size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">No Members Yet</h3>
            <p className="text-neutral-500 mb-4">
              Invite people to join this book club and start building your reading community!
            </p>
            {isModerator && (
              <Button onClick={() => setShowInviteModal(true)}>
                Invite First Members
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {/* Simple invite modal placeholder */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Invite Members</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  ×
                </button>
              </div>
              <p className="text-neutral-600 mb-4">
                Share the club link or invite members by email.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full p-3 border border-neutral-300 rounded-lg"
                />
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowInviteModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button className="flex-1">
                    Send Invite
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BookClubMembers;

