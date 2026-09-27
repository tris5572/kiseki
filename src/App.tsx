import "./App.css";
import { DropOverlay } from "./DropOverlay";
import { LoadingProgress } from "./LoadingProgress.tsx";
import { MapView } from "./MapView";
import { useGpxDropHandler } from "./useGpxDropHandler.ts";

function App() {
  const { routeLodSet, progress, fileDropHandler } = useGpxDropHandler();

  return (
    <main>
      <MapView routeLodSet={routeLodSet} />
      <DropOverlay fileHandler={fileDropHandler} />
      <LoadingProgress progress={progress} />
    </main>
  );
}

export default App;
