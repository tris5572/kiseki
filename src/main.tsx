import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setWorkerUrl } from "maplibre-gl";
import maplibreglWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "./index.css";
import App from "./App.tsx";

/**
 * GitHub Pages 環境でも Worker を確実に読み込むため、URL を明示設定する
 */
setWorkerUrl(maplibreglWorkerUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
