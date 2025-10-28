import styled, { css } from 'styled-components';

import IconCheck16 from 'assets/icons/small-icons/check/icon-check-16.svg';
import HeroBackground from 'assets/main-page/hero-background.png';

import {
    containerScrollAnimation,
    fadeAppearAnimation,
    slideUpSoftAnimation,
} from 'styles/animations';
import { fullWidthSectionStyles, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, MAX_WIDTHS, PAGE_PADDINGS } from 'styles/style-constants';

export type TabKey = 'stable' | 'volatile';

export const Wrapper = styled.section<{ $visible: boolean }>`
    ${fullWidthSectionStyles};
    max-width: ${MAX_WIDTHS.common};
    position: relative;
    overflow: hidden;
    background: url(${HeroBackground}) no-repeat center center / cover;
    color: ${COLORS.white};
    border-radius: 48px;
    padding: 6rem;
    display: flex;
    flex-direction: column;
    margin-top: 11rem;
    ${containerScrollAnimation};

    svg {
        z-index: 0;
    }

    & > div {
        z-index: 1;
    }

    ${respondDown(Breakpoints.md)`
    padding: 4rem;
    margin-top: 9rem;
  `}

    ${respondDown(Breakpoints.sm)`margin-top: 6rem;`};
    ${respondDown(Breakpoints.xs)`
    margin-top: 4rem;
    border-radius: 0;
    padding: 6rem ${PAGE_PADDINGS}rem;
  `}
`;

export const TitleBlocks = styled.div<{ $visible: boolean }>`
    display: flex;
    align-items: center;
    gap: 6rem;
    width: 100%;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.1s;
        `}

    ${respondDown(Breakpoints.md)`flex-direction: column; gap: 2rem;`};
`;

export const Title = styled.div`
    font-size: 3.5rem;
    line-height: 5.4rem;

    ${respondDown(Breakpoints.sm)`
    font-size: 3rem;
    line-height: 5.2rem;
  `}

    ${respondDown(Breakpoints.xs)`
    font-size: 2.4rem;
    line-height: 3.6rem;
  `}
`;

export const Block = styled.div`
    display: flex;
    width: calc(50% - 3rem);
    ${respondDown(Breakpoints.md)`width: 100%;`};
`;

export const CheckboxesBlock = styled(Block)`
    flex-direction: column;
    gap: 0.8rem;
`;

export const CheckBoxRow = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.6rem;
    line-height: 180%;
    gap: 0.8rem;

    ${respondDown(Breakpoints.xs)`line-height: 150%;`};
`;

export const IconCheck = styled(IconCheck16)`
    color: ${COLORS.white};
`;

export const TabsBlock = styled.div<{ $visible: boolean }>`
    display: flex;
    flex-direction: column;
    margin-top: 9rem;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeAppearAnimation};
            animation-delay: 0.3s;
        `}

    ${respondDown(Breakpoints.md)`margin-top: 7rem;`};
    ${respondDown(Breakpoints.sm)`margin-top: 6rem;`};
    ${respondDown(Breakpoints.xs)`margin-top: 4rem;`};
`;

export const Tabs = styled.div`
    display: flex;
    gap: 4rem;
    position: relative;
    padding-bottom: 1rem;
    width: fit-content;
`;

export const TabBtn = styled.button<{ active?: boolean }>`
    position: relative;
    appearance: none;
    background: transparent;
    border: 0;
    font-size: 1.8rem;
    line-height: 180%;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: ${({ active }) => (active ? 1 : 0.5)};
    color: ${({ active }) => (active ? COLORS.purple200 : COLORS.white)};

    &:hover {
        transform: scale(1.1);
    }

    ${respondDown(Breakpoints.xs)`font-size: 1.4rem;`};
`;

export const Underline = styled.div<{ active: TabKey }>`
    position: absolute;
    left: ${({ active }) => (active === 'stable' ? 0 : 'inherit')};
    right: ${({ active }) => (active === 'volatile' ? 0 : 'inherit')};
    bottom: 0;
    height: 0.4rem;
    width: calc(50% - 2rem);
    background: ${COLORS.purple200};
    transition: all 0.3s ease;
`;

export const UnderlineBack = styled.div`
    position: absolute;
    bottom: 0;
    height: 0.4rem;
    width: 100%;
    background: ${COLORS.white};
    opacity: 0.2;
`;

export const Badge = styled.span<{ tone?: 'stable' | 'volatile' }>`
    text-transform: uppercase;
    display: inline-block;
    margin-top: 4.6rem;
    margin-bottom: 0.6rem;
    padding: 0.4rem 0.8rem;
    font-size: 1.2rem;
    border-radius: 0.7rem;
    font-weight: 700;
    color: ${({ tone }) => (tone === 'stable' ? COLORS.blue300 : COLORS.orange300)};
    border: 0.2rem solid ${({ tone }) => (tone === 'stable' ? COLORS.blue300 : COLORS.orange300)};

    ${respondDown(Breakpoints.sm)`margin-top: 3.2rem;`};
`;

export const ContentTitle = styled.div`
    font-size: 3.5rem;
    line-height: 5.4rem;

    ${respondDown(Breakpoints.sm)`
    font-size: 3rem;
    line-height: 5.2rem;
  `}

    ${respondDown(Breakpoints.xs)`
    font-size: 2.4rem;
    line-height: 3.6rem;
  `}
`;
