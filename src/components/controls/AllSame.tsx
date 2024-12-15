import React from 'react';
import styled from 'styled-components';
import { useAppState } from '../../data/stores';
import type { RouteData } from '../../data/types';
import { hexFromNumbers, numbersFromHex } from '../../data/utils';

const StyledWrapper = styled.div`
  background: hsl(0 0% 0% / 20%);
  border-radius: 4px;
  margin: 0.5rem;
  padding: 0.4rem 0.6rem;
`;

const StyledTitle = styled.p`
  font-size: small;
  font-weight: bold;
`;

const StyledColorLine = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StyledButton = styled.button`
  padding: 0.2rem 0.2rem;
  font-size: x-small;
`;

/**
 * すべての線を、一括して同じ値に設定するためのビュー。
 */
export function AllSame() {
  const [data, updateData] = useAppState((state) => [state.dataList, state.updateData]);
  const [color, setColor] = React.useState('#C86464');

  function handleColorSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const c = e.target.value;
    setColor(c);
    const d = apply(data, numbersFromHex(c));
    updateData(d);
  }

  function handleRandom() {
    const c = randomColor();
    setColor(hexFromNumbers(c));
    const d = apply(data, c);
    updateData(d);
  }

  return (
    <StyledWrapper>
      <StyledTitle>一括設定</StyledTitle>
      <StyledColorLine>
        <input type="color" value={color} onChange={(e) => handleColorSelect(e)} />
        <StyledButton onClick={handleRandom}>ランダム色</StyledButton>
      </StyledColorLine>
    </StyledWrapper>
  );
}

/**
 * すべてのデータに同じ線のスタイルを適用して返す。
 */
function apply(data: RouteData[], color: [number, number, number]): RouteData[] {
  const array = [];

  for (const d of data) {
    d.color = color;
    array.push(d);
  }

  return array;
}

/**
 * ランダムな色を生成する。
 */
function randomColor(): [number, number, number] {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return [r, g, b];
}
