import {
  GeolocateControl,
  Layer,
  type MapRef,
  NavigationControl,
  ScaleControl,
  Source,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import type { StyleSpecification } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { RouteGeoJson, RouteGeoJsonLodSet } from "./types";
import { pickRouteGeoJsonForZoom } from "./util";

type Props = {
  /**
   * 描画対象のルートLODデータ
   */
  routeLodSet: RouteGeoJsonLodSet | null;
  /**
   * 表示する地図スタイルのURL
   */
  mapStyleUrl: string;
};

const initialZoom = 7;
const routeSourceId = "gpx-route-source";
const routeLayerId = "gpx-route-line";

/**
 * 描画用のズームレベルを離散化する
 */
function normalizeRouteZoom(zoom: number): number {
  return Math.max(0, Math.floor(zoom));
}

const routeLineStyle = {
  id: routeLayerId,
  type: "line",
  paint: {
    "line-color": "#ff2d2d",
    "line-width": 2,
    "line-opacity": 0.8,
  },
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
} as const;

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
      {
        ...routeLineStyle,
        source: routeSourceId,
      },
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
  const routeGeoJson = useMemo(
    () => pickRouteGeoJsonForZoom(props.routeLodSet, routeZoom),
    [props.routeLodSet, routeZoom],
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
          <Layer {...routeLineStyle} />
        </Source>
      ) : null}
    </Map>
  );
}
