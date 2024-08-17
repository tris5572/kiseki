import styled from 'styled-components';
import { useAppState } from '../../data/stores';
import { RouteData } from '../../data/types';

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

const StyledButton = styled.button`
  padding: 0.2rem 0.5rem;
`;

/**
 * すべての線を、一括して同じ値に設定するためのビュー。
 */
export function AllSame() {
  const [data, updateData] = useAppState((state) => [state.dataList, state.updateData]);

  function handleRandom() {
    const c = randomColor();
    const d = apply(data, c);
    updateData(d);
  }

  return (
    <StyledWrapper>
      <StyledTitle>一括設定</StyledTitle>
      <StyledButton onClick={handleRandom}>ランダム色</StyledButton>
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
