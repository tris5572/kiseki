import {
  GeolocateControl,
  Layer,
  NavigationControl,
  ScaleControl,
  Source,
} from "react-map-gl/maplibre";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { RouteGeoJson } from "./types";

type Props = {
  /**
   * 描画対象のルートGeoJSON
   */
  routeGeoJson: RouteGeoJson | null;
};

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
  return (
    <Map
      workerUrl={maplibreWorkerUrl}
      initialViewState={{
        longitude: 137.48,
        latitude: 36,
        zoom: 7,
      }}
      style={{ width: "100dvw", height: "100dvh" }}
      mapStyle="https://tris5572.github.io/map-style/dark/style.json"
    >
      <NavigationControl position="top-right" />
      <GeolocateControl />
      <ScaleControl />
      {props.routeGeoJson !== null ? (
        <Source id="gpx-route-source" type="geojson" data={props.routeGeoJson}>
          <Layer {...routeLineStyle} />
        </Source>
      ) : null}
    </Map>
  );
}
