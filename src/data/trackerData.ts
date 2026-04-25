import { BOOKS } from './mockData';

export const TOTAL_CHAPTERS = BOOKS.reduce((acc, book) => acc + book.chapters, 0);
