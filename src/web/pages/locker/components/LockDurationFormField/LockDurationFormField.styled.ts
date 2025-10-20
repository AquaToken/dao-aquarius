import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 3.2rem 4rem;
    background-color: ${COLORS.gray50};
    border-radius: 4rem;
    justify-content: space-between;

    ${respondDown(Breakpoints.sm)`
        padding: 3.2rem 1.6rem;
    `}
`;
