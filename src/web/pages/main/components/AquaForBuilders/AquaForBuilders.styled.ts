import styled, { css } from 'styled-components';

import ArrowAlt16 from 'assets/icons/arrows/arrow-alt-16.svg';
import IconCheck16 from 'assets/icons/small-icons/check/icon-check-16.svg';

import { Button } from 'basics/buttons';

import {
    containerScrollAnimation,
    slideUpSoftAnimation,
    fadeAppearAnimation,
} from 'styles/animations';
import { flexAllCenter, fullWidthSectionStyles, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, PAGE_PADDINGS } from 'styles/style-constants';

export const Wrapper = styled.section<{ $visible: boolean }>`
    ${flexAllCenter};
    ${fullWidthSectionStyles};
    width: 100%;
    background-color: ${COLORS.gray50};
    margin-top: 11rem;
    padding: 5.6rem;
    border-radius: 4.8rem;
    ${containerScrollAnimation};

    ${respondDown(Breakpoints.md)`
        margin-top: 10rem;
        padding: 3.6rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 6rem;
        padding: 4rem 3rem;
    `}

    ${respondDown(Breakpoints.xs)`
        border-radius: 0;
        margin-top: 4rem;
        padding: 3.2rem ${PAGE_PADDINGS}rem;
    `}
`;

export const ShortWrapper = styled.div<{ $visible: boolean }>`
    max-width: 64rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeAppearAnimation};
            animation-delay: 0.1s;
        `}
`;

export const Title = styled.div<{ $visible: boolean }>`
    font-weight: 700;
    font-size: 3.5rem;
    line-height: 5.2rem;
    margin-top: 3.2rem;
    color: ${COLORS.textPrimary};
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.15s;
        `}

    ${respondDown(Breakpoints.sm)`
        font-size: 2.4rem;
        line-height: 3.6rem;
    `}
`;

export const Description = styled.div<{ $visible: boolean }>`
    font-weight: 500;
    font-size: 1.6rem;
    line-height: 180%;
    margin-top: 0.8rem;
    color: ${COLORS.gray550};
    text-align: center;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeAppearAnimation};
            animation-delay: 0.25s;
        `}

    ${respondDown(Breakpoints.xs)`
        font-size: 1.4rem;
    `}
`;

export const Benefits = styled.div<{ $visible: boolean }>`
    margin-top: 2.4rem;
    display: flex;
    gap: 2.4rem;
    font-weight: 500;
    font-size: 1.6rem;
    line-height: 180%;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.35s;
        `}

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
        font-size: 1.4rem;
        gap: 0.8rem;
    `}
`;

export const BenefitsItem = styled.div`
    ${flexAllCenter};
`;

export const IconCheck = styled(IconCheck16)`
    color: ${COLORS.purple500};
    margin-right: 0.6rem;
`;

export const DocsButton = styled(Button)<{ $visible: boolean }>`
    margin-top: 1.6rem;
    border-radius: 46px;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.45s;
        `}

    ${respondDown(Breakpoints.sm)`
        padding: 0 2.4rem;
        height: 4rem;
    `}

    ${respondDown(Breakpoints.xs)`
        width: 100%;
    `}
`;

export const ArrowAlt16Styled = styled(ArrowAlt16)`
    margin-left: 0.8rem;
    color: ${COLORS.white};
`;
