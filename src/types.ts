import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  LineString,
  MultiLineString,
  Position,
} from "geojson";

/**
 * GeoJSONの座標値
 */
export type RouteCoordinate = [longitude: number, latitude: number, elevation?: number];

/**
 * GeoJSON互換の座標値
 */
export type RoutePosition = Position;

/**
 * GPX由来の線情報を保持するGeoJSON型
 */
export type RouteGeoJson = FeatureCollection<LineString | MultiLineString, GeoJsonProperties>;

/**
 * GPX由来の線フィーチャー型
 */
export type RouteLineFeature = Feature<LineString | MultiLineString, GeoJsonProperties>;

/**
 * 表示倍率ごとに保持するトラックデータ
 */
export type RouteGeoJsonLevel = {
  /**
   * このレベルを使い始める最小ズーム
   */
  minZoom: number;
  /**
   * このレベルで描画するGeoJSON
   */
  routeGeoJson: RouteGeoJson;
};

/**
 * 元データと段階的に間引いたトラック群
 */
export type RouteGeoJsonLodSet = {
  /**
   * 元のGeoJSON
   */
  original: RouteGeoJson;
  /**
   * 表示倍率ごとのGeoJSON一覧
   */
  levels: RouteGeoJsonLevel[];
};

/**
 * ルート線の描画スタイル
 */
export type RouteStyle = {
  /**
   * 線の赤成分
   */
  red: number;
  /**
   * 線の緑成分
   */
  green: number;
  /**
   * 線の青成分
   */
  blue: number;
  /**
   * 線の不透明度
   */
  opacity: number;
  /**
   * 線の太さ
   */
  width: number;
};

/**
 * 1本のルートとその描画スタイル
 */
export type RouteEntry = {
  /**
   * ルートごとの識別子
   */
  id: string;
  /**
   * ルートのLODデータ
   */
  lodSet: RouteGeoJsonLodSet;
  /**
   * このルートに適用する描画スタイル
   */
  style: RouteStyle;
};

/**
 * スタイル変更の適用対象
 */
export type RouteStyleApplyMode = "all" | "future";

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
