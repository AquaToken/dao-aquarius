import styled from 'styled-components';

import { cardBoxShadow, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Form = styled.form<{ $isEmbedded?: boolean }>`
    margin: 0 auto 2rem;
    width: ${({ $isEmbedded }) => ($isEmbedded ? '100%' : '48rem')};
    border-radius: 4rem;
    background: ${COLORS.white};
    padding: ${({ $isEmbedded }) => ($isEmbedded ? '0' : '1.6rem')};
    ${({ $isEmbedded }) => !$isEmbedded && cardBoxShadow};
    position: relative;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        padding: ${({ $isEmbedded }) => ($isEmbedded ? '0' : '6.6rem 0.8em 2rem')};
        box-shadow: unset;
    `};
`;
