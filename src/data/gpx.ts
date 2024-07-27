import { parseGPX } from '@we-gold/gpxjs';
import { GpxData } from './types';

/**
 * GPX ファイルをパースしてデータにする。パースできなかったときは `undefined` を返す。
 *
 * 現状では1ファイル1トラックを前提としている。
 *
 * @param gpx GPX ファイルから読み出した文字列
 */
export function parseGpx(input: string): GpxData | undefined {
  const [gpx, error] = parseGPX(input);
  if (error) {
    return undefined;
  }

  const data: GpxData = {
    name: '',
    coordinates: [],
    color: '',
  };

  // TODO: 名前の取得・設定

  const track = gpx.routes[0];

  data.coordinates = track.points.map((p) => ({ longitude: p.longitude, latitude: p.latitude }));

  return data;
}
