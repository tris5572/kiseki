import "./App.css";
import { useState } from "react";
import { DropOverlay } from "./DropOverlay";
import { LoadingProgress } from "./LoadingProgress.tsx";
import { MapStyleSwitcher } from "./MapStyleSwitcher";
import { MapView } from "./MapView";
import { mapStyleOptions, type MapStyleId } from "./mapStyleOptions";
import { useGpxDropHandler } from "./useGpxDropHandler.ts";

/**
 * アプリケーション全体を表示する
 */
function App() {
  const { routeLodSet, progress, fileDropHandler } = useGpxDropHandler();
  const [selectedMapStyleId, setSelectedMapStyleId] = useState<MapStyleId>("porcelain");
  const selectedMapStyle =
    mapStyleOptions.find((option) => option.id === selectedMapStyleId) ?? mapStyleOptions[0];

  return (
    <main>
      <MapView routeLodSet={routeLodSet} mapStyleUrl={selectedMapStyle.url} />
      <MapStyleSwitcher
        selectedStyleId={selectedMapStyleId}
        onSelectStyle={setSelectedMapStyleId}
      />
      <DropOverlay fileHandler={fileDropHandler} />
      <LoadingProgress progress={progress} />
    </main>
  );
}

export default App;
