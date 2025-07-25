import styled from 'styled-components';

import { customScroll, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

export const ModalWrapper = styled.div<{ $isWide?: boolean; $width?: string }>`
    width: ${({ $isWide, $width }) => $width ?? ($isWide ? '75.2rem' : '52.3rem')};

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const ModalTitle = styled.h3`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.8rem;
    font-weight: normal;

    ${respondDown(Breakpoints.md)`
        font-size: 2rem;
        line-height: 2.6rem;
    `};
`;

export const ModalDescription = styled.div<{ $smallMarginBottom?: boolean }>`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    margin-bottom: ${({ $smallMarginBottom }) => ($smallMarginBottom ? '2.4rem' : '4rem')};

    overflow-y: scroll;
    ${customScroll};

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2.4rem;
    `};
`;
