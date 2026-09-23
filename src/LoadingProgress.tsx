import type { GpxLoadingProgress } from "./types";
import "./LoadingProgress.css";

type Props = {
  /**
   * GPX読み込み進捗
   */
  progress: GpxLoadingProgress;
};

/**
 * GPX読み込み中の進捗バーを表示する
 */
export function LoadingProgress({ progress }: Props) {
  if (!progress.isLoading) {
    return null;
  }

  return (
    <div className="loading-progress" aria-live="polite" aria-busy="true">
      <div className="panel">
        <p className="label">GPXファイルを読み込み中...</p>
        <p className="file-name">{progress.currentFileName}</p>
        <div className="track">
          <div className="bar" style={{ width: `${progress.percent}%` }} />
        </div>
        <p className="meta">
          <span>
            {progress.currentIndex} / {progress.total}
          </span>
          <span>{progress.percent}%</span>
        </p>
      </div>
    </div>
  );
}
