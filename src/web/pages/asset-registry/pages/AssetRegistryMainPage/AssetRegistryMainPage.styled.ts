import styled from 'styled-components';

import { ToggleGroup } from 'basics/inputs';

import { commonMaxWidth, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

export const MainSection = styled.section`
    ${commonMaxWidth};
    width: 100%;
    box-sizing: border-box;
    padding: 6.4rem 4rem 9.6rem;

    ${respondDown(Breakpoints.md)`
        padding: 4rem 1.6rem 6.4rem;
    `}
`;

export const Title = styled.h1`
    ${FONT_SIZE.xxl};
    margin: 0;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.sm)`
        ${FONT_SIZE.xl};
    `}
`;

export const Toolbar = styled.div`
    ${flexRowSpaceBetween};
    gap: 2.4rem;
    margin-top: 4rem;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: stretch;
        margin-top: 3.2rem;
    `}
`;

export const FilterGroup = styled(ToggleGroup)`
    width: fit-content;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const SearchInputWrap = styled.div`
    width: 33rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;
