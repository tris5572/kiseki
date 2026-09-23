import { useState, useCallback, useEffect } from "react";

type Props = {
  /**
   * ファイルがドロップされたときのハンドラー
   *
   * @param files File オブジェクトの配列
   */
  fileHandler: (files: File[]) => void;
};

/**
 * ファイルをドロップするためのオーバーレイコンポーネント
 */
export function DropOverlay(props: Props) {
  const [isHover, setIsHover] = useState(false);

  // ファイルのドラッグを扱うコールバック
  const enterHandler = useCallback((e: DragEvent) => {
    setIsHover(true);
    e.stopPropagation();
    e.preventDefault();
  }, []);
  const leaveHandler = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setIsHover(false);
    e.stopPropagation();
    e.preventDefault();
  }, []);

  // ファイルがドロップされた際の処理
  const dropHandler = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHover(false);
    if (!e.dataTransfer.files) {
      return;
    }
    const files = [];
    for (const f of e.dataTransfer.files) {
      files.push(f);
    }

    props.fileHandler(files);
    // e.dataTransfer.clearData();
  };

  // ファイルが画面内へドラッグされたときの処理を登録
  useEffect(() => {
    window.addEventListener("dragenter", enterHandler);
    return () => {
      window.removeEventListener("dragenter", enterHandler);
    };
  }, [enterHandler]);

  return (
    <div
      style={{
        width: "100dvw",
        height: "100dvh",
        position: "absolute",
        top: 0,
        left: 0,
        background: "hsl(0 100% 100% / 50%)",
        visibility: isHover ? "visible" : "hidden",
      }}
      onDragLeave={leaveHandler}
      onDragOver={(e) => e.preventDefault()}
      onDrop={dropHandler}
    />
  );
}
