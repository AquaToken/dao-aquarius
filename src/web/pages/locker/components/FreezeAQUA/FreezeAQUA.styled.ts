import styled, { css } from 'styled-components';

import {
    containerScrollAnimation,
    fadeInScale,
    fadeInUpAnimation,
    fadeInUpDelayed,
} from 'web/animations';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'web/styles';

/* -------------------------------------------------------------------------- */
/*                                  Layout                                    */
/* -------------------------------------------------------------------------- */

/**
 * Wrapper container for the FreezeAQUA section.
 * Handles positioning, spacing, and fade-in visibility.
 */
export const Container = styled.div<{ $visible: boolean }>`
    display: flex;
    align-items: center;
    gap: 9rem;
    padding: 6rem 4rem;

    ${containerScrollAnimation};

    ${respondDown(Breakpoints.sm)`
        flex-direction: column-reverse;
        gap: 3.2rem;
        padding: 0 1.6rem;
    `}
`;

/**
 * Text column wrapper (title, description, link).
 */
export const TextBlock = styled.div<{ $visible: boolean }>`
    display: flex;
    flex-direction: column;
    width: 50%;
    opacity: 0;

    ${({ $visible }) => $visible && fadeInUpAnimation}

    ${respondDown(Breakpoints.sm)`
        width: 100%;
    `}
`;

/**
 * Section title.
 */
export const Title = styled.h2`
    ${FONT_SIZE.xxl};
    font-weight: 700;
    color: ${COLORS.textPrimary};
    margin: 0;

    ${respondDown(Breakpoints.sm)`
        ${FONT_SIZE.xl};
    `}
`;

/**
 * Main text block (description).
 */
export const Description = styled.p<{ $visible: boolean }>`
    font-size: 1.6rem;
    color: ${COLORS.textDark};
    margin: 3rem 0;
    line-height: 1.8;
    opacity: 0;

    ${({ $visible }) => $visible && fadeInUpDelayed}

    b {
        color: ${COLORS.textPrimary};
    }
`;

/**
 * Image wrapper for the right-side illustration.
 */
export const ImageWrapper = styled.div<{ $visible: boolean }>`
    width: 40%;
    margin: -5rem auto 0;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeInScale};
            animation-delay: 0.4s;
        `}

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        margin: 0 auto;
        max-height: 40rem;
    `}
`;
