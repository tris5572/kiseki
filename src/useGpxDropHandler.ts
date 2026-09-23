import { useCallback, useState } from "react";
import type { GpxLoadingProgress, RouteGeoJson } from "./types";
import { convertGpxFileToGeoJson, isGpxFile, mergeRouteCollections } from "./util";

/**
 * GPXドロップ処理と進捗状態を管理する
 */
export function useGpxDropHandler() {
  const [routeGeoJson, setRouteGeoJson] = useState<RouteGeoJson | null>(null);
  const [progress, setProgress] = useState<GpxLoadingProgress>({
    isLoading: false,
    currentFileName: "",
    currentIndex: 0,
    total: 0,
    percent: 0,
  });

  /**
   * ドロップされたGPXファイルを読み込み、地図描画用のGeoJSONへ変換する
   */
  const fileDropHandler = useCallback(async (files: File[]) => {
    const gpxFiles = files.filter(isGpxFile);

    if (gpxFiles.length === 0) {
      return;
    }

    setProgress({
      isLoading: true,
      currentFileName: gpxFiles[0]?.name ?? "",
      currentIndex: 0,
      total: gpxFiles.length,
      percent: 0,
    });

    try {
      const collections: Array<RouteGeoJson | null> = [];

      for (const [index, file] of gpxFiles.entries()) {
        const collection = await convertGpxFileToGeoJson(file);
        collections.push(collection);

        // 変換処理中は90%まで進め、最後の描画反映で100%にする
        const percent = Math.max(Math.floor(((index + 1) / gpxFiles.length) * 90), 1);
        setProgress({
          isLoading: true,
          currentFileName: file.name,
          currentIndex: index + 1,
          total: gpxFiles.length,
          percent,
        });
      }

      const newCollection = mergeRouteCollections(collections);
      if (newCollection !== null) {
        setRouteGeoJson((prev) => mergeRouteCollections([prev, newCollection]));
      }

      setProgress((prev) => ({ ...prev, percent: 100 }));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    } finally {
      setProgress({
        isLoading: false,
        currentFileName: "",
        currentIndex: 0,
        total: 0,
        percent: 0,
      });
    }
  }, []);

  return {
    routeGeoJson,
    progress,
    fileDropHandler,
  };
}
