import Map, { NavigationControl, GeolocateControl, ScaleControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export function MapView() {
  return (
    <Map
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
    </Map>
  );
}
