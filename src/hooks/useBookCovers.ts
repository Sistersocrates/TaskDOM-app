import { useState, useEffect } from 'react';
import { Book } from '../types';
import { bookCoverService } from '../services/bookCoverService';

export const useBookCovers = (initialBooks: Book[]) => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const enhanceBookCovers = async () => {
      setIsLoading(true);

      try {
        const enhancedBooks = await Promise.all(
          initialBooks.map(async (book) => {
            if (book.coverImage && !book.coverImage.includes('pexels.com')) {
              // Assume if a cover image exists and is not a placeholder, it's good
              return book;
            }

            const enhancedCover = await bookCoverService.getCover(book);

            if (enhancedCover) {
              return { ...book, coverImage: enhancedCover };
            }

            return book;
          })
        );

        setBooks(enhancedBooks);
      } catch (error) {
        console.error('Error enhancing book covers:', error);
        // Return original books in case of a systemic error
        setBooks(initialBooks);
      } finally {
        setIsLoading(false);
      }
    };

    if (initialBooks.length > 0) {
      enhanceBookCovers();
    } else {
      setBooks([]);
    }
  }, [initialBooks]);

  return { books, isLoading };
};
