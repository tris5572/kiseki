import * as toGeoJSON from "@mapbox/togeojson";
import type { Feature, GeoJsonProperties, Geometry, LineString, MultiLineString } from "geojson";
import type { RouteGeoJson, RouteGeoJsonLevel, RouteGeoJsonLodSet, RoutePosition } from "./types";

/**
 * ズームレベルごとに使用する簡略化設定
 *
 * ズームレベルごとに、間引きを行う際の許容誤差(メートル)と、1本あたりの最大座標数を定義する
 */
const ROUTE_SIMPLIFICATION_LEVELS: ReadonlyArray<{
  minZoom: number;
  toleranceMeters: number;
  maxCoordinatesPerLine: number;
}> = [
  { minZoom: 0, toleranceMeters: 2000, maxCoordinatesPerLine: 1200 },
  { minZoom: 4, toleranceMeters: 500, maxCoordinatesPerLine: 1800 },
  { minZoom: 6, toleranceMeters: 200, maxCoordinatesPerLine: 2400 },
  { minZoom: 8, toleranceMeters: 100, maxCoordinatesPerLine: 3200 },
  { minZoom: 9, toleranceMeters: 40, maxCoordinatesPerLine: 4500 },
  { minZoom: 11, toleranceMeters: 20, maxCoordinatesPerLine: 6000 },
  { minZoom: 13, toleranceMeters: 10, maxCoordinatesPerLine: 8000 },
  { minZoom: 15, toleranceMeters: 4, maxCoordinatesPerLine: 10000 },
];

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
 * ルートGeoJSONから表示倍率ごとの簡略化データを生成する
 */
export function buildRouteGeoJsonLodSet(routeGeoJson: RouteGeoJson): RouteGeoJsonLodSet {
  const levels = ROUTE_SIMPLIFICATION_LEVELS.map<RouteGeoJsonLevel>((level) => ({
    minZoom: level.minZoom,
    routeGeoJson:
      level.toleranceMeters <= 0
        ? routeGeoJson
        : simplifyRouteGeoJson(routeGeoJson, level.toleranceMeters, level.maxCoordinatesPerLine),
  }));

  return {
    original: routeGeoJson,
    levels,
  };
}

/**
 * 現在のズームに対応するGeoJSONを返す
 */
export function pickRouteGeoJsonForZoom(
  lodSet: RouteGeoJsonLodSet | null,
  zoom: number,
): RouteGeoJson | null {
  if (lodSet === null) {
    return null;
  }

  let current = lodSet.levels[0]?.routeGeoJson ?? lodSet.original;
  for (const level of lodSet.levels) {
    if (zoom < level.minZoom) {
      break;
    }
    current = level.routeGeoJson;
  }

  return current;
}

/**
 * 複数のLODセットを1つにマージする
 */
export function mergeRouteLodSets(
  collections: Array<RouteGeoJsonLodSet | null>,
): RouteGeoJsonLodSet | null {
  const validCollections = collections.filter(
    (collection): collection is RouteGeoJsonLodSet => collection !== null,
  );

  if (validCollections.length === 0) {
    return null;
  }

  const original = mergeRouteCollections(validCollections.map((collection) => collection.original));
  if (original === null) {
    return null;
  }

  const levels = ROUTE_SIMPLIFICATION_LEVELS.map<RouteGeoJsonLevel>((level, index) => ({
    minZoom: level.minZoom,
    routeGeoJson:
      mergeRouteCollections(
        validCollections.map(
          (collection) => collection.levels[index]?.routeGeoJson ?? collection.original,
        ),
      ) ?? original,
  }));

  return {
    original,
    levels,
  };
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

/**
 * GeoJSON内の各ラインを簡略化する
 */
function simplifyRouteGeoJson(
  routeGeoJson: RouteGeoJson,
  toleranceMeters: number,
  maxCoordinatesPerLine: number,
): RouteGeoJson {
  return {
    type: "FeatureCollection",
    features: routeGeoJson.features.map((feature) => {
      if (feature.geometry.type === "LineString") {
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: simplifyLineString(
              feature.geometry.coordinates,
              toleranceMeters,
              maxCoordinatesPerLine,
            ),
          },
        };
      }

      return {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: feature.geometry.coordinates.map((line) =>
            simplifyLineString(line, toleranceMeters, maxCoordinatesPerLine),
          ),
        },
      };
    }),
  };
}

