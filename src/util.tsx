import * as toGeoJSON from "@mapbox/togeojson";
import type { Feature, GeoJsonProperties, Geometry, LineString, MultiLineString } from "geojson";
import type { RouteGeoJson } from "./types";

/**
 * GPXファイルかどうかを判定する
 */
export function isGpxFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith(".gpx") || file.type === "application/gpx+xml";
}

/**
 * ジオメトリがラインかどうかを判定する
 */
export function isLineGeometry(
  geometry: Geometry | null,
): geometry is LineString | MultiLineString {
  return geometry?.type === "LineString" || geometry?.type === "MultiLineString";
}

/**
 * GPXファイルをGeoJSONのラインデータへ変換する
 */
export async function convertGpxFileToGeoJson(file: File): Promise<RouteGeoJson | null> {
  try {
    const xmlText = await file.text();
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");

    if (doc.querySelector("parsererror")) {
      return null;
    }

    const collection = toGeoJSON.gpx(doc);
    const lineFeatures = collection.features.filter(
      (feature): feature is Feature<LineString | MultiLineString, GeoJsonProperties> =>
        isLineGeometry(feature.geometry),
    );

    if (lineFeatures.length === 0) {
      return null;
    }

    return {
      type: "FeatureCollection",
      features: lineFeatures,
    };
  } catch {
    return null;
  }
}

/**
 * 複数のGeoJSONを1つにマージする
 */
export function mergeRouteCollections(
  collections: Array<RouteGeoJson | null>,
): RouteGeoJson | null {
  const features = collections
    .filter((collection): collection is RouteGeoJson => collection !== null)
    .flatMap((collection) => collection.features);

  if (features.length === 0) {
    return null;
  }

  return {
    type: "FeatureCollection",
    features,
  };
}
