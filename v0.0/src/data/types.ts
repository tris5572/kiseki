/**
 * アプリケーション全体の状態を表す型
 */
export type AppState = {
  /**
   * ルートデータの配列
   */
  dataList: RouteData[];
  /**
   * ルートデータを追加する
   */
  addData: (data: RouteData) => void;
  /**
   * データを更新する
   */
  updateData: (data: RouteData[]) => void;
};

/**
 * 1つのルートのデータの型
 */
export type RouteData = {
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
   * DeckGL の色設定に合わせるために `[r, g, b]` にしている。
   */
  color: [number, number, number];
  /**
   * 総距離
   */
  distance: number;
  /**
   * 累計獲得標高
   */
  gainedAltitude: number | null;
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