/**
 * 1本のライン座標をDouglas-Peucker法で簡略化する
 */
function simplifyLineString(
  coordinates: ReadonlyArray<RoutePosition>,
  toleranceMeters: number,
  maxCoordinatesPerLine: number,
): RoutePosition[] {
  if (coordinates.length <= 2) {
    return [...coordinates];
  }

  const points = coordinates.map(projectCoordinateToMeters);
  const keepFlags = new Array<boolean>(coordinates.length).fill(false);
  keepFlags[0] = true;
  keepFlags[coordinates.length - 1] = true;

  simplifyLineSection(points, keepFlags, 0, coordinates.length - 1, toleranceMeters);

  const simplified = coordinates.filter((_, index) => keepFlags[index]);
  const minimumLine =
    simplified.length >= 2
      ? simplified
      : [coordinates[0] as RoutePosition, coordinates[coordinates.length - 1] as RoutePosition];

  return capLineCoordinateCount(minimumLine, maxCoordinatesPerLine);
}

/**
 * 描画負荷を抑えるため、異常に密なラインには頂点数の上限をかける
 */
function capLineCoordinateCount(
  coordinates: ReadonlyArray<RoutePosition>,
  maxCoordinatesPerLine: number,
): RoutePosition[] {
  if (coordinates.length <= maxCoordinatesPerLine) {
    return [...coordinates];
  }

  const stride = Math.ceil((coordinates.length - 1) / (maxCoordinatesPerLine - 1));
  const reduced: RoutePosition[] = [];

  for (let index = 0; index < coordinates.length; index += stride) {
    reduced.push(coordinates[index] as RoutePosition);
  }

  const lastCoordinate = coordinates[coordinates.length - 1] as RoutePosition;
  const currentLastCoordinate = reduced[reduced.length - 1];
  if (currentLastCoordinate !== lastCoordinate) {
    reduced.push(lastCoordinate);
  }

  return reduced;
}

/**
 * 再帰的に保持すべき点を判定する
 */
function simplifyLineSection(
  points: ReadonlyArray<{ x: number; y: number }>,
  keepFlags: boolean[],
  startIndex: number,
  endIndex: number,
  toleranceMeters: number,
): void {
  if (endIndex - startIndex <= 1) {
    return;
  }

  let maxDistance = 0;
  let targetIndex = -1;

  for (let index = startIndex + 1; index < endIndex; index += 1) {
    const distance = perpendicularDistanceToSegment(
      points[index]!,
      points[startIndex]!,
      points[endIndex]!,
    );

    if (distance > maxDistance) {
      maxDistance = distance;
      targetIndex = index;
    }
  }

  if (targetIndex === -1 || maxDistance < toleranceMeters) {
    return;
  }

  keepFlags[targetIndex] = true;
  simplifyLineSection(points, keepFlags, startIndex, targetIndex, toleranceMeters);
  simplifyLineSection(points, keepFlags, targetIndex, endIndex, toleranceMeters);
}

/**
 * 緯度経度を簡易的なメートル座標へ投影する
 */
function projectCoordinateToMeters([longitude, latitude]: RoutePosition): { x: number; y: number } {
  const earthRadius = 6378137;
  const longitudeRadians = (longitude * Math.PI) / 180;
  const latitudeRadians = (latitude * Math.PI) / 180;

  return {
    x: earthRadius * longitudeRadians * Math.cos(latitudeRadians),
    y: earthRadius * latitudeRadians,
  };
}

/**
 * 線分に対する点の垂直距離をメートル単位で返す
 */
function perpendicularDistanceToSegment(
  point: { x: number; y: number },
  start: { x: number; y: number },
  end: { x: number; y: number },
): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)),
  );
  const closestX = start.x + dx * t;
  const closestY = start.y + dy * t;

  return Math.hypot(point.x - closestX, point.y - closestY);
}
