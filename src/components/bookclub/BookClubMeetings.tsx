import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, Users, Plus, Check, X, AlertCircle } from 'lucide-react';
import { ClubMeeting, ClubBook } from '../../types/bookclub';
import { BookClubService } from '../../services/bookClubService';
import Button from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import CreateMeetingModal from './CreateMeetingModal';

interface BookClubMeetingsProps {
  clubId: string;
  canCreateMeetings: boolean;
  books: ClubBook[];
}

const BookClubMeetings: React.FC<BookClubMeetingsProps> = ({ 
  clubId, 
  canCreateMeetings, 
  books 
}) => {
  const [meetings, setMeetings] = useState<ClubMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, [clubId]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const meetingsData = await BookClubService.getClubMeetings(clubId);
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (meetingData: any) => {
    try {
      const newMeeting = await BookClubService.createMeeting(clubId, meetingData);
      setMeetings(prev => [newMeeting, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleAttendanceUpdate = async (meetingId: string, status: 'attending' | 'not_attending' | 'maybe') => {
    try {
      await BookClubService.updateMeetingAttendance(meetingId, status);
      await loadMeetings(); // Refresh to get updated attendance
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getAttendanceColor = (status?: string) => {
    switch (status) {
      case 'attending': return 'text-green-600 bg-green-100';
      case 'not_attending': return 'text-red-600 bg-red-100';
      case 'maybe': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const upcomingMeetings = meetings.filter(m => isUpcoming(m.meeting_date));
  const pastMeetings = meetings.filter(m => isPast(m.meeting_date));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Meetings</h3>
        {canCreateMeetings && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="mr-2" />
            Schedule Meeting
          </Button>
        )}
      </div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg mb-4">Upcoming Meetings</h4>
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id} className="border-l-4 border-l-primary-500">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-bold text-lg">{meeting.title}</h5>
                      {meeting.description && (
                        <p className="text-neutral-600 mt-1">{meeting.description}</p>
                      )}
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-sm text-neutral-600">
                          <Calendar size={16} className="mr-2" />
                          {formatDate(meeting.meeting_date)}
                        </div>
                        <div className="flex items-center text-sm text-neutral-600">
                          <Clock size={16} className="mr-2" />
                          {formatTime(meeting.meeting_date)} ({meeting.duration_minutes} minutes)
                        </div>
                        
                        {meeting.meeting_type === 'virtual' && meeting.meeting_url && (
                          <div className="flex items-center text-sm text-neutral-600">
                            <Video size={16} className="mr-2" />
                            <a 
                              href={meeting.meeting_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline"
                            >
                              Join Virtual Meeting
                            </a>
                          </div>
                        )}
                        
                        {meeting.meeting_type === 'in-person' && meeting.location && (
                          <div className="flex items-center text-sm text-neutral-600">
                            <MapPin size={16} className="mr-2" />
                            {meeting.location}
                          </div>
                        )}
                        
                        {meeting.book && (
                          <div className="flex items-center text-sm text-neutral-600">
                            <span className="font-medium">Book:</span>
                            <span className="ml-1">{meeting.book.book_title}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-neutral-600">
                          <Users size={16} className="mr-2" />
                          {meeting.attendee_count || 0} attending
                          {meeting.max_attendees && ` (max ${meeting.max_attendees})`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <div className="text-sm text-neutral-600 mb-2">Your Status:</div>
                      <div className={`text-xs px-2 py-1 rounded-full mb-3 ${getAttendanceColor(meeting.user_attendance_status)}`}>
                        {meeting.user_attendance_status || 'pending'}
                      </div>
                      
                      <div className="space-y-1">
                        <Button
                          size="sm"
                          variant={meeting.user_attendance_status === 'attending' ? 'primary' : 'outline'}
                          onClick={() => handleAttendanceUpdate(meeting.id, 'attending')}
                          className="w-full"
                        >
                          <Check size={14} className="mr-1" />
                          Attending
                        </Button>
                        <Button
                          size="sm"
                          variant={meeting.user_attendance_status === 'maybe' ? 'primary' : 'outline'}
                          onClick={() => handleAttendanceUpdate(meeting.id, 'maybe')}
                          className="w-full"
                        >
                          <AlertCircle size={14} className="mr-1" />
                          Maybe
                        </Button>
                        <Button
                          size="sm"
                          variant={meeting.user_attendance_status === 'not_attending' ? 'primary' : 'outline'}
                          onClick={() => handleAttendanceUpdate(meeting.id, 'not_attending')}
                          className="w-full"
                        >
                          <X size={14} className="mr-1" />
                          Can't Attend
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg mb-4">Past Meetings</h4>
          <div className="space-y-4">
            {pastMeetings.map((meeting) => (
              <Card key={meeting.id} className="opacity-75">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-bold">{meeting.title}</h5>
                      {meeting.description && (
                        <p className="text-neutral-600 text-sm mt-1">{meeting.description}</p>
                      )}
                      
                      <div className="mt-2 flex items-center text-sm text-neutral-500">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(meeting.meeting_date)} at {formatTime(meeting.meeting_date)}
                      </div>
                      
                      {meeting.book && (
                        <div className="mt-1 text-sm text-neutral-500">
                          <span className="font-medium">Book:</span> {meeting.book.book_title}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-neutral-500">
                      {meeting.attendee_count || 0} attended
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {meetings.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <Calendar size={48} className="mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-600 mb-2">No Meetings Scheduled</h3>
            <p className="text-neutral-500 mb-4">
              {canCreateMeetings 
                ? "Schedule your first meeting to bring the club together!"
                : "No meetings have been scheduled yet."
              }
            </p>
            {canCreateMeetings && (
              <Button onClick={() => setShowCreateModal(true)}>
                Schedule First Meeting
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMeeting}
          books={books}
        />
      )}
    </div>
  );
};

export default BookClubMeetings;

