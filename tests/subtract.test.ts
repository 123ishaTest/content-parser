import { expect, test } from 'vitest';
import { subtract } from '@/subtract.ts';

test('subtracts 4 from 5 to equal 1', () => {
  expect(subtract(5, 4)).toBe(1);
});
