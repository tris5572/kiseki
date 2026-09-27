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
  const [zoom, setZoom] = useState(initialZoom);
  const routeGeoJson = useMemo(
    () => pickRouteGeoJsonForZoom(props.routeLodSet, zoom),
    [props.routeLodSet, zoom],
  );

  /**
   * 表示中ズームを更新する
   */
  function handleMove(event: ViewStateChangeEvent) {
    setZoom(event.viewState.zoom);
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
      onMove={handleMove}
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
