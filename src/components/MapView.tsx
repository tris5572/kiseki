import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

export function MapView() {
  return (
    <Map
      initialViewState={{
        longitude: 139,
        latitude: 36,
        zoom: 8,
      }}
      style={{ width: '100dvw', height: '100dvh' }}
      mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
    />
  );
}
