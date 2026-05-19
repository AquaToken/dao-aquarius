import styled from 'styled-components';

import { Select } from 'basics/inputs';

import { flexColumn, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Title = styled.h3`
    margin-bottom: 2.4rem;
`;

export const Filters = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
    margin-bottom: 2.4rem;
`;

export const FiltersRow = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.6rem;

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 1fr;
    `}
`;

export const CompactSelect = styled(Select)`
    min-height: 4.8rem;
    font-size: 1.6rem;

    & > div:first-of-type {
        min-height: 4.8rem;
        padding: 0 4.8rem 0 1.6rem;
    }

    & > svg {
        right: 0.8rem;
    }
`;

export const Amounts = styled.span`
    font-size: 1.4rem;
    ${flexColumn};
    justify-content: center;

    ${respondDown(Breakpoints.md)`
        text-align: right;
        align-items: flex-end;
    `}
`;

export const ExplorerIconLink = styled.a`
    display: inline-flex;
    align-items: center;
    color: ${COLORS.textPrimary};
`;
