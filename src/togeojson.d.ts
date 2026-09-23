// どうやら型定義がなさそうなので自前で定義

declare module "@mapbox/togeojson" {
  import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

  /**
   * GPXドキュメントをGeoJSONに変換する
   */
  export function gpx(doc: Document): FeatureCollection<Geometry, GeoJsonProperties>;

  /**
   * KMLドキュメントをGeoJSONに変換する
   */
  export function kml(doc: Document): FeatureCollection<Geometry, GeoJsonProperties>;
}
