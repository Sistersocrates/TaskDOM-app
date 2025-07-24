interface OpenLibraryBook {
  key: string;
  title: string;
  authors?: {
    name: string;
    key: string;
  }[];
  isbn?: string[];
  covers?: number[];
  first_publish_year?: number;
  number_of_pages?: number;
  subjects?: string[];
  description?: string | { value: string };
}

interface OpenLibrarySearchResponse {
  docs: OpenLibraryBook[];
  numFound: number;
}

class OpenLibraryService {
  private baseUrl = 'https://openlibrary.org';
  private coversUrl = 'https://covers.openlibrary.org/b';
  private coverCache: Map<string, string> = new Map(); // Cache for cover images

  /**
   * Get book cover URL by ISBN
   * @param isbn - The ISBN (10 or 13 digits)
   * @param size - Cover size: S (small), M (medium), L (large)
   * @returns Cover image URL or null if not found
   */
  async getCoverByISBN(isbn: string, size: 'S' | 'M' | 'L' = 'L'): Promise<string | null> {
    try {
      // Check cache first
      const cacheKey = `isbn:${isbn}:${size}`;
      if (this.coverCache.has(cacheKey)) {
        return this.coverCache.get(cacheKey)!;
      }

      const cleanISBN = isbn.replace(/[-\s]/g, '');
      const coverUrl = `${this.coversUrl}/isbn/${cleanISBN}-${size}.jpg`;
      
      // Check if the cover exists by making a HEAD request
      const response = await fetch(coverUrl, { method: 'HEAD' });
      
      if (response.ok) {
        // Store in cache
        this.coverCache.set(cacheKey, coverUrl);
        return coverUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching cover by ISBN from Open Library:', error);
      return null;
    }
  }

  /**
   * Get book cover URL by Open Library ID
   * @param olid - Open Library ID (e.g., "OL7440033M")
   * @param size - Cover size: S (small), M (medium), L (large)
   * @returns Cover image URL or null if not found
   */
  async getCoverByOLID(olid: string, size: 'S' | 'M' | 'L' = 'L'): Promise<string | null> {
    try {
      // Check cache first
      const cacheKey = `olid:${olid}:${size}`;
      if (this.coverCache.has(cacheKey)) {
        return this.coverCache.get(cacheKey)!;
      }

      const coverUrl = `${this.coversUrl}/olid/${olid}-${size}.jpg`;
      
      // Check if the cover exists by making a HEAD request
      const response = await fetch(coverUrl, { method: 'HEAD' });
      
      if (response.ok) {
        // Store in cache
        this.coverCache.set(cacheKey, coverUrl);
        return coverUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching cover by OLID from Open Library:', error);
      return null;
    }
  }

  /**
   * Search for books by title and author
   * @param title - Book title
   * @param author - Author name (optional)
   * @param limit - Maximum number of results
   * @returns Array of OpenLibraryBook objects
   */
  async searchBooks(title: string, author?: string, limit: number = 10): Promise<OpenLibraryBook[]> {
    try {
      // Check cache first
      const cacheKey = `search:${title}:${author || ''}:${limit}`;
      const cachedResults = localStorage.getItem(cacheKey);
      if (cachedResults) {
        return JSON.parse(cachedResults);
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        fields: 'key,title,author_name,isbn,cover_i,first_publish_year,number_of_pages_median,subject'
      });

      // Handle different query types
      if (title.toLowerCase().startsWith('author:')) {
        // Author-specific search
        const authorName = title.replace(/^author:/i, '').trim();
        params.append('author', authorName);
      } else if (author) {
        // Title and author search
        params.append('title', title);
        params.append('author', author);
      } else {
        // General search - could be title, author, or mixed
        params.append('q', title);
      }

      const url = `${this.baseUrl}/search.json?${params.toString()}`;
      console.log('Open Library search URL:', url);
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Open Library API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenLibrarySearchResponse = await response.json();
      console.log(`Open Library found ${data.numFound} total results, returning ${data.docs.length}`);
      
      const results = data.docs.map(doc => ({
        key: doc.key,
        title: doc.title,
        authors: doc.authors?.map(name => ({ name, key: '' })) || [],
        isbn: doc.isbn,
        covers: doc.covers ? [doc.covers] : undefined,
        first_publish_year: doc.first_publish_year,
        number_of_pages: doc.number_of_pages,
        subjects: doc.subjects
      }));

      // Store in cache for 1 hour
      localStorage.setItem(cacheKey, JSON.stringify(results));
      setTimeout(() => localStorage.removeItem(cacheKey), 60 * 60 * 1000);
      
      return results;
    } catch (error) {
      console.error('Error searching Open Library:', error);
      return [];
    }
  }

  /**
   * Get the best available cover image for a book
   * @param isbn - Book ISBN
   * @param title - Book title
   * @param author - Book author
   * @returns High-resolution cover URL or null
   */
  async getBestCoverImage(isbn?: string, title?: string, author?: string): Promise<string | null> {
    // Check cache first
    const cacheKey = `best:${isbn || ''}:${title || ''}:${author || ''}`;
    if (this.coverCache.has(cacheKey)) {
      return this.coverCache.get(cacheKey)!;
    }

    // Try ISBN first if available
    if (isbn) {
      const coverByISBN = await this.getCoverByISBN(isbn, 'L');
      if (coverByISBN) {
        this.coverCache.set(cacheKey, coverByISBN);
        return coverByISBN;
      }
      
      // Try medium size if large not available
      const mediumCover = await this.getCoverByISBN(isbn, 'M');
      if (mediumCover) {
        this.coverCache.set(cacheKey, mediumCover);
        return mediumCover;
      }
    }

    // If ISBN doesn't work, try searching by title and author
    if (title) {
      const searchResults = await this.searchBooks(title, author, 5);
      
      for (const book of searchResults) {
        // Try to get cover by cover ID if available
        if (book.covers && book.covers.length > 0) {
          const coverId = book.covers[0];
          const coverUrl = `${this.coversUrl}/id/${coverId}-L.jpg`;
          
          try {
            const response = await fetch(coverUrl, { method: 'HEAD' });
            if (response.ok) {
              this.coverCache.set(cacheKey, coverUrl);
              return coverUrl;
            }
          } catch (error) {
            console.error('Error checking cover by ID:', error);
          }
        }

        // Try ISBN from search results
        if (book.isbn && book.isbn.length > 0) {
          for (const bookIsbn of book.isbn) {
            const coverByISBN = await this.getCoverByISBN(bookIsbn, 'L');
            if (coverByISBN) {
              this.coverCache.set(cacheKey, coverByISBN);
              return coverByISBN;
            }
          }
        }

        // Try OLID if available
        if (book.key) {
          const olid = book.key.replace('/works/', '').replace('/books/', '');
          const coverByOLID = await this.getCoverByOLID(olid, 'L');
          if (coverByOLID) {
            this.coverCache.set(cacheKey, coverByOLID);
            return coverByOLID;
          }
        }
      }
    }

    return null;
  }

  /**
   * Get multiple cover size options for a book
   * @param isbn - Book ISBN
   * @param title - Book title
   * @param author - Book author
   * @returns Object with different size cover URLs
   */
  async getCoverSizes(isbn?: string, title?: string, author?: string): Promise<{
    large?: string;
    medium?: string;
    small?: string;
  }> {
    const covers: { large?: string; medium?: string; small?: string } = {};

    if (isbn) {
      // Try all sizes for ISBN
      covers.large = await this.getCoverByISBN(isbn, 'L') || undefined;
      covers.medium = await this.getCoverByISBN(isbn, 'M') || undefined;
      covers.small = await this.getCoverByISBN(isbn, 'S') || undefined;
    }

    // If we don't have all sizes, try searching
    if (!covers.large && title) {
      const searchResults = await this.searchBooks(title, author, 3);
      
      for (const book of searchResults) {
        if (book.covers && book.covers.length > 0) {
          const coverId = book.covers[0];
          
          if (!covers.large) {
            const largeUrl = `${this.coversUrl}/id/${coverId}-L.jpg`;
            try {
              const response = await fetch(largeUrl, { method: 'HEAD' });
              if (response.ok) covers.large = largeUrl;
            } catch (error) {
              console.error('Error checking large cover:', error);
            }
          }
          
          if (!covers.medium) {
            const mediumUrl = `${this.coversUrl}/id/${coverId}-M.jpg`;
            try {
              const response = await fetch(mediumUrl, { method: 'HEAD' });
              if (response.ok) covers.medium = mediumUrl;
            } catch (error) {
              console.error('Error checking medium cover:', error);
            }
          }
          
          if (!covers.small) {
            const smallUrl = `${this.coversUrl}/id/${coverId}-S.jpg`;
            try {
              const response = await fetch(smallUrl, { method: 'HEAD' });
              if (response.ok) covers.small = smallUrl;
            } catch (error) {
              console.error('Error checking small cover:', error);
            }
          }
          
          break; // Use first result with covers
        }
      }
    }

    return covers;
  }

  /**
   * Validate if a cover URL is accessible
   * @param url - Cover image URL
   * @returns Boolean indicating if the cover is accessible
   */
  async validateCoverUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear the cover image cache
   */
  clearCache(): void {
    this.coverCache.clear();
    // Also clear localStorage cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('search:')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const openLibraryService = new OpenLibraryService();