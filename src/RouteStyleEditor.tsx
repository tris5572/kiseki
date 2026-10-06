import type { ChangeEvent } from "react";
import { useState } from "react";
import "./RouteStyleEditor.css";
import type { RouteStyle, RouteStyleApplyMode } from "./types";

const MIN_ROUTE_WIDTH = 1;
const MAX_ROUTE_WIDTH = 12;
const MIN_ROUTE_OPACITY = 0;
const MAX_ROUTE_OPACITY = 1;

type Props = {
  routeStyle: RouteStyle;
  routeStyleApplyMode: RouteStyleApplyMode;
  onSelectRouteStyleApplyMode: (mode: RouteStyleApplyMode) => void;
  onChangeRouteStyle: (style: RouteStyle) => void;
};

type ParsedCssColor = {
  /**
   * 赤成分
   */
  red: number;
  /**
   * 緑成分
   */
  green: number;
  /**
   * 青成分
   */
  blue: number;
  /**
   * 色文字列にアルファ値が含まれていた場合の不透明度
   */
  alpha?: number;
};

/**
 * 数値を範囲内へ丸める
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 0-255の色成分を16進文字列へ変換する
 */
function toHexSegment(value: number): string {
  return value.toString(16).padStart(2, "0");
}

/**
 * 現在のスタイルをHEX表記へ整形する
 */
function formatRouteColor(style: RouteStyle): string {
  return `#${toHexSegment(style.red)}${toHexSegment(style.green)}${toHexSegment(style.blue)}`;
}

/**
 * プレビュー用のRGBA文字列を返す
 */
function formatPreviewColor(style: RouteStyle): string {
  return `rgba(${style.red}, ${style.green}, ${style.blue}, ${style.opacity})`;
}

/**
 * CSSの色文字列をRGBA成分へ変換する
 */
function parseCssColor(value: string): ParsedCssColor | null {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0 || !CSS.supports("color", normalizedValue)) {
    return null;
  }

  const sample = document.createElement("span");
  sample.style.color = normalizedValue;
  document.body.append(sample);

  const computedColor = getComputedStyle(sample).color;
  sample.remove();

  const values = computedColor.match(/[\d.]+/g);
  if (values === null || values.length < 3) {
    return null;
  }

  const [redText, greenText, blueText, alphaText] = values;
  const parsedColor = {
    red: Number(redText),
    green: Number(greenText),
    blue: Number(blueText),
    alpha: computedColor.startsWith("rgba(") ? Number(alphaText) : undefined,
  } satisfies ParsedCssColor;

  if (
    Number.isNaN(parsedColor.red) ||
    Number.isNaN(parsedColor.green) ||
    Number.isNaN(parsedColor.blue) ||
    (parsedColor.alpha !== undefined && Number.isNaN(parsedColor.alpha))
  ) {
    return null;
  }

  return parsedColor;
}

/**
 * ルート線スタイル編集UIを表示する
 */
