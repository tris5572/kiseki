import {
  GeolocateControl,
  Layer,
  NavigationControl,
  ScaleControl,
  Source,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { useMemo, useState } from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { RouteGeoJsonLodSet } from "./types";
import { pickRouteGeoJsonForZoom } from "./util";

type Props = {
  /**
   * 描画対象のルートLODデータ
   */
  routeLodSet: RouteGeoJsonLodSet | null;
};

const initialZoom = 7;

/**
 * 描画用のズームレベルを離散化する
 */
function normalizeRouteZoom(zoom: number): number {
  return Math.max(0, Math.floor(zoom));
}

const routeLineStyle = {
  id: "gpx-route-line",
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

export function MapView(props: Props) {
  const [routeZoom, setRouteZoom] = useState(() => normalizeRouteZoom(initialZoom));
  const routeGeoJson = useMemo(
    () => pickRouteGeoJsonForZoom(props.routeLodSet, routeZoom),
    [props.routeLodSet, routeZoom],
  );

  /**
   * ズーム操作の完了時にだけ描画用ズームレベルを更新する
   */
  function handleZoomEnd(event: ViewStateChangeEvent) {
    const nextZoom = normalizeRouteZoom(event.viewState.zoom);
    setRouteZoom((currentZoom) => (currentZoom === nextZoom ? currentZoom : nextZoom));
  }

  return (
    <Map
      workerUrl={maplibreWorkerUrl}
      initialViewState={{
        longitude: 137.48,
        latitude: 36,
        zoom: initialZoom,
      }}
      style={{ width: "100dvw", height: "100dvh" }}
      mapStyle="https://tris5572.github.io/map-style/dark/style.json"
      onZoomEnd={handleZoomEnd}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl />
      <ScaleControl />
      {routeGeoJson !== null ? (
        <Source id="gpx-route-source" type="geojson" data={routeGeoJson}>
          <Layer {...routeLineStyle} />
        </Source>
      ) : null}
    </Map>
  );
}
