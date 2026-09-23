import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  LineString,
  MultiLineString,
} from "geojson";

/**
 * GPX由来の線情報を保持するGeoJSON型
 */
export type RouteGeoJson = FeatureCollection<LineString | MultiLineString, GeoJsonProperties>;

/**
 * GPX由来の線フィーチャー型
 */
export type RouteLineFeature = Feature<LineString | MultiLineString, GeoJsonProperties>;

/**
 * GPX読み込み処理の進捗状態
 */
export type GpxLoadingProgress = {
  /**
   * 読み込み中かどうか
   */
  isLoading: boolean;
  /**
   * 現在処理中のファイル名
   */
  currentFileName: string;
  /**
   * 現在の処理番号（1始まり）
   */
  currentIndex: number;
  /**
   * 対象ファイル総数
   */
  total: number;
  /**
   * 進捗率
   */
  percent: number;
};
