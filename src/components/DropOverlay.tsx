import React from 'react';

/**
 * ファイルをドロップするためのオーバーレイ。
 */
export function DropOverlay() {
  const [isHover, setIsHover] = React.useState(false);

  // ファイルのドラッグを扱うコールバック
  const enterHandler = React.useCallback((e: DragEvent) => {
    setIsHover(true);
    e.stopPropagation();
    e.preventDefault();
  }, []);
  const leaveHandler = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setIsHover(false);
    e.stopPropagation();
    e.preventDefault();
  }, []);

  // ファイルが画面内へドラッグされたときの処理を登録
  React.useEffect(() => {
    window.addEventListener('dragenter', enterHandler);
    return () => {
      window.removeEventListener('dragenter', enterHandler);
    };
  }, [enterHandler]);

  return (
    <div
      style={{
        width: '100dvw',
        height: '100dvh',
        position: 'absolute',
        top: 0,
        left: 0,
        background: 'hsl(0 100% 100% / 50%)',
        visibility: isHover ? 'visible' : 'hidden',
      }}
      onDragLeave={leaveHandler}
      onDragOver={(e) => e.preventDefault()}
    ></div>
  );
}
