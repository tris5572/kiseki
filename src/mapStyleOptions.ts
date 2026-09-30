export const mapStyleOptions = [
  {
    id: "porcelain",
    label: "Porcelain",
    url: "https://tris5572.github.io/map-style/porcelain/style.json",
  },
  {
    id: "light",
    label: "Light",
    url: "https://tris5572.github.io/map-style/light/style.json",
  },
  {
    id: "dark",
    label: "Dark",
    url: "https://tris5572.github.io/map-style/dark/style.json",
  },
] as const;

export type MapStyleId = (typeof mapStyleOptions)[number]["id"];
