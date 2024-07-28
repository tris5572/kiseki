import { parseGPX } from '@we-gold/gpxjs';
import { RouteData } from './types';

/**
 * GPX ファイルをパースしてデータにする。パースできなかったときは `undefined` を返す。
 *
 * 現状では1ファイル1トラックを前提としている。
 *
 * @param gpx GPX ファイルから読み出した文字列
 */
export function parseGpx(input: string): RouteData | undefined {
  const [gpx, error] = parseGPX(input);
  if (error) {
    return undefined;
  }

  const data: RouteData = {
    name: '',
    coordinates: [],
    color: '',
  };

  // TODO: 名前の取得・設定

  const track = gpx.tracks[0];
  // console.log(gpx);

  data.coordinates = track.points.map((p) => ({ longitude: p.longitude, latitude: p.latitude }));

  return data;
}
