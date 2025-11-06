import styled, { css } from 'styled-components';

import ArrowAlt16 from 'assets/icons/arrows/arrow-alt-16.svg';
import SorobanStars from 'assets/main-page/soroban-stars.svg';

import { Button } from 'basics/buttons';

import {
    containerScrollAnimation,
    fadeAppearAnimation,
    slideUpSoftAnimation,
} from 'styles/animations';
import { flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Wrapper = styled.section<{ $visible: boolean }>`
    ${flexAllCenter};
    flex-direction: column;
    margin-top: 11rem;
    ${containerScrollAnimation};

    ${respondDown(Breakpoints.sm)`
    margin-top: 6.4rem;
  `}

    ${respondDown(Breakpoints.xs)`
    margin-top: 4.8rem;
  `}
`;

export const InnerWrapper = styled.div<{ $visible: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 79rem;
    text-align: center;

    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeAppearAnimation};
            animation-delay: 0.15s;
        `}
`;

export const Title = styled.span`
    font-size: 3.5rem;
    line-height: 5.2rem;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.sm)`
    font-size: 2.4rem;
    line-height: 100%;
  `}
`;

export const TitleBold = styled(Title)`
    font-weight: 700;
    color: ${COLORS.purple500};
`;

export const SorobanStarsStyled = styled(SorobanStars)<{ $visible: boolean }>`
    margin-bottom: 2.4rem;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.05s;
        `}
`;

export const SorobanBlocks = styled.div`
    display: flex;
    width: 100%;
    gap: 6rem;
    margin-top: 4.8rem;

    ${respondDown(Breakpoints.md)`
    margin-top: 2.4rem;
    gap: 4rem;
  `}

    ${respondDown(Breakpoints.sm)`
    flex-direction: column;
    gap: 1.6rem;
  `}
`;

export const Block = styled.div<{ $visible: boolean; $delay: number }>`
    background-color: ${COLORS.gray50};
    display: flex;
    justify-content: space-between;
    flex: 1;
    flex-direction: column;
    border-radius: 4.8rem;
    padding: 4.8rem;
    width: 50%;
    opacity: 0;

    ${({ $visible, $delay }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: ${$delay}s;
        `}

    ${respondDown(Breakpoints.sm)`
    padding: 3.2rem;
    width: 100%;
  `}
`;

export const BlockWithIcon = styled.div`
    ${respondDown(Breakpoints.sm)`
    display: flex;
    align-items: center;
    gap: 1.6rem;

    svg {
      flex: 0 0 auto;
    }
  `}

    ${respondDown(Breakpoints.xs)`
    flex-direction: column;
    align-items: start;
  `}
`;

export const BlockDesc = styled.div`
    font-size: 2.4rem;
    line-height: 3.6rem;
    color: ${COLORS.textPrimary};
    margin-top: 1.6rem;

    ${respondDown(Breakpoints.md)`
    margin-top: 0.8rem;
  `}

    ${respondDown(Breakpoints.sm)`
    margin-top: 0;
  `}

  ${respondDown(Breakpoints.xs)`
    font-size: 1.6rem;
    line-height: 2.4rem;
  `}
`;

export const SorobanButton = styled(Button)`
    margin-top: 4rem;
    padding: 0 2.4rem;

    ${respondDown(Breakpoints.sm)`
    margin-top: 3.2rem;
    height: 4rem;
  `}

    ${respondDown(Breakpoints.xs)`
    width: 100%;
  `}
`;

export const ArrowAlt16Styled = styled(ArrowAlt16)`
    margin-left: 0.8rem;
    color: ${COLORS.textPrimary};
`;
