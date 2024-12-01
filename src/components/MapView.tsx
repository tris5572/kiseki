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
import { Point, RouteData } from '../data/types';
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
  const [zoom, setZoom] = React.useState(7);
  const [initialViewState] = React.useState({
    longitude: 137.48,
    latitude: 36,
    zoom,
  });

  // TODO: パスがセットされたら表示領域をパスにフィットさせる
  // https://deck.gl/docs/api-reference/core/web-mercator-viewport#fitbounds
  // https://maplibre.org/maplibre-gl-js/docs/examples/zoomto-linestring/

  return (
    <Map
      style={{ width: '100dvw', height: '100dvh' }}
      initialViewState={initialViewState}
      mapStyle={styleWhite as MapStyle}
      onZoomEnd={(e) => setZoom(e.viewState.zoom)}
    >
      <NavigationControl position="top-right" />
      <GeolocateControl />
      <ScaleControl />
      <LineOverlay zoom={zoom} />
    </Map>
  );
}

/**
 * 線を描画するオーバーレイレイヤー
 */
function LineOverlay({ zoom }: { zoom: number }) {
  const dataList = useAppState((state) => state.dataList);
  const pathLayer = createPathLayer(dataList, zoom);
  const layers = React.useMemo(() => [pathLayer], [pathLayer]);

  return <DeckGLOverlay layers={layers} />;
}

/**
 * 描画する線のレイヤーを生成する
 *
 * ズームレベルを元に間引く
 */
function createPathLayer(sourceData: RouteData[], zoom: number) {
  type LocalData = {
    coordinates: [number, number][];
    color: [number, number, number];
  };
  const data: LocalData[] = sourceData.map(
    (d) =>
      ({
        color: d.color,
        coordinates: reduceCoordinates(d.coordinates, zoom),
      } satisfies LocalData)
  );

  return new PathLayer<LocalData>({
    id: `PathLayer`,
    data,
    getPath: (d) => d.coordinates,
    getWidth: () => 2,
    getColor: (d) => d.color,
    widthUnits: 'pixels',
    jointRounded: true,
  });
}

/**
 * ズームレベルを参照し、適度に間引いた座標を返す
 */
function reduceCoordinates(points: Point[], zoom: number): [number, number][] {
  const threshold = 50 / zoom; // ズームレベルから計算した間隔のしきい値[m]
  let dist = 0; // 前回からの累積の間隔[m]

  const array: [number, number][] = [];

  // 最初の地点は必ず登録
  array.push([points[0].longitude, points[0].latitude]);

  for (let i = 0; i < points.length - 1; i++) {
    const prev = points[0];
    const now = points[1];
    dist += distance(prev.longitude, prev.latitude, now.longitude, now.latitude);
    if (threshold <= dist) {
      array.push([points[i + 1].longitude, points[i + 1].latitude]);
      dist = 0;
    }
  }

  // 最後の地点が最後の座標と異なる場合は追加
  if (
    points[points.length - 1].longitude !== array[array.length - 1][0] &&
    points[points.length - 1].latitude !== array[array.length - 1][1]
  ) {
    array.push([points[points.length - 1].longitude, points[points.length - 1].latitude]);
  }

  return array;
}

/**
 * 2点間の距離[m] を算出する
 */
function distance(
  longitude1: number,
  latitude1: number,
  longitude2: number,
  latitude2: number
): number {
  const R = Math.PI / 180;
  const lng1 = longitude1 * R;
  const lat1 = latitude1 * R;
  const lng2 = longitude2 * R;
  const lat2 = latitude2 * R;
  return (
    6371000 *
    Math.acos(
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2)
    )
  );
}
