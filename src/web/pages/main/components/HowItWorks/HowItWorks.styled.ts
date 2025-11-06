import styled, { css } from 'styled-components';

import {
    containerScrollAnimation,
    slideUpSoftAnimation,
    fadeAppearAnimation,
    fadeInScale,
} from 'styles/animations';
import { flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Wrapper = styled.section<{ $visible: boolean }>`
    ${flexAllCenter};
    flex-direction: column;
    margin-top: 11rem;
    ${containerScrollAnimation};

    ${respondDown(Breakpoints.md)`margin-top: 10rem;`};
    ${respondDown(Breakpoints.sm)`margin-top: 6rem;`};
    ${respondDown(Breakpoints.xs)`margin-top: 4rem;`};
`;

export const Title = styled.div<{ $visible: boolean }>`
    font-weight: bold;
    font-size: 7rem;
    color: ${COLORS.textPrimary};
    line-height: 100%;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.1s;
        `}

    ${respondDown(Breakpoints.md)`font-size: 5.6rem;`};
    ${respondDown(Breakpoints.sm)`font-size: 3.2rem;`};
    ${respondDown(Breakpoints.xs)`font-size: 2.4rem;`};
`;

export const BlocksWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: 6rem;

    ${respondDown(Breakpoints.md)`gap: 4rem;`};
    ${respondDown(Breakpoints.sm)`flex-direction: column; gap: 4rem;`};
`;

export const Block = styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    width: 50%;

    ${respondDown(Breakpoints.sm)`width: 100%;`};
`;

export const BlockInteractive = styled(Block)<{ $visible: boolean }>`
    gap: 1.6rem;
    justify-content: flex-start;
    order: 3;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.25s;
        `}

    ${respondDown(Breakpoints.xs)`gap: 0.8rem;`};
`;

export const TitleBlock = styled(Block)<{ $visible: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
    flex-basis: 100%;
    max-width: 50%;
    order: 1;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeAppearAnimation};
            animation-delay: 0.15s;
        `}

    ${respondDown(Breakpoints.sm)`gap: 1.6rem; max-width: 100%;`};
`;

export const IconBlock = styled(Block)<{ $visible: boolean }>`
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    flex: 1;
    width: 50%;
    order: 3;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeInScale};
            animation-delay: 0.3s;
        `}

    svg {
        width: 100%;
        height: 54.6rem;
    }

    ${respondDown(Breakpoints.md)`svg { height: 43.5rem; }`}
    ${respondDown(Breakpoints.sm)`
    width: 100%;
    order: 2;
    svg { height: 38rem; }
  `}
  ${respondDown(Breakpoints.xs)`svg { height: 30rem; }`}
`;

export const Description = styled.div`
    font-size: 1.6rem;
    font-weight: 500;
    line-height: 180%;
    color: ${COLORS.gray550};
    ${respondDown(Breakpoints.xs)`font-size: 1.4rem;`};
`;

export const InteractiveItem = styled.div<{ $delay: number; $visible: boolean }>`
    background-color: ${COLORS.gray50};
    border-radius: 4.8rem;
    padding: 3.2rem 4rem;
    display: flex;
    flex-direction: column;
    opacity: 0;

    ${({ $visible, $delay }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: ${$delay}s;
        `}

    ${respondDown(Breakpoints.sm)`border-radius: 3.2rem; padding: 2.4rem;`};
    ${respondDown(Breakpoints.xs)`padding: 1.6rem 2.4rem;`};
`;

export const InteractiveTitle = styled.div`
    font-weight: bold;
    font-size: 1.6rem;
    line-height: 3.6rem;
    color: ${COLORS.textPrimary};
    text-transform: uppercase;
`;
