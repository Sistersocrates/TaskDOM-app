import { Book, User } from '../../types';

export interface ShareableContent {
  type: 'progress' | 'reading_list' | 'tbr' | 'streak' | 'achievement' | 'book_review';
  title: string;
  description: string;
  data: any;
  hashtags: string[];
  imageUrl?: string;
}

export class ShareableContentGenerator {
  static generateProgressShare(book: Book, user: User): ShareableContent {
    const percentage = Math.round((book.currentPage / book.totalPages) * 100);
    
    return {
      type: 'progress',
      title: `📚 Reading Progress Update!`,
      description: `Just hit ${percentage}% on "${book.title}" by ${book.author}. This book is incredible! 🔥`,
      data: {
        bookTitle: book.title,
        author: book.author,
        currentPage: book.currentPage,
        totalPages: book.totalPages,
        percentage,
        pagesRead: book.currentPage,
        spiceRating: book.spiceRating,
        coverImage: book.coverImage
      },
      hashtags: [
        'BookProgress',
        'CurrentlyReading',
        'BookLover',
        'ReadingGoals',
        'BookCommunity',
        ...(book.spiceRating >= 3 ? ['SpicyReads', 'RomanceBooks'] : []),
        ...(book.tropes.slice(0, 2).map(trope => trope.replace(/\s+/g, '')))
      ],
      imageUrl: book.coverImage
    };
  }

  static generateStreakShare(streakDays: number, user: User): ShareableContent {
    return {
      type: 'streak',
      title: `🔥 ${streakDays} Day Reading Streak!`,
      description: `I've been reading consistently for ${streakDays} days straight! Building this habit one page at a time 📚💪`,
      data: {
        days: streakDays,
        username: user.displayName,
        goal: user.dailyReadingGoal
      },
      hashtags: [
        'ReadingStreak',
        'ReadingHabit',
        'BookGoals',
        'DailyReading',
        'ReadingMotivation',
        'BookChallenge',
        'ConsistentReader'
      ]
    };
  }

  static generateTBRShare(books: Book[], user: User): ShareableContent {
    const totalBooks = books.length;
    const spicyBooks = books.filter(book => book.spiceRating >= 3).length;
    
    return {
      type: 'tbr',
      title: `📚 My To-Be-Read List`,
      description: `My TBR pile has ${totalBooks} amazing books waiting to be devoured! ${spicyBooks > 0 ? `Including ${spicyBooks} spicy picks 🌶️` : ''} Any recommendations?`,
      data: {
        books: books.map(book => ({
          title: book.title,
          author: book.author,
          spiceRating: book.spiceRating,
          tropes: book.tropes
        })),
        totalBooks,
        spicyBooks,
        topGenres: user.preferredGenres
      },
      hashtags: [
        'TBR',
        'ToBeRead',
        'BookRecommendations',
        'BookList',
        'ReadingGoals',
        'BookPile',
        ...(spicyBooks > 0 ? ['SpicyReads', 'RomanceBooks'] : []),
        ...user.preferredGenres.slice(0, 2).map(genre => genre.replace(/\s+/g, ''))
      ]
    };
  }

  static generateReadingListShare(books: Book[], user: User): ShareableContent {
    const totalBooks = books.length;
    const completed = books.filter(book => book.status === 'finished').length;
    const currentlyReading = books.filter(book => book.status === 'currentlyReading').length;
    const averageSpice = books.length > 0 ? 
      Math.round(books.reduce((sum, book) => sum + book.spiceRating, 0) / books.length) : 0;

    return {
      type: 'reading_list',
      title: `📚 My Reading Library`,
      description: `${totalBooks} books in my collection! Currently reading ${currentlyReading}, finished ${completed} this year. Average spice level: ${'🌶️'.repeat(averageSpice)} 🎉`,
      data: {
        totalBooks,
        completed,
        currentlyReading,
        averageSpice,
        favoriteGenres: user.preferredGenres,
        username: user.displayName
      },
      hashtags: [
        'BookCollection',
        'ReadingStats',
        'BookLibrary',
        'BookLover',
        'ReadingYear',
        'BookCommunity',
        ...(averageSpice >= 3 ? ['SpicyReads'] : []),
        ...user.preferredGenres.slice(0, 2).map(genre => genre.replace(/\s+/g, ''))
      ]
    };
  }

  static generateAchievementShare(achievement: string, data: any, user: User): ShareableContent {
    return {
      type: 'achievement',
      title: `🏆 Achievement Unlocked!`,
      description: `Just ${achievement}! ${data.description || ''} 🎉`,
      data: {
        achievement,
        ...data,
        username: user.displayName
      },
      hashtags: [
        'BookAchievement',
        'ReadingGoals',
        'BookMilestone',
        'ReadingWin',
        'BookChallenge',
        'ReadingSuccess'
      ]
    };
  }

  static generateBookReviewShare(book: Book, review: string, rating: number, user: User): ShareableContent {
    return {
      type: 'book_review',
      title: `📖 Book Review: ${book.title}`,
      description: `Just finished "${book.title}" by ${book.author}. ${'⭐'.repeat(rating)} ${review.substring(0, 100)}${review.length > 100 ? '...' : ''}`,
      data: {
        book: {
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          spiceRating: book.spiceRating,
          tropes: book.tropes
        },
        review,
        rating,
        username: user.displayName
      },
      hashtags: [
        'BookReview',
        'BookRecommendation',
        'JustFinished',
        'BookRating',
        'BookBlogger',
        ...(book.spiceRating >= 3 ? ['SpicyReads', 'RomanceBooks'] : []),
        ...book.tropes.slice(0, 2).map(trope => trope.replace(/\s+/g, ''))
      ],
      imageUrl: book.coverImage
    };
  }
}