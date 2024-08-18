import { expect, test } from 'vitest';
import { hexFromNumbers, numbersFromHex } from './utils';

test('hexFromNumbers()', () => {
  expect(hexFromNumbers([0, 0, 0])).toBe('#000000');
  expect(hexFromNumbers([12, 34, 56])).toBe('#0c2238');
  expect(hexFromNumbers([255, 255, 255])).toBe('#ffffff');
});

test('numbersFromHex', () => {
  expect(numbersFromHex('#000000')).toStrictEqual([0, 0, 0]);
  expect(numbersFromHex('#0c2238')).toStrictEqual([12, 34, 56]);
  expect(numbersFromHex('#ffffff')).toStrictEqual([255, 255, 255]);
});
