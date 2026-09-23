import { useCallback, useState } from "react";
import "./App.css";
import { DropOverlay } from "./DropOverlay";
import { MapView } from "./MapView";
import type { RouteGeoJson } from "./types";
import { convertGpxFileToGeoJson, isGpxFile, mergeRouteCollections } from "./util";

function App() {
  const [routeGeoJson, setRouteGeoJson] = useState<RouteGeoJson | null>(null);

  /**
   * ドロップされたGPXファイルを読み込み、地図描画用のGeoJSONへ変換する
   */
  const fileDropHandler = useCallback(async (files: File[]) => {
    const gpxFiles = files.filter(isGpxFile);

    if (gpxFiles.length === 0) {
      return;
    }

    const collections = await Promise.all(gpxFiles.map(convertGpxFileToGeoJson));
    const newCollection = mergeRouteCollections(collections);

    if (newCollection === null) {
      return;
    }

    setRouteGeoJson((prev) => mergeRouteCollections([prev, newCollection]));
  }, []);

  return (
    <main>
      <MapView routeGeoJson={routeGeoJson} />
      <DropOverlay fileHandler={fileDropHandler} />
    </main>
  );
}

export default App;
