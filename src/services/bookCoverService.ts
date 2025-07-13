import { googleBooksService } from './googleBooksService';
import { openLibraryService } from './openLibraryService';

// In-memory cache for book covers
const coverCache = new Map<string, string>();

// Simple validation for image URLs
const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    // Use HEAD request to check for valid image without downloading it
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    // no-cors will result in an opaque response, but it's enough to know the URL is likely valid
    return response.type === 'opaque' || (response.ok && response.headers.get('Content-Type')?.startsWith('image/'));
  } catch (error) {
    console.warn(`Image URL validation failed for ${url}:`, error);
    return false;
  }
};

const getCoverByIsbn = async (isbn: string): Promise<string | null> => {
  const cacheKey = `isbn-${isbn}`;
  if (coverCache.has(cacheKey)) {
    return coverCache.get(cacheKey)!;
  }

  try {
    const googleBook = await googleBooksService.getBookByISBN(isbn);
    if (googleBook?.imageLinks) {
      const coverUrl = googleBook.imageLinks.large || googleBook.imageLinks.medium || googleBook.imageLinks.small || googleBook.imageLinks.thumbnail;
      if (await validateImageUrl(coverUrl)) {
        coverCache.set(cacheKey, coverUrl);
        return coverUrl;
      }
    }
  } catch (error) {
    console.warn(`Failed to get cover by ISBN from Google Books for ${isbn}:`, error);
  }

  return null;
};

const getCoverByTitleAuthor = async (title: string, author: string): Promise<string | null> => {
  const cacheKey = `title-${title}-${author}`;
  if (coverCache.has(cacheKey)) {
    return coverCache.get(cacheKey)!;
  }

  try {
    const searchResults = await googleBooksService.searchBooks(`${title} ${author}`, 1);
    if (searchResults.length > 0 && searchResults[0].imageLinks) {
      const coverUrl = searchResults[0].imageLinks.large || searchResults[0].imageLinks.medium || searchResults[0].imageLinks.small || searchResults[0].imageLinks.thumbnail;
      if (await validateImageUrl(coverUrl)) {
        coverCache.set(cacheKey, coverUrl);
        return coverUrl;
      }
    }
  } catch (error) {
    console.warn(`Failed to get cover by title/author from Google Books for ${title}:`, error);
  }

  return null;
};

const getCoverFromOpenLibrary = async (isbn: string | undefined, title: string, author: string): Promise<string | null> => {
  const cacheKey = `ol-${isbn || title}`;
  if (coverCache.has(cacheKey)) {
    return coverCache.get(cacheKey)!;
  }

  try {
    const coverUrl = await openLibraryService.getBestCoverImage(isbn, title, author);
    if (coverUrl && await validateImageUrl(coverUrl)) {
      coverCache.set(cacheKey, coverUrl);
      return coverUrl;
    }
  } catch (error) {
    console.warn(`Failed to get cover from Open Library for ${title}:`, error);
  }

  return null;
};

export const bookCoverService = {
  async getCover(book: { isbn?: string; title: string; author: string }): Promise<string | null> {
    if (book.isbn) {
      const cover = await getCoverByIsbn(book.isbn);
      if (cover) return cover;
    }

    const cover = await getCoverByTitleAuthor(book.title, book.author);
    if (cover) return cover;

    const openLibraryCover = await getCoverFromOpenLibrary(book.isbn, book.title, book.author);
    if (openLibraryCover) return openLibraryCover;

    return null;
  },
};
