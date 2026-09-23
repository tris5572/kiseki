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
