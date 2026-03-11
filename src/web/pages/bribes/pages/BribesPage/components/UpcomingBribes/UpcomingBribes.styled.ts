import styled from 'styled-components';

import Asset from 'basics/Asset';
import { ToggleGroup } from 'basics/inputs';
import Select from 'basics/inputs/Select';

import { EmptyList, flexAllCenter, flexColumn, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

export const Container = styled.div`
    ${flexColumn};
`;

export const WebAsset = styled(Asset)`
    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

export const MobileAsset = styled(Asset)`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

export const LoaderContainer = styled.div`
    ${flexAllCenter};
    margin: 5rem 0;
`;

export const SelectStyled = styled(Select)`
    display: none;
    margin-bottom: 3rem;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

export const Empty = styled.div`
    ${EmptyList};
`;

export const Filters = styled.div`
    display: flex;
    gap: 3.2rem;
    align-items: center;
    margin-bottom: 5rem;
    padding-top: 3.2rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: flex-start;
    `}

    ${respondDown(Breakpoints.sm)`
        gap: 1.6rem;
    `}
`;

export const Amounts = styled.div`
    ${flexColumn};

    span:nth-child(2) {
        ${FONT_SIZE.xs};
        color: ${COLORS.textGray};
    }
`;

export const ToggleGroupWeb = styled(ToggleGroup)`
    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

export const LabelMobile = styled.span`
    display: none;

    ${respondDown(Breakpoints.sm)`
        display: inline;
    `}
`;

export const SelectMobile = styled(Select)`
    display: none;

    ${respondDown(Breakpoints.sm)`
        display: flex;
        height: 4.4rem;
        min-height: 4.4rem;
    `}
`;
