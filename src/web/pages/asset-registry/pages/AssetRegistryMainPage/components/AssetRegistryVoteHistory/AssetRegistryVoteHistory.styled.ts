import styled from 'styled-components';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

export const Header = styled.div`
    margin-bottom: 2rem;
`;

export const VoteTitle = styled.h3`
    ${FONT_SIZE.lg};
    margin: 0;
    color: ${COLORS.textPrimary};
    font-weight: 700;

    ${respondDown(Breakpoints.md)`
        ${FONT_SIZE.md};
    `}
`;

export const HistoryTable = styled.div`
    width: 100%;
`;

export const Value = styled.div`
    ${FONT_SIZE.md};
    color: ${COLORS.textSecondary};
    font-weight: 400;
`;
