import React from 'react';
import {
  GeolocateControl,
  Map,
  MapStyle,
  NavigationControl,
  ScaleControl,
  useControl,
} from 'react-map-gl/maplibre';
import { PathLayer } from 'deck.gl';
import { MapboxOverlay as DeckOverlay, MapboxOverlayProps } from '@deck.gl/mapbox';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RouteData } from '../data/types';
import { useAppState } from '../data/stores';
import styleWhite from '../mapStyles/osm-bright-ja-white.json';

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

/**
 * 地図を表示するビュー
 */
export function MapView() {
  const [initialViewState] = React.useState({
    longitude: 137.48,
    latitude: 36,
    zoom: 7,
  });

  const dataList = useAppState((state) => state.dataList);
  const pathLayer = React.useMemo(() => createPathLayer(dataList), [dataList]);
  const layers = React.useMemo(() => [pathLayer], [pathLayer]);

  // TODO: パスがセットされたら表示領域をパスにフィットさせる
  // https://deck.gl/docs/api-reference/core/web-mercator-viewport#fitbounds
  // https://maplibre.org/maplibre-gl-js/docs/examples/zoomto-linestring/

  return (
    <Map
      style={{ width: '100dvw', height: '100dvh' }}
      initialViewState={initialViewState}
      mapStyle={styleWhite as MapStyle}
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
    getColor: (d) => d.color,
    widthUnits: 'pixels',
  });
}
