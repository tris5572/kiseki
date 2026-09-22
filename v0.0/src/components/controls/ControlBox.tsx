import styled from 'styled-components';
import { AllSame } from './AllSame';

const StyledBox = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: hsl(0 0% 100% / 70%);
  width: 200px;
  max-height: calc(100vh - 2rem);
  border-radius: 4px;
`;

/**
 * 線の色などを制御するための要素を表示するコンポーネント。
 */
export function ControlBox() {
  return (
    <StyledBox>
      <AllSame />
    </StyledBox>
  );
}
