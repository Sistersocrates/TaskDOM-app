import { supabase } from '../lib/supabase';
import {
  BookClub,
  ClubMember,
  ClubBook,
  ClubMessage,
  ClubDiscussion,
  DiscussionReply,
  ClubMeeting,
  ReadingProgress,
  ClubInvitation,
  ReadingChallenge,
  CreateBookClubForm,
  CreateClubBookForm,
  CreateMeetingForm,
  CreateDiscussionForm,
  UpdateProgressForm
} from '../types/bookclub';

export class BookClubService {
  // Book Club CRUD
  static async getBookClubs(userId?: string): Promise<BookClub[]> {
    let query = supabase
      .from('book_clubs')
      .select(`
        *,
        club_members!inner(count),
        club_books!left(*)
      `);

    if (userId) {
      query = query.or(`is_private.eq.false,id.in.(${await this.getUserClubIds(userId)})`);
    } else {
      query = query.eq('is_private', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getBookClub(clubId: string): Promise<BookClub | null> {
    const { data, error } = await supabase
      .from('book_clubs')
      .select(`
        *,
        club_members(count),
        club_books(*)
      `)
      .eq('id', clubId)
      .single();

    if (error) throw error;
    return data;
  }

  static async createBookClub(clubData: CreateBookClubForm): Promise<BookClub> {
    console.log('BookClubService.createBookClub called with:', clubData);
    
    const { data: user } = await supabase.auth.getUser();
    console.log('Current user:', user);
    
    if (!user.user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('Attempting to insert book club...');
    const { data, error } = await supabase
      .from('book_clubs')
      .insert({
        ...clubData,
        created_by: user.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating book club:', error);
      throw error;
    }

    console.log('Book club created successfully:', data);

    // Add creator as admin member
    console.log('Adding creator as admin member...');
    try {
      await this.addMember(data.id, user.user.id, 'admin');
      console.log('Creator added as admin member successfully');
    } catch (memberError) {
      console.error('Error adding creator as member:', memberError);
      // Don't throw here as the club was created successfully
    }

    return data;
  }

  static async updateBookClub(clubId: string, updates: Partial<CreateBookClubForm>): Promise<BookClub> {
    const { data, error } = await supabase
      .from('book_clubs')
      .update(updates)
      .eq('id', clubId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteBookClub(clubId: string): Promise<void> {
    const { error } = await supabase
      .from('book_clubs')
      .delete()
      .eq('id', clubId);

    if (error) throw error;
  }

  // Member Management
  static async getClubMembers(clubId: string): Promise<ClubMember[]> {
    const { data, error } = await supabase
      .from('club_members')
      .select(`
        *,
        user:auth.users(id, email, raw_user_meta_data)
      `)
      .eq('club_id', clubId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async addMember(clubId: string, userId: string, role: 'admin' | 'moderator' | 'member' = 'member'): Promise<ClubMember> {
    const { data, error } = await supabase
      .from('club_members')
      .insert({
        club_id: clubId,
        user_id: userId,
        role
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateMemberRole(clubId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<void> {
    const { error } = await supabase
      .from('club_members')
      .update({ role })
      .eq('club_id', clubId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async removeMember(clubId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async joinClub(clubId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    await this.addMember(clubId, user.user.id);
  }

  static async leaveClub(clubId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    await this.removeMember(clubId, user.user.id);
  }

  // Book Management
  static async getClubBooks(clubId: string): Promise<ClubBook[]> {
    const { data, error } = await supabase
      .from('club_books')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addBookToClub(clubId: string, bookData: CreateClubBookForm): Promise<ClubBook> {
    const { data, error } = await supabase
      .from('club_books')
      .insert({
        club_id: clubId,
        ...bookData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateClubBook(bookId: string, updates: Partial<CreateClubBookForm>): Promise<ClubBook> {
    const { data, error } = await supabase
      .from('club_books')
      .update(updates)
      .eq('id', bookId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async setCurrentBook(clubId: string, bookId: string): Promise<void> {
    // Set all books to not current
    await supabase
      .from('club_books')
      .update({ status: 'completed' })
      .eq('club_id', clubId)
      .eq('status', 'current');

    // Set the selected book as current
    const { error } = await supabase
      .from('club_books')
      .update({ status: 'current' })
      .eq('id', bookId);

    if (error) throw error;
  }

  // Chat/Messages
  static async getClubMessages(clubId: string, limit: number = 50): Promise<ClubMessage[]> {
    const { data, error } = await supabase
      .from('club_messages')
      .select(`
        *,
        user:auth.users(id, raw_user_meta_data),
        reply_to_message:club_messages(*)
      `)
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async sendMessage(clubId: string, content: string, isNSFW: boolean = false, replyTo?: string): Promise<ClubMessage> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('club_messages')
      .insert({
        club_id: clubId,
        user_id: user.user.id,
        content,
        is_nsfw: isNSFW,
        reply_to: replyTo
      })
      .select(`
        *,
        user:auth.users(id, raw_user_meta_data)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('club_messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  }

  // Discussions
  static async getClubDiscussions(clubId: string, bookId?: string): Promise<ClubDiscussion[]> {
    let query = supabase
      .from('club_discussions')
      .select(`
        *,
        user:auth.users(id, raw_user_meta_data),
        book:club_books(*)
      `)
      .eq('club_id', clubId);

    if (bookId) {
      query = query.eq('book_id', bookId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createDiscussion(clubId: string, discussionData: CreateDiscussionForm): Promise<ClubDiscussion> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('club_discussions')
      .insert({
        club_id: clubId,
        user_id: user.user.id,
        ...discussionData
      })
      .select(`
        *,
        user:auth.users(id, raw_user_meta_data),
        book:club_books(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async likeDiscussion(discussionId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('discussion_likes')
      .select('id')
      .eq('discussion_id', discussionId)
      .eq('user_id', user.user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('discussion_likes')
        .delete()
        .eq('discussion_id', discussionId)
        .eq('user_id', user.user.id);

      // Decrement likes count
      await supabase.rpc('decrement_discussion_likes', { discussion_id: discussionId });
    } else {
      // Like
      await supabase
        .from('discussion_likes')
        .insert({
          discussion_id: discussionId,
          user_id: user.user.id
        });

      // Increment likes count
      await supabase.rpc('increment_discussion_likes', { discussion_id: discussionId });
    }
  }

  // Meetings
  static async getClubMeetings(clubId: string): Promise<ClubMeeting[]> {
    const { data, error } = await supabase
      .from('club_meetings')
      .select(`
        *,
        book:club_books(*),
        meeting_attendees(count)
      `)
      .eq('club_id', clubId)
      .order('meeting_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createMeeting(clubId: string, meetingData: CreateMeetingForm): Promise<ClubMeeting> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('club_meetings')
      .insert({
        club_id: clubId,
        created_by: user.user.id,
        ...meetingData
      })
      .select(`
        *,
        book:club_books(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateMeetingAttendance(meetingId: string, status: 'attending' | 'not_attending' | 'maybe'): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('meeting_attendees')
      .upsert({
        meeting_id: meetingId,
        user_id: user.user.id,
        status
      });

    if (error) throw error;
  }

  // Reading Progress
  static async getReadingProgress(clubId: string, bookId: string): Promise<ReadingProgress[]> {
    const { data, error } = await supabase
      .from('reading_progress')
      .select(`
        *,
        user:auth.users(id, raw_user_meta_data)
      `)
      .eq('club_id', clubId)
      .eq('book_id', bookId)
      .order('progress_percentage', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateReadingProgress(clubId: string, bookId: string, progressData: UpdateProgressForm): Promise<ReadingProgress> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get book total pages to calculate percentage
    const { data: book } = await supabase
      .from('club_books')
      .select('total_pages')
      .eq('id', bookId)
      .single();

    const progressPercentage = book?.total_pages 
      ? (progressData.current_page / book.total_pages) * 100 
      : 0;

    const { data, error } = await supabase
      .from('reading_progress')
      .upsert({
        club_id: clubId,
        book_id: bookId,
        user_id: user.user.id,
        current_page: progressData.current_page,
        progress_percentage: progressPercentage,
        notes: progressData.notes,
        last_read_date: new Date().toISOString().split('T')[0]
      })
      .select(`
        *,
        user:auth.users(id, raw_user_meta_data)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // Helper methods
  private static async getUserClubIds(userId: string): Promise<string> {
    const { data } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', userId);

    return data?.map(m => m.club_id).join(',') || '';
  }

  static async isUserMember(clubId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('club_members')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    return !!data;
  }

  static async getUserRole(clubId: string, userId: string): Promise<string | null> {
    const { data } = await supabase
      .from('club_members')
      .select('role')
      .eq('club_id', clubId)
      .eq('user_id', userId)
      .single();

    return data?.role || null;
  }
}

