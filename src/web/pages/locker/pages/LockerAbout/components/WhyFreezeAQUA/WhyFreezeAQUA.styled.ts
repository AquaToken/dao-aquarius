import styled, { css } from 'styled-components';

import { slideUpSoftAnimation, containerScrollAnimation } from 'styles/animations';
import { flexColumn, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

/* -------------------------------------------------------------------------- */
/*                                  Layout                                    */
/* -------------------------------------------------------------------------- */

/**
 * Wrapper for the WhyFreezeAQUA section.
 * Uses containerScrollAnimation for smooth fade/slide on scroll.
 */
export const Container = styled.div<{ $visible: boolean }>`
    display: flex;
    flex-direction: column;
    padding: 0 4rem;
    margin-top: 6rem;
    margin-bottom: 6rem;

    ${containerScrollAnimation}

    ${respondDown(Breakpoints.md)`
    padding: 4rem 1.6rem 0;
    margin-top: 0;
    margin-bottom: 0;
  `}
`;

/**
 * Section title with soft slide-up animation.
 */
export const Title = styled.span<{ $visible: boolean }>`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.purple950};
    margin-bottom: 7rem;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.1s;
        `}

    ${respondDown(Breakpoints.md)`
    ${FONT_SIZE.xl};
    font-weight: 700;
  `}
`;

/**
 * Main content grid with 3 feature columns.
 */
export const Content = styled.div`
    display: flex;
    gap: 6rem;

    ${respondDown(Breakpoints.md)`
    gap: 0;
    flex-direction: column;
  `}
`;

/**
 * Each feature column (image + text).
 * Animates upward sequentially with delay.
 */
export const Column = styled.div<{ $visible: boolean; $delay: number }>`
    ${flexColumn};
    width: 100%;
    opacity: 0;

    ${({ $visible, $delay }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: ${$delay}s;
        `}

    svg {
        min-height: 13.8rem;
        min-width: 13.8rem;
    }

    ${respondDown(Breakpoints.md)`
    flex-direction: row;
    margin-bottom: 3.2rem;
    gap: 1.6rem;
  `}
`;

/**
 * Wrapper for text in each column.
 */
export const TextWrap = styled.div`
    ${flexColumn};
`;

/**
 * Subheading in each column.
 */
export const ColumnTitle = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
    margin-top: 5.5rem;
    margin-bottom: 2.3rem;

    ${respondDown(Breakpoints.md)`
    margin-top: 0;
  `}
`;

/**
 * Supporting text under the column title.
 */
export const ColumnText = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
`;
