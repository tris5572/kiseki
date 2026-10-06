import {
  GeolocateControl,
  Layer,
  type MapRef,
  NavigationControl,
  ScaleControl,
  Source,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import type { LineLayerSpecification, StyleSpecification } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { RouteEntry, RouteGeoJson, RouteGeoJsonLodSet, RouteLineFeature } from "./types";
import { mergeRouteLodSets, pickRouteGeoJsonForZoom } from "./util";

type Props = {
  /**
   * 描画対象のルート一覧
   */
  routes: RouteEntry[];
  /**
   * 表示する地図スタイルのURL
   */
  mapStyleUrl: string;
};

const initialZoom = 7;
const routeSourceId = "gpx-route-source";
const routeLayerId = "gpx-route-line";
const routeColorProperty = "kisekiRouteColor";
const routeWidthProperty = "kisekiRouteWidth";
const routeOpacityProperty = "kisekiRouteOpacity";

/**
 * 描画用のズームレベルを離散化する
 */
function normalizeRouteZoom(zoom: number): number {
  return Math.max(0, Math.floor(zoom));
}

/**
 * 線色をMapLibre用のRGB文字列へ変換する
 */
function formatRouteColor(style: RouteEntry["style"]): string {
  return `rgb(${style.red}, ${style.green}, ${style.blue})`;
}

/**
 * 1本のフィーチャへ描画スタイル属性を埋め込む
 */
function decorateRouteFeature(feature: RouteLineFeature, route: RouteEntry): RouteLineFeature {
  return {
    ...feature,
    properties: {
      ...(feature.properties ?? {}),
      [routeColorProperty]: formatRouteColor(route.style),
      [routeWidthProperty]: route.style.width,
      [routeOpacityProperty]: route.style.opacity,
    },
  };
}

/**
 * ルートGeoJSONへ描画スタイル属性を埋め込む
 */
function decorateRouteGeoJson(routeGeoJson: RouteGeoJson, route: RouteEntry): RouteGeoJson {
  return {
    ...routeGeoJson,
    features: routeGeoJson.features.map((feature) => decorateRouteFeature(feature, route)),
  };
}

/**
 * 1本のルートLODへ描画スタイル属性を埋め込む
 */
function decorateRouteLodSet(route: RouteEntry): RouteGeoJsonLodSet {
  return {
    original: decorateRouteGeoJson(route.lodSet.original, route),
    levels: route.lodSet.levels.map((level) => ({
      ...level,
      routeGeoJson: decorateRouteGeoJson(level.routeGeoJson, route),
    })),
  };
}

/**
 * 単一レイヤー用のルート線スタイル定義を生成する
 */
function createRouteLineStyle() {
  const routeColorExpression: ["coalesce", ["get", string], string] = [
    "coalesce",
    ["get", routeColorProperty],
    "#ff2d2d",
  ];
  const routeWidthExpression: ["coalesce", ["get", string], number] = [
    "coalesce",
    ["get", routeWidthProperty],
    2,
  ];
  const routeOpacityExpression: ["coalesce", ["get", string], number] = [
    "coalesce",
    ["get", routeOpacityProperty],
    0.8,
  ];

  return {
    id: routeLayerId,
    type: "line",
    source: routeSourceId,
    paint: {
      "line-color": routeColorExpression,
      "line-width": routeWidthExpression,
      "line-opacity": routeOpacityExpression,
    },
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
  } satisfies LineLayerSpecification;
}

/**
 * ルートレイヤーを保持した次のスタイル定義を返す
 */
function createStyleWithPersistentRoute(
  nextStyle: StyleSpecification,
  routeGeoJson: RouteGeoJson | null,
): StyleSpecification {
  if (routeGeoJson === null) {
    return nextStyle;
  }

  const routeSource = {
    type: "geojson",
    data: routeGeoJson,
  } satisfies StyleSpecification["sources"][string];

  return {
    ...nextStyle,
    sources: {
      ...nextStyle.sources,
      [routeSourceId]: routeSource,
    },
    layers: [
      ...nextStyle.layers.filter((layer) => layer.id !== routeLayerId),
      createRouteLineStyle(),
    ],
  };
}

/**
 * 地図本体とGPXルートの表示を管理する
 */
export function MapView(props: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const appliedMapStyleUrlRef = useRef(props.mapStyleUrl);
  const [initialMapStyleUrl] = useState(() => props.mapStyleUrl);
  const [routeZoom, setRouteZoom] = useState(() => normalizeRouteZoom(initialZoom));
  const mergedRouteLodSet = useMemo<RouteGeoJsonLodSet | null>(
    () => mergeRouteLodSets(props.routes.map((route) => decorateRouteLodSet(route))),
    [props.routes],
  );
  const routeGeoJson = useMemo(
    () => pickRouteGeoJsonForZoom(mergedRouteLodSet, routeZoom),
    [mergedRouteLodSet, routeZoom],
  );

  /**
   * 地図スタイルの切替時も、表示中のGPXルートを次のスタイルへ引き継ぐ。
   *
   * mapStyle プロパティをそのまま差し替えると、MapLibre 側で style 全体が再構築される。
   * そのままだとアプリ側で後付けしている GPX の source と layer も一度消えるため、
   * スタイル変更時だけ setStyle を呼び、新しい style に現在のルートを差し込む。
   */
  useEffect(() => {
    // すでに反映済みの style なら、同じ setStyle を繰り返さない。
    if (appliedMapStyleUrlRef.current === props.mapStyleUrl) {
      return;
    }

    const map = mapRef.current?.getMap();
    // Map インスタンスの初期化前は style を切り替えられない。
    if (map === undefined) {
      return;
    }

    appliedMapStyleUrlRef.current = props.mapStyleUrl;
    // 次の style を読み込むときに、現在表示中の GPX ルート用 source/layer を引き継ぐ。
    map.setStyle(props.mapStyleUrl, {
      diff: true,
      transformStyle: (_previousStyle, nextStyle) =>
        createStyleWithPersistentRoute(nextStyle, routeGeoJson),
    });
  }, [props.mapStyleUrl, routeGeoJson]);

  /**
   * ズーム操作の完了時にだけ描画用ズームレベルを更新する
   */
  function handleZoomEnd(event: ViewStateChangeEvent) {
    const nextZoom = normalizeRouteZoom(event.viewState.zoom);
    setRouteZoom((currentZoom) => (currentZoom === nextZoom ? currentZoom : nextZoom));
  }

  return (
    <Map
      ref={mapRef}
      workerUrl={maplibreWorkerUrl}
      initialViewState={{
        longitude: 137.48,
        latitude: 36,
        zoom: initialZoom,
      }}
      style={{ width: "100dvw", height: "100dvh" }}
      mapStyle={initialMapStyleUrl}
      onZoomEnd={handleZoomEnd}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl />
      <ScaleControl />
      {routeGeoJson !== null ? (
        <Source id={routeSourceId} type="geojson" data={routeGeoJson}>
          <Layer {...createRouteLineStyle()} />
        </Source>
      ) : null}
    </Map>
  );
}
