import styled from 'styled-components';

import { COLORS } from 'web/styles';

export const CalendarButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.6rem;
    border-radius: 3.8rem;
    height: 4.8rem;
    width: 8rem;
    border: 0.1rem solid ${COLORS.gray100};
    background-color: ${COLORS.white};
    cursor: pointer;

    &:hover {
        border: 0.1rem solid ${COLORS.purple500};
    }
`;
