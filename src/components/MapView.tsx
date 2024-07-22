import React from 'react';
import {
  GeolocateControl,
  Map,
  NavigationControl,
  ScaleControl,
  useControl,
} from 'react-map-gl/maplibre';
// import DeckGL from '@deck.gl/react';
import { PathLayer } from 'deck.gl';
import { MapboxOverlay as DeckOverlay, MapboxOverlayProps } from '@deck.gl/mapbox';
import 'maplibre-gl/dist/maplibre-gl.css';

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

export function MapView() {
  const layers = React.useMemo(() => [createPathLayer()], []);

  return (
    <Map
      style={{ width: '100dvw', height: '100dvh' }}
      initialViewState={{
        longitude: 139,
        latitude: 36,
        zoom: 5,
      }}
      mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
    >
      <NavigationControl position="top-right" />
      <GeolocateControl />
      <ScaleControl />
      <DeckGLOverlay layers={layers} />
    </Map>
  );
}

function createPathLayer() {
  return new PathLayer<SampleData>({
    id: `PathLayer`,
    data: SAMPLE_DATA,
    getPath: (d) => d.coordinates,
    getWidth: () => 10,
    getColor: () => [255, 100, 100],
    widthUnits: 'pixels',
  });
}

function randomLng(): number {
  return 136 + 4 * Math.random();
}

function randomLat(): number {
  return 33 + 4 * Math.random();
}

type SampleData = {
  coordinates: [number, number][];
};

const SAMPLE_DATA: SampleData[] = [
  {
    coordinates: [
      [138, 39],
      [139, 39],
      [140, 40],
    ],
  },
  {
    coordinates: [
      [140, 41],
      [140, 42],
      [142, 41],
    ],
  },
  {
    coordinates: [
      [randomLng(), randomLat()],
      [randomLng(), randomLat()],
      [randomLng(), randomLat()],
      [randomLng(), randomLat()],
    ],
  },
];
