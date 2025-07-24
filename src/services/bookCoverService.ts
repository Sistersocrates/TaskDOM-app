import { googleBooksService } from './googleBooksService';
import { openLibraryService } from './openLibraryService';

/**
 * Enhanced service for fetching book covers from multiple sources
 * with intelligent fallback mechanisms
 */
export class BookCoverService {
  private coverCache: Map<string, string> = new Map();

  /**
   * Get the best available cover for a book using multiple sources
   * @param book Book information with title, author, and optional ISBN
   * @returns Promise resolving to the best available cover URL
   */
  async getBestCoverImage(book: {
    title: string;
    author: string;
    isbn?: string;
    coverImage?: string;
  }): Promise<string> {
    // Generate cache key
    const cacheKey = `${book.isbn || ''}:${book.title}:${book.author}`;
    
    // Check cache first
    if (this.coverCache.has(cacheKey)) {
      return this.coverCache.get(cacheKey)!;
    }

    // If book already has a valid cover that's not a fallback, use it
    if (book.coverImage && 
        !book.coverImage.includes('pexels-photo-1765033') && 
        await this.validateImageUrl(book.coverImage)) {
      this.coverCache.set(cacheKey, book.coverImage);
      return book.coverImage;
    }

    try {
      console.log(`Fetching enhanced cover for: ${book.title} by ${book.author}`);
      let enhancedCover = null;

      // Try Google Books first
      if (book.isbn) {
        console.log(`Trying Google Books with ISBN: ${book.isbn}`);
        const googleBook = await googleBooksService.getBookByISBN(book.isbn);
        if (googleBook?.imageLinks) {
          // Prefer larger images for better quality
          enhancedCover = googleBook.imageLinks.large || 
                         googleBook.imageLinks.medium || 
                         googleBook.imageLinks.small || 
                         googleBook.imageLinks.thumbnail;
          
          if (enhancedCover) {
            console.log(`Found Google Books cover by ISBN for ${book.title}`);
          }
        }
      }

      // If no cover from ISBN, try searching by title and author
      if (!enhancedCover && book.title) {
        console.log(`Searching Google Books for: ${book.title} ${book.author}`);
        const searchResults = await googleBooksService.searchBooks(`${book.title} ${book.author}`, 1);
        if (searchResults.length > 0 && searchResults[0].imageLinks) {
          const imageLinks = searchResults[0].imageLinks;
          enhancedCover = imageLinks.large || 
                         imageLinks.medium || 
                         imageLinks.small || 
                         imageLinks.thumbnail;
          
          if (enhancedCover) {
            console.log(`Found Google Books cover by title/author for ${book.title}`);
          }
        }
      }

      // If still no cover, try Open Library
      if (!enhancedCover) {
        console.log(`Trying Open Library for ${book.title}`);
        enhancedCover = await openLibraryService.getBestCoverImage(
          book.isbn, 
          book.title, 
          book.author
        );
        
        if (enhancedCover) {
          console.log(`Found Open Library cover for ${book.title}`);
        }
      }

      // If we found an enhanced cover, validate and cache it
      if (enhancedCover) {
        const isValid = await this.validateImageUrl(enhancedCover);
        if (isValid) {
          this.coverCache.set(cacheKey, enhancedCover);
          return enhancedCover;
        }
      }

      // Fallback to original cover or default
      const fallback = book.coverImage || 'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg';
      this.coverCache.set(cacheKey, fallback);
      return fallback;
    } catch (error) {
      console.error(`Error fetching cover for ${book.title}:`, error);
      // Fallback to original cover or default
      const fallback = book.coverImage || 'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg';
      this.coverCache.set(cacheKey, fallback);
      return fallback;
    }
  }

  /**
   * Enhance multiple books with better covers
   * @param books Array of books to enhance
   * @returns Promise resolving to books with enhanced covers
   */
  async enhanceBookCovers<T extends { title: string; author: string; isbn?: string; coverImage?: string }>(
    books: T[]
  ): Promise<T[]> {
    return Promise.all(
      books.map(async (book) => {
        try {
          const enhancedCover = await this.getBestCoverImage(book);
          return { ...book, coverImage: enhancedCover };
        } catch (error) {
          console.error(`Error enhancing cover for ${book.title}:`, error);
          return book;
        }
      })
    );
  }

  /**
   * Validate if an image URL is accessible
   * @param url Image URL to validate
   * @returns Promise resolving to boolean indicating if image is accessible
   */
  private async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('Image validation failed:', error);
      return false;
    }
  }

  /**
   * Clear the cover image cache
   */
  clearCache(): void {
    this.coverCache.clear();
  }
}

export const bookCoverService = new BookCoverService();

