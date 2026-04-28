import styled from 'styled-components';

import { respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

export const Layout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 32rem;
    gap: 3.2rem;

    ${respondDown(Breakpoints.lg)`
        grid-template-columns: 1fr;
    `}
`;

export const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;
