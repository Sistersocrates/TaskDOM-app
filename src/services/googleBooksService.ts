import { openLibraryService } from './openLibraryService';

export interface GoogleBook {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
  industryIdentifiers?: {
    type: string;
    identifier: string;
  }[];
  language?: string;
  averageRating?: number;
  ratingsCount?: number;
}

interface GoogleBooksResponse {
  totalItems: number;
  items: {
    id: string;
    volumeInfo: GoogleBook;
  }[];
}

class GoogleBooksService {
  private baseUrl = 'https://www.googleapis.com/books/v1/volumes';
  private apiKey: string;
  private isApiKeyValid: boolean | null = null;
  private coverCache: Map<string, string> = new Map(); // Cache for cover images

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';
  }

  private buildUrl(endpoint: string, params: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add API key if available
    if (this.apiKey) {
      params.key = this.apiKey;
    }
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    return url.toString();
  }

  private async checkApiKeyValidity(): Promise<boolean> {
    if (this.isApiKeyValid !== null) {
      return this.isApiKeyValid;
    }

    if (!this.apiKey) {
      this.isApiKeyValid = false;
      return false;
    }

    try {
      const params = { q: 'test', maxResults: '1', key: this.apiKey };
      const url = this.buildUrl('', params);
      const response = await fetch(url);
      
      this.isApiKeyValid = response.ok;
      return this.isApiKeyValid;
    } catch (error) {
      console.warn('Google Books API key validation failed:', error);
      this.isApiKeyValid = false;
      return false;
    }
  }

  private async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('Image validation failed:', error);
      return false;
    }
  }

  private async getPreferredImageUrl(
    imageLinks?: GoogleBook['imageLinks'], 
    isbn?: string, 
    title?: string, 
    author?: string
  ): Promise<string> {
    // Check cache first
    const cacheKey = `${isbn || ''}:${title || ''}:${author || ''}`;
    if (this.coverCache.has(cacheKey)) {
      return this.coverCache.get(cacheKey)!;
    }

    // First, try Google Books images in order of preference
    if (imageLinks) {
      const googleImages = [
        imageLinks.extraLarge,
        imageLinks.large,
        imageLinks.medium,
        imageLinks.small,
        imageLinks.thumbnail
      ].filter(Boolean);

      // Validate the first available Google Books image
      for (const imageUrl of googleImages) {
        if (imageUrl) {
          try {
            const isValid = await this.validateImageUrl(imageUrl);
            if (isValid) {
              // Store in cache
              this.coverCache.set(cacheKey, imageUrl);
              return imageUrl;
            }
          } catch (error) {
            console.log('Google Books image not accessible:', imageUrl);
          }
        }
      }
    }

    // If Google Books images fail, try Open Library as fallback
    console.log('Trying Open Library fallback for:', { title, author, isbn });
    
    try {
      const openLibraryCover = await openLibraryService.getBestCoverImage(isbn, title, author);
      if (openLibraryCover) {
        console.log('Found Open Library cover:', openLibraryCover);
        // Store in cache
        this.coverCache.set(cacheKey, openLibraryCover);
        return openLibraryCover;
      }
    } catch (error) {
      console.error('Error fetching from Open Library:', error);
    }

    // Ultimate fallback to curated Pexels image
    const fallbackUrl = 'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg';
    this.coverCache.set(cacheKey, fallbackUrl);
    return fallbackUrl;
  }

  private getISBN(identifiers?: GoogleBook['industryIdentifiers']): string {
    if (!identifiers) return '';
    
    // Prefer ISBN_13, fallback to ISBN_10
    const isbn13 = identifiers.find(id => id.type === 'ISBN_13');
    const isbn10 = identifiers.find(id => id.type === 'ISBN_10');
    
    return isbn13?.identifier || isbn10?.identifier || '';
  }

  async searchBooks(query: string, maxResults: number = 20): Promise<GoogleBook[]> {
    try {
      // Try Google Books first if API key is available
      const isValidKey = await this.checkApiKeyValidity();
      
      if (isValidKey) {
        const params = {
          q: query,
          maxResults: maxResults.toString(),
          printType: 'books',
          orderBy: 'relevance'
        };

        const url = this.buildUrl('', params);
        const response = await fetch(url);

        if (response.ok) {
          const data: GoogleBooksResponse = await response.json();

          if (data.items) {
            // Process books with enhanced cover image fallback
            const processedBooks = await Promise.all(
              data.items.map(async (item) => {
                const isbn = this.getISBN(item.volumeInfo.industryIdentifiers);
                const author = item.volumeInfo.authors?.join(', ');
                
                const preferredImage = await this.getPreferredImageUrl(
                  item.volumeInfo.imageLinks,
                  isbn,
                  item.volumeInfo.title,
                  author
                );

                return {
                  ...item.volumeInfo,
                  id: item.id,
                  imageLinks: {
                    ...item.volumeInfo.imageLinks,
                    thumbnail: preferredImage,
                    small: preferredImage,
                    medium: preferredImage,
                    large: preferredImage
                  }
                };
              })
            );

            return processedBooks;
          }
        }
      }

      // Fallback to Open Library search if Google Books fails or no API key
      console.log('Falling back to Open Library search for:', query);
      return await this.searchBooksViaOpenLibrary(query, maxResults);

    } catch (error) {
      console.error('Error searching books:', error);
      // Try Open Library as final fallback
      try {
        return await this.searchBooksViaOpenLibrary(query, maxResults);
      } catch (fallbackError) {
        console.error('Open Library fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  // New method to search via Open Library and convert to Google Books format
  private async searchBooksViaOpenLibrary(query: string, maxResults: number = 20): Promise<GoogleBook[]> {
    try {
      // Parse query to extract title and author if possible
      const queryParts = query.toLowerCase().split(' ');
      const authorKeywords = ['by', 'author:', 'inauthor:'];
      
      let title = query;
      let author = '';
      
      // Check if query contains author information
      for (const keyword of authorKeywords) {
        if (query.toLowerCase().includes(keyword)) {
          const parts = query.split(new RegExp(keyword, 'i'));
          if (parts.length === 2) {
            title = parts[0].trim();
            author = parts[1].trim().replace(/['"]/g, '');
          }
        }
      }

      // Search Open Library
      const openLibraryBooks = await openLibraryService.searchBooks(title, author, maxResults);
      
      // Convert Open Library books to Google Books format
      const convertedBooks = await Promise.all(
        openLibraryBooks.map(async (olBook, index) => {
          const isbn = olBook.isbn?.[0] || '';
          const bookAuthors = olBook.authors?.map(a => a.name) || ['Unknown Author'];
          const bookTitle = olBook.title || 'Unknown Title';
          
          // Get cover image from Open Library
          const coverUrl = await openLibraryService.getBestCoverImage(isbn, bookTitle, bookAuthors.join(', '));
          
          // Create a Google Books compatible object
          const googleBook: GoogleBook = {
            id: olBook.key || `ol_${index}_${Date.now()}`,
            title: bookTitle,
            authors: bookAuthors,
            description: typeof olBook.description === 'string' ? olBook.description : olBook.description?.value,
            publishedDate: olBook.first_publish_year?.toString(),
            pageCount: olBook.number_of_pages,
            categories: olBook.subjects?.slice(0, 5) || [],
            imageLinks: coverUrl ? {
              thumbnail: coverUrl,
              small: coverUrl,
              medium: coverUrl,
              large: coverUrl
            } : undefined,
            industryIdentifiers: isbn ? [{
              type: isbn.length === 13 ? 'ISBN_13' : 'ISBN_10',
              identifier: isbn
            }] : undefined,
            language: 'en'
          };

          return googleBook;
        })
      );

      console.log(`Found ${convertedBooks.length} books from Open Library for query: ${query}`);
      return convertedBooks;

    } catch (error) {
      console.error('Error searching Open Library:', error);
      return [];
    }
  }

  async getBookByISBN(isbn: string): Promise<GoogleBook | null> {
    try {
      // Check cache first
      const cacheKey = `isbn:${isbn}`;
      if (this.coverCache.has(cacheKey)) {
        const cachedBook = JSON.parse(localStorage.getItem(`book_${isbn}`) || 'null');
        if (cachedBook) {
          return cachedBook;
        }
      }

      // Check if API key is valid before making requests
      const isValidKey = await this.checkApiKeyValidity();
      if (!isValidKey) {
        console.warn('Google Books API key is missing or invalid. Cannot fetch book by ISBN.');
        return null;
      }

      // Clean ISBN (remove hyphens and spaces)
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      
      const params = {
        q: `isbn:${cleanISBN}`,
        maxResults: '1'
      };

      const url = this.buildUrl('', params);
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 400 || response.status === 403) {
          console.warn('Google Books API request failed with status:', response.status, 'Likely API key issue');
          this.isApiKeyValid = false;
          return null;
        }
        throw new Error(`Google Books API error: ${response.status} ${response.statusText}`);
      }

      const data: GoogleBooksResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const item = data.items[0];
      const author = item.volumeInfo.authors?.join(', ');
      
      const preferredImage = await this.getPreferredImageUrl(
        item.volumeInfo.imageLinks,
        cleanISBN,
        item.volumeInfo.title,
        author
      );

      const processedBook = {
        ...item.volumeInfo,
        id: item.id,
        imageLinks: {
          ...item.volumeInfo.imageLinks,
          thumbnail: preferredImage,
          small: preferredImage,
          medium: preferredImage,
          large: preferredImage
        }
      };

      // Cache the book data
      localStorage.setItem(`book_${isbn}`, JSON.stringify(processedBook));
      this.coverCache.set(cacheKey, preferredImage);

      return processedBook;
    } catch (error) {
      console.error('Error fetching book by ISBN:', error);
      // Return null instead of throwing to prevent UI breaks
      return null;
    }
  }

  async getBookById(bookId: string): Promise<GoogleBook | null> {
    try {
      // Check cache first
      const cacheKey = `id:${bookId}`;
      if (this.coverCache.has(cacheKey)) {
        const cachedBook = JSON.parse(localStorage.getItem(`book_id_${bookId}`) || 'null');
        if (cachedBook) {
          return cachedBook;
        }
      }

      // Check if API key is valid before making requests
      const isValidKey = await this.checkApiKeyValidity();
      if (!isValidKey) {
        console.warn('Google Books API key is missing or invalid. Cannot fetch book by ID.');
        return null;
      }

      const params: Record<string, string> = {};
      
      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const url = this.buildUrl(`/${bookId}`, params);
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        if (response.status === 400 || response.status === 403) {
          console.warn('Google Books API request failed with status:', response.status, 'Likely API key issue');
          this.isApiKeyValid = false;
          return null;
        }
        throw new Error(`Google Books API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const isbn = this.getISBN(data.volumeInfo.industryIdentifiers);
      const author = data.volumeInfo.authors?.join(', ');
      
      const preferredImage = await this.getPreferredImageUrl(
        data.volumeInfo.imageLinks,
        isbn,
        data.volumeInfo.title,
        author
      );
      
      const processedBook = {
        ...data.volumeInfo,
        id: data.id,
        imageLinks: {
          ...data.volumeInfo.imageLinks,
          thumbnail: preferredImage,
          small: preferredImage,
          medium: preferredImage,
          large: preferredImage
        }
      };

      // Cache the book data
      localStorage.setItem(`book_id_${bookId}`, JSON.stringify(processedBook));
      this.coverCache.set(cacheKey, preferredImage);

      return processedBook;
    } catch (error) {
      console.error('Error fetching book by ID:', error);
      // Return null instead of throwing to prevent UI breaks
      return null;
    }
  }

  // Convert GoogleBook to our internal Book format
  convertToInternalBook(googleBook: GoogleBook): any {
    return {
      id: googleBook.id,
      title: googleBook.title,
      author: googleBook.authors?.join(', ') || 'Unknown Author',
      coverImage: googleBook.imageLinks?.thumbnail || 'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg',
      totalPages: googleBook.pageCount || 0,
      currentPage: 0,
      spiceRating: 0, // User will need to set this
      tropes: googleBook.categories || [],
      status: 'wantToRead' as const,
      spicyScenes: [],
      description: googleBook.description,
      publishedDate: googleBook.publishedDate,
      isbn: this.getISBN(googleBook.industryIdentifiers),
      language: googleBook.language,
      averageRating: googleBook.averageRating,
      ratingsCount: googleBook.ratingsCount
    };
  }

  // Search for romance/adult books specifically
  async searchRomanceBooks(query: string, maxResults: number = 20): Promise<GoogleBook[]> {
    const romanceQuery = `${query} subject:fiction subject:romance`;
    return this.searchBooks(romanceQuery, maxResults);
  }

  // Search for books by author
  async searchByAuthor(author: string, maxResults: number = 20): Promise<GoogleBook[]> {
    try {
      // Try Google Books first if API key is available
      const isValidKey = await this.checkApiKeyValidity();
      
      if (isValidKey) {
        const authorQuery = `inauthor:"${author}"`;
        const params = {
          q: authorQuery,
          maxResults: maxResults.toString(),
          printType: 'books',
          orderBy: 'relevance'
        };

        const url = this.buildUrl('', params);
        const response = await fetch(url);

        if (response.ok) {
          const data: GoogleBooksResponse = await response.json();

          if (data.items) {
            const processedBooks = await Promise.all(
              data.items.map(async (item) => {
                const isbn = this.getISBN(item.volumeInfo.industryIdentifiers);
                const bookAuthor = item.volumeInfo.authors?.join(', ');
                
                const preferredImage = await this.getPreferredImageUrl(
                  item.volumeInfo.imageLinks,
                  isbn,
                  item.volumeInfo.title,
                  bookAuthor
                );

                return {
                  ...item.volumeInfo,
                  id: item.id,
                  imageLinks: {
                    ...item.volumeInfo.imageLinks,
                    thumbnail: preferredImage,
                    small: preferredImage,
                    medium: preferredImage,
                    large: preferredImage
                  }
                };
              })
            );

            return processedBooks;
          }
        }
      }

      // Fallback to Open Library search by author
      console.log('Falling back to Open Library search for author:', author);
      return await this.searchBooksViaOpenLibrary(`author:${author}`, maxResults);

    } catch (error) {
      console.error('Error searching books by author:', error);
      // Try Open Library as final fallback
      try {
        return await this.searchBooksViaOpenLibrary(`author:${author}`, maxResults);
      } catch (fallbackError) {
        console.error('Open Library author search fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  // Get popular romance books
  async getPopularRomanceBooks(maxResults: number = 20): Promise<GoogleBook[]> {
    try {
      // Try Google Books first if API key is available
      const isValidKey = await this.checkApiKeyValidity();
      
      if (isValidKey) {
        const popularQuery = 'subject:romance subject:fiction orderBy:newest';
        const result = await this.searchBooks(popularQuery, maxResults);
        if (result.length > 0) {
          return result;
        }
      }

      // Fallback to Open Library with popular romance authors and titles
      console.log('Falling back to Open Library for popular romance books');
      const popularRomanceQueries = [
        'Colleen Hoover',
        'Sarah J. Maas',
        'Rebecca Yarros',
        'Ali Hazelwood',
        'Emily Henry',
        'romance contemporary',
        'fantasy romance'
      ];

      const allBooks: GoogleBook[] = [];
      const booksPerQuery = Math.ceil(maxResults / popularRomanceQueries.length);

      for (const query of popularRomanceQueries) {
        try {
          const books = await this.searchBooksViaOpenLibrary(query, booksPerQuery);
          allBooks.push(...books);
          if (allBooks.length >= maxResults) break;
        } catch (error) {
          console.error(`Error searching for ${query}:`, error);
        }
      }

      // Remove duplicates and limit results
      const uniqueBooks = allBooks.filter((book, index, self) => 
        index === self.findIndex(b => b.title === book.title && b.authors?.[0] === book.authors?.[0])
      );

      return uniqueBooks.slice(0, maxResults);

    } catch (error) {
      console.error('Error getting popular romance books:', error);
      return [];
    }
  }

  /**
   * Enhanced cover image fetching with multiple fallbacks
   * @param book - Book object with potential image sources
   * @returns Promise resolving to the best available cover image URL
   */
  async getEnhancedCoverImage(book: {
    imageLinks?: GoogleBook['imageLinks'];
    isbn?: string;
    title: string;
    authors?: string[];
  }): Promise<string> {
    const author = book.authors?.join(', ');
    return this.getPreferredImageUrl(book.imageLinks, book.isbn, book.title, author);
  }

  /**
   * Clear the cover image cache
   */
  clearCache(): void {
    this.coverCache.clear();
    // Also clear localStorage book cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('book_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const googleBooksService = new GoogleBooksService();