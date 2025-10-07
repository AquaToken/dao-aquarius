import styled, { css } from 'styled-components';

import { slideUpSoftAnimation, containerScrollAnimation } from 'web/animations';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Aqua from 'assets/aqua/aqua-logo.svg';
import Ice from 'assets/tokens/ice-logo.svg';

/* -------------------------------------------------------------------------- */
/*                                  Layout                                    */
/* -------------------------------------------------------------------------- */

/**
 * Container for all statistic cards.
 * Fades and slides in on scroll using containerScrollAnimation.
 */
export const Container = styled.div<{ $visible: boolean }>`
    display: flex;
    flex-wrap: wrap;
    padding: 4rem;
    margin-top: 6rem;
    gap: 6rem;
    width: 100%;
    background-color: ${COLORS.white};

    ${containerScrollAnimation}

    ${respondDown(Breakpoints.sm)`
    padding: 1.6rem;
  `}
`;

/**
 * Single statistic card — animates softly upward with delay.
 */
export const StatisticItem = styled.div<{ $visible: boolean; $delay: number }>`
    display: flex;
    flex-direction: column;
    padding: 3.6rem 3.9rem;
    background: ${COLORS.gray50};
    border-radius: 4.4rem;
    flex: 1 1 20rem;
    opacity: 0;

    ${({ $visible, $delay }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: ${$delay}s;
        `}

    ${respondDown(Breakpoints.sm)`
    flex: 1 1 100%;
    width: 100%;
    padding: 3.2rem 1.6rem;
  `};
`;

/**
 * Block containing token icons (AQUA / ICE).
 */
export const IconsBlock = styled.div`
    display: flex;
    margin-bottom: 1.6rem;

    svg:nth-child(2) {
        margin-left: -1.2rem;
    }
`;

/**
 * AQUA token icon.
 */
export const AquaLogo = styled(Aqua)`
    width: 5rem;
    height: 5rem;
    z-index: 1;
`;

/**
 * ICE token icon.
 */
export const IceLogo = styled(Ice)`
    width: 5rem;
    height: 5rem;
`;

/**
 * Big number displaying token amount.
 */
export const Amount = styled.span`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 0.6rem;
`;

/**
 * Description text under each amount.
 */
export const Description = styled.span`
    font-size: 1.8rem;
    line-height: 3.2rem;
    color: ${COLORS.textDark};
`;
