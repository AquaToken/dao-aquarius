import styled from 'styled-components';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

export const Container = styled.div`
    position: relative;
    width: 2.4rem;
    height: 2.4rem;
    min-width: 2.4rem;
`;

export const ActionBadge = styled.div<{ $isRemove: boolean }>`
    ${flexAllCenter};
    position: absolute;
    left: 1.3rem;
    top: 1.3rem;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%;
    color: ${({ $isRemove }) => ($isRemove ? COLORS.red700 : COLORS.green900)};

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: ${COLORS.white};
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0.1rem;
        border-radius: 50%;
        background: ${({ $isRemove }) => ($isRemove ? COLORS.red50 : COLORS.green50)};
    }
`;

export const ActionIcon = styled.div`
    ${flexAllCenter};
    position: absolute;
    left: 50%;
    top: 50%;
    width: 0.6rem;
    height: 0.6rem;
    transform: translate(-50%, -50%);
    z-index: 1;

    svg {
        display: block;
        flex-shrink: 0;
    }
`;
