import { ContentError } from '@/ContentError.ts';

export interface ParseResult {
  success: boolean;

  errors: ContentError[];
}
