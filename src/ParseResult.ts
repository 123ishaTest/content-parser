import { ContentError } from '@/ContentError.ts';

export interface ParseResult<T> {
  success: boolean;

  content: T;

  errors: ContentError[];
}
