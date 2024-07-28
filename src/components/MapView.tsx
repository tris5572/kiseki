import React from 'react';
import {
  GeolocateControl,
  Map,
  NavigationControl,
  ScaleControl,
  useControl,
} from 'react-map-gl/maplibre';
import { PathLayer } from 'deck.gl';
import { MapboxOverlay as DeckOverlay, MapboxOverlayProps } from '@deck.gl/mapbox';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RouteData } from '../data/types';
import { useAppState } from '../data/stores';

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

/**
 * 地図を表示するビュー
 */
export function MapView() {
  const dataList = useAppState((state) => state.dataList);
  const layers = React.useMemo(() => [createPathLayer(dataList)], [dataList]);

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

function createPathLayer(data: RouteData[]) {
  return new PathLayer<RouteData>({
    id: `PathLayer`,
    data: data,
    getPath: (d) => d.coordinates.map((v) => [v.longitude, v.latitude] as [number, number]),
    getWidth: () => 2,
    getColor: () => [255, 100, 100],
    widthUnits: 'pixels',
  });
}
