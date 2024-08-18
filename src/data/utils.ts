/**
 * RGB の配列を hex へ変換する。
 * @param numbers [r, g, b] (それぞれ 0～255)
 * @returns #rrggbb (それぞれ 00～ff)
 */
export function hexFromNumbers(numbers: [number, number, number]): string {
  const r = ('0' + numbers[0].toString(16)).slice(-2);
  const g = ('0' + numbers[1].toString(16)).slice(-2);
  const b = ('0' + numbers[2].toString(16)).slice(-2);
  return `#${r}${g}${b}`;
}

/**
 * hex を RGB の配列へ変換する。
 * @param hex #rrggbb (それぞれ 00～ff)
 * @returns [r, g, b] (それぞれ 0～255) ただし変換できなかった場合は [0, 0, 0] を返す。
 */
export function numbersFromHex(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}
