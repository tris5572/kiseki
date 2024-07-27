/**
 * 1つの GPX データの型
 */
export type GpxData = {
  /**
   * データの名前
   */
  name: string;
  /**
   * 座標のリスト
   */
  coordinates: Point[];
  /**
   * 線の色
   *
   * TODO: もっと良い型があれば変更する
   */
  color: string;
};

/**
 * 座標の型
 */
export type Point = {
  /**
   * 経度
   */
  longitude: number;
  /**
   * 緯度
   */
  latitude: number;
};