export function RouteStyleEditor(props: Props) {
  const [colorInput, setColorInput] = useState(() => formatRouteColor(props.routeStyle));
  const [colorError, setColorError] = useState<string | null>(null);

  /**
   * 線色の文字列入力を反映する
   */
  function handleColorInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    const parsedColor = parseCssColor(nextValue);

    setColorInput(nextValue);

    if (parsedColor === null) {
      setColorError("HEX / RGB / HSL 形式の色を指定する");
      return;
    }

    setColorError(null);
    props.onChangeRouteStyle({
      ...props.routeStyle,
      red: parsedColor.red,
      green: parsedColor.green,
      blue: parsedColor.blue,
      opacity: clamp(
        parsedColor.alpha ?? props.routeStyle.opacity,
        MIN_ROUTE_OPACITY,
        MAX_ROUTE_OPACITY,
      ),
    });
  }

  /**
   * カラーピッカーから線色を反映する
   */
  function handleColorPickerChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    const parsedColor = parseCssColor(nextValue);

    setColorInput(nextValue);
    setColorError(null);

    if (parsedColor === null) {
      return;
    }

    props.onChangeRouteStyle({
      ...props.routeStyle,
      red: parsedColor.red,
      green: parsedColor.green,
      blue: parsedColor.blue,
    });
  }

  /**
   * 線の不透明度を更新する
   */
  function handleOpacityChange(event: ChangeEvent<HTMLInputElement>) {
    const nextOpacity = clamp(Number(event.target.value), MIN_ROUTE_OPACITY, MAX_ROUTE_OPACITY);

    if (Number.isNaN(nextOpacity)) {
      return;
    }

    props.onChangeRouteStyle({
      ...props.routeStyle,
      opacity: nextOpacity,
    });
  }

  /**
   * 線の太さを更新する
   */
  function handleWidthChange(event: ChangeEvent<HTMLInputElement>) {
    const nextWidth = clamp(Number(event.target.value), MIN_ROUTE_WIDTH, MAX_ROUTE_WIDTH);

    if (Number.isNaN(nextWidth)) {
      return;
    }

    props.onChangeRouteStyle({
      ...props.routeStyle,
      width: nextWidth,
    });
  }

  return (
    <section className="route-style-editor" aria-label="ルートスタイル">
      <div className="route-style-editor__header">
        <p className="route-style-editor__label">Route Style</p>
        <span
          className="route-style-editor__style-preview"
          aria-hidden="true"
          style={{ backgroundColor: formatPreviewColor(props.routeStyle) }}
        />
      </div>

      <div
        className="route-style-editor__apply-mode"
        role="radiogroup"
        aria-label="スタイル変更の適用対象"
      >
        <label className="route-style-editor__radio">
          <input
            type="radio"
            name="route-style-apply-mode"
            checked={props.routeStyleApplyMode === "all"}
            onChange={() => props.onSelectRouteStyleApplyMode("all")}
          />
          <span>既存のルートも更新</span>
        </label>
        <label className="route-style-editor__radio">
          <input
            type="radio"
            name="route-style-apply-mode"
            checked={props.routeStyleApplyMode === "future"}
            onChange={() => props.onSelectRouteStyleApplyMode("future")}
          />
          <span>今後追加するルートのみ</span>
        </label>
      </div>

      <label className="route-style-editor__field-group">
        <span className="route-style-editor__field-label">色</span>
        <div className="route-style-editor__color-row">
          <input
            type="text"
            className="route-style-editor__text-input"
            value={colorInput}
            inputMode="text"
            spellCheck={false}
            placeholder="#ff2d2d / rgb(255, 45, 45) / hsl(0 100% 59%)"
            aria-invalid={colorError !== null}
            onChange={handleColorInputChange}
          />
          <input
            type="color"
            className="route-style-editor__color-picker"
            value={formatRouteColor(props.routeStyle)}
            aria-label="線色を選択"
            onChange={handleColorPickerChange}
          />
        </div>
        {colorError !== null ? (
          <span className="route-style-editor__error" role="alert">
            {colorError}
          </span>
        ) : null}
      </label>

      <label className="route-style-editor__field-group">
        <span className="route-style-editor__field-row">
          <span className="route-style-editor__field-label">不透明度</span>
          <span className="route-style-editor__field-value">
            {Math.round(props.routeStyle.opacity * 100)}%
          </span>
        </span>
        <div className="route-style-editor__slider-row">
          <input
            type="range"
            className="route-style-editor__range-input"
            min={MIN_ROUTE_OPACITY}
            max={MAX_ROUTE_OPACITY}
            step={0.01}
            value={props.routeStyle.opacity}
            onChange={handleOpacityChange}
          />
          <input
            type="number"
            className="route-style-editor__number-input"
            min={MIN_ROUTE_OPACITY}
            max={MAX_ROUTE_OPACITY}
            step={0.01}
            value={props.routeStyle.opacity}
            onChange={handleOpacityChange}
          />
        </div>
      </label>

      <label className="route-style-editor__field-group">
        <span className="route-style-editor__field-row">
          <span className="route-style-editor__field-label">太さ</span>
          <span className="route-style-editor__field-value">{props.routeStyle.width}px</span>
        </span>
        <div className="route-style-editor__slider-row">
          <input
            type="range"
            className="route-style-editor__range-input"
            min={MIN_ROUTE_WIDTH}
            max={MAX_ROUTE_WIDTH}
            step={0.5}
            value={props.routeStyle.width}
            onChange={handleWidthChange}
          />
          <input
            type="number"
            className="route-style-editor__number-input"
            min={MIN_ROUTE_WIDTH}
            max={MAX_ROUTE_WIDTH}
            step={0.5}
            value={props.routeStyle.width}
            onChange={handleWidthChange}
          />
        </div>
      </label>
    </section>
  );
}
