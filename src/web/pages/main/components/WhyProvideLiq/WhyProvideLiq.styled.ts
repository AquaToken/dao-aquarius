import styled, { css } from 'styled-components';

import {
    containerScrollAnimation,
    slideUpSoftAnimation,
    fadeAppearAnimation,
} from 'styles/animations';
import { flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Wrapper = styled.section<{ $visible: boolean }>`
    ${flexAllCenter};
    flex-direction: column;
    margin-top: 11rem;
    ${containerScrollAnimation};

    ${respondDown(Breakpoints.lg)`font-size: 10rem;`};
    ${respondDown(Breakpoints.md)`font-size: 7rem; margin-top: 6rem;`};
    ${respondDown(Breakpoints.xs)`font-size: 4rem; margin-top: 4rem;`};
`;

export const WhyTitle = styled.div<{ $visible: boolean }>`
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
`;

export const WhyStats = styled.div<{ $visible: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeAppearAnimation};
            animation-delay: 0.2s;
        `}

    ${respondDown(Breakpoints.sm)`
    justify-content: center;
    align-items: center;
  `}
`;

export const WhyBlocks = styled.div`
    display: flex;
    width: 100%;
    gap: 6rem;

    ${respondDown(Breakpoints.md)`gap: 4rem;`};
    ${respondDown(Breakpoints.sm)`flex-direction: column; gap: 3.2rem;`};
`;

export const Block = styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    flex: 1;
    width: 50%;
    ${respondDown(Breakpoints.sm)`width: 100%;`};
`;

export const ShowOnSm = styled(Block)`
    display: none;
    ${respondDown(Breakpoints.sm)`display: flex; flex-direction: column; align-items: center;`};
`;

export const InfoBlock = styled(Block)<{ $visible: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    flex: 1;
    width: 50%;
    gap: 6.4rem;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.25s;
        `}

    ${respondDown(Breakpoints.md)`gap: 3.2rem;`};
    ${respondDown(Breakpoints.sm)`width: 100%; flex-direction: column;`};
`;

export const InfoWrapper = styled.div<{ $delay: number; $visible: boolean }>`
    display: flex;
    gap: 1.6rem;
    width: 100%;
    opacity: 0;

    ${({ $visible, $delay }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: ${$delay}s;
        `}

    svg {
        flex: 0 0 auto;
        width: 10rem;
        height: 10rem;
    }

    ${respondDown(Breakpoints.sm)`
    align-items: center;
    svg { width: 6.8rem; height: 6.8rem; }
  `}
`;

export const StatsTitle = styled.div`
    font-weight: bold;
    font-size: 3.5rem;
    line-height: 100%;
    color: ${COLORS.textPrimary};
    background: linear-gradient(90deg, ${COLORS.purple500}, ${COLORS.blue550});
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
`;

export const DescBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

export const DescTitle = styled.div`
    font-weight: bold;
    font-size: 2.4rem;
    line-height: 3.6rem;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.xs)`font-size: 1.6rem; line-height: 2.4rem;`};
`;

export const Description = styled.div`
    font-size: 1.6rem;
    font-weight: 500;
    line-height: 180%;
    color: ${COLORS.gray550};

    ${respondDown(Breakpoints.xs)`font-size: 1.6rem; line-height: 2.4rem;`};
`;

export const DescriptionStats = styled(Description)`
    font-weight: bold;
    ${respondDown(Breakpoints.xs)`text-align: center;`};
`;

export const HideOnSm = styled.div`
    ${respondDown(Breakpoints.sm)`display: none;`};
`;
