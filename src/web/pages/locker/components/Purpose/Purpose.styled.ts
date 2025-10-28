import styled from 'styled-components';

import LockerMainImage from 'assets/locker/locker-main.svg';

import CircleButton from 'basics/buttons/CircleButton';

import {
    fadeInScale,
    fadeInUpAnimation,
    fadeInUpDelayed,
    containerScrollAnimation,
} from 'styles/animations';
import { commonMaxWidth, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

/* -------------------------------------------------------------------------- */
/*                                  Layout                                    */
/* -------------------------------------------------------------------------- */

/**
 * Section wrapper (gray background).
 */
export const Container = styled.div`
    background-color: ${COLORS.gray50};
`;

/**
 * Main content block — contains text and image.
 * Uses containerScrollAnimation for fade/translateY on scroll.
 */
export const Content = styled.div<{ $visible: boolean }>`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    ${commonMaxWidth};
    padding: 0 4rem;

    ${containerScrollAnimation}

    ${respondDown(Breakpoints.sm)`
    flex-direction: column;
    padding: 0 1.6rem;
    gap: 1.6rem;
  `}
`;

/**
 * Locker image (right side).
 * Scales in with fade animation when visible.
 */
export const Image = styled(LockerMainImage)<{ $visible: boolean }>`
    max-height: 70vh;
    margin: auto -5% auto auto;
    opacity: 0;

    ${({ $visible }) => $visible && fadeInScale};

    ${respondDown(Breakpoints.lg)`
    max-height: 50rem;
  `}

    ${respondDown(Breakpoints.md)`
    max-height: 30rem;
    margin: auto;
  `}
`;

/**
 * Text content area (title + description + button).
 */
export const TextContainer = styled.div<{ $visible: boolean }>`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin-right: 6.2rem;
    flex: 1;
    justify-content: center;
    padding: 5% 0;
    max-width: 45rem;

    ${({ $visible }) => $visible && fadeInUpAnimation};

    ${respondDown(Breakpoints.md)`
    width: 100%;
    margin-right: 0;
    max-width: unset;
  `}
`;

/**
 * Section title.
 */
export const Title = styled.span<{ $visible: boolean }>`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 1.6rem;

    ${({ $visible }) => $visible && fadeInUpDelayed};

    ${respondDown(Breakpoints.md)`
    ${FONT_SIZE.xl};
  `}
`;

/**
 * Section description text.
 */
export const Description = styled.span<{ $visible: boolean }>`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textDark};
    ${({ $visible }) => $visible && fadeInUpDelayed};
`;

/**
 * Styled circle button (back to locker).
 */
export const BackButton = styled(CircleButton)`
    margin-bottom: 4.5rem;

    ${respondDown(Breakpoints.md)`
    margin-bottom: 3.2rem;
  `}
`;
