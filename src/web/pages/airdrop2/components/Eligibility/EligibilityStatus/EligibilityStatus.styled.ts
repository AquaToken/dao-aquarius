import styled from 'styled-components';

import { COLORS } from 'styles/style-constants';

export const Container = styled.div<{ $bg: string }>`
    display: flex;
    align-items: center;
    height: 3rem;
    padding: 0 1.6rem 0 0.8rem;
    background: ${({ $bg }) => $bg};
    border-radius: 4.5rem;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.white};

    svg {
        margin-right: 1.1rem;
    }
`;
