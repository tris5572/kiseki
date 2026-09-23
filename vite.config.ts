import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  base: "/kiseki/",
  optimizeDeps: {
    exclude: [
      // ローカル起動時、MapLibre が自動生成する Worker URL が開発サーバー上で正しく動作しないため除外
      "maplibre-gl",
    ],
  },
});
