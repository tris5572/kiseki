import "./MapStyleSwitcher.css";
import { mapStyleOptions, type MapStyleId } from "./mapStyleOptions";

type Props = {
  selectedStyleId: MapStyleId;
  onSelectStyle: (styleId: MapStyleId) => void;
};

/**
 * 地図スタイル切替UIを表示する
 */
export function MapStyleSwitcher(props: Props) {
  return (
    <div className="map-style-switcher" aria-label="地図スタイル切替">
      <p className="map-style-switcher__label">Map Style</p>
      <div className="map-style-switcher__buttons">
        {mapStyleOptions.map((option) => {
          const isSelected = props.selectedStyleId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className="map-style-switcher__button"
              data-selected={isSelected}
              aria-pressed={isSelected}
              onClick={() => props.onSelectStyle(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
