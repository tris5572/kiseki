import "./App.css";
import { useState } from "react";
import { DropOverlay } from "./DropOverlay";
import { LoadingProgress } from "./LoadingProgress.tsx";
import { MapStyleSwitcher } from "./MapStyleSwitcher";
import { MapView } from "./MapView";
import { RouteStyleEditor } from "./RouteStyleEditor";
import { mapStyleOptions, type MapStyleId } from "./mapStyleOptions";
import type { RouteStyleApplyMode } from "./types";
import { useGpxDropHandler } from "./useGpxDropHandler.ts";

/**
 * アプリケーション全体を表示する
 */
function App() {
  const { routes, routeStyle, progress, applyRouteStyle, fileDropHandler } = useGpxDropHandler();
  const [selectedMapStyleId, setSelectedMapStyleId] = useState<MapStyleId>("porcelain");
  const [routeStyleApplyMode, setRouteStyleApplyMode] = useState<RouteStyleApplyMode>("all");
  const selectedMapStyle =
    mapStyleOptions.find((option) => option.id === selectedMapStyleId) ?? mapStyleOptions[0];

  return (
    <main>
      <MapView routes={routes} mapStyleUrl={selectedMapStyle.url} />
      <div className="app-controls">
        <MapStyleSwitcher
          selectedStyleId={selectedMapStyleId}
          onSelectStyle={setSelectedMapStyleId}
        />
        <RouteStyleEditor
          routeStyle={routeStyle}
          routeStyleApplyMode={routeStyleApplyMode}
          onSelectRouteStyleApplyMode={setRouteStyleApplyMode}
          onChangeRouteStyle={(nextStyle) =>
            applyRouteStyle(nextStyle, routeStyleApplyMode === "all")
          }
        />
      </div>
      <DropOverlay fileHandler={fileDropHandler} />
      <LoadingProgress progress={progress} />
    </main>
  );
}

export default App;
