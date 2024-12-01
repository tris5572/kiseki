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

/**
 * 地図のズームレベルから、間引くためのしきい値[m] を計算する。
 */
export function thresholdFromZoom(zoom: number): number {
  if (zoom < 1) {
    return 10000;
  } else if (zoom < 3) {
    return 5000;
  } else if (zoom < 4) {
    return 1000;
  } else if (zoom < 5) {
    return 500;
  } else if (zoom < 6) {
    return 200;
  } else if (zoom < 7) {
    return 150;
  } else if (zoom < 8) {
    return 100;
  } else if (zoom < 9) {
    return 80;
  } else if (zoom < 10) {
    return 60;
  } else if (zoom < 12) {
    return 40;
  } else if (zoom < 14) {
    return 20;
  }

  return 10;
}
