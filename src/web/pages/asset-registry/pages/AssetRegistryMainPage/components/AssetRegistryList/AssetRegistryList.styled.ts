import styled from 'styled-components';

import { cardBoxShadow } from 'styles/mixins';
import { COLORS, FONT_SIZE } from 'styles/style-constants';

export const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
`;

export const EmptyState = styled.div`
    ${cardBoxShadow};
    ${FONT_SIZE.md};
    padding: 3.2rem;
    background: ${COLORS.white};
    border-radius: 3.2rem;
    color: ${COLORS.textGray};
`;
