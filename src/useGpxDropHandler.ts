import { useCallback, useState } from "react";
import type { GpxLoadingProgress, RouteEntry, RouteGeoJsonLodSet, RouteStyle } from "./types";
import { buildRouteGeoJsonLodSet, convertGpxFileToGeoJson, isGpxFile } from "./util";

const DEFAULT_ROUTE_STYLE: RouteStyle = {
  red: 255,
  green: 45,
  blue: 45,
  opacity: 0.8,
  width: 2,
};

/**
 * ルートスタイルを複製する
 */
function cloneRouteStyle(style: RouteStyle): RouteStyle {
  return { ...style };
}

/**
 * 読み込んだルートから描画エントリを生成する
 */
function createRouteEntry(lodSet: RouteGeoJsonLodSet, style: RouteStyle): RouteEntry {
  return {
    id: globalThis.crypto.randomUUID(),
    lodSet,
    style: cloneRouteStyle(style),
  };
}

/**
 * GPXドロップ処理と進捗状態を管理する
 */
export function useGpxDropHandler() {
  const [routes, setRoutes] = useState<RouteEntry[]>([]);
  const [routeStyle, setRouteStyle] = useState<RouteStyle>(DEFAULT_ROUTE_STYLE);
  const [progress, setProgress] = useState<GpxLoadingProgress>({
    isLoading: false,
    currentFileName: "",
    currentIndex: 0,
    total: 0,
    percent: 0,
  });

  /**
   * 現在の既定スタイルを更新し、必要なら既存ルートにも反映する
   */
  const applyRouteStyle = useCallback((nextStyle: RouteStyle, applyToExisting: boolean) => {
    setRouteStyle(cloneRouteStyle(nextStyle));

    if (!applyToExisting) {
      return;
    }

    setRoutes((currentRoutes) =>
      currentRoutes.map((route) => ({
        ...route,
        style: cloneRouteStyle(nextStyle),
      })),
    );
  }, []);

  /**
   * ドロップされたGPXファイルを読み込み、地図描画用のGeoJSONへ変換する
   */
  const fileDropHandler = useCallback(
    async (files: File[]) => {
      const gpxFiles = files.filter(isGpxFile);
      const styleForNewRoutes = cloneRouteStyle(routeStyle);

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
        const nextRoutes: RouteEntry[] = [];

        for (const [index, file] of gpxFiles.entries()) {
          const collection = await convertGpxFileToGeoJson(file);
          if (collection !== null) {
            nextRoutes.push(
              createRouteEntry(buildRouteGeoJsonLodSet(collection), styleForNewRoutes),
            );
          }

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

        if (nextRoutes.length > 0) {
          setRoutes((currentRoutes) => [...currentRoutes, ...nextRoutes]);
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
    },
    [routeStyle],
  );

  return {
    routes,
    routeStyle,
    progress,
    applyRouteStyle,
    fileDropHandler,
  };
}
