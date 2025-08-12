import styled from 'styled-components';

import { customScroll, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

export const ModalWrapper = styled.div<{ $isWide?: boolean; $width?: string }>`
    width: ${({ $isWide, $width }) => $width ?? ($isWide ? '75.2rem' : '52.3rem')};
    padding: 0 1rem;
    overflow-y: scroll;
    overflow-x: hidden;
    ${customScroll};

    max-height: calc(95vh - 11.2rem); // 11.2rem = 6.4rem top padding + 4.8rem bottom margin

    ${respondDown(Breakpoints.md)`
        width: 100%;
        max-height: calc(95vh - 2rem);
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

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2.4rem;
    `};
`;

export const StickyButtonWrapper = styled.div`
    position: sticky;
    bottom: 0;
    padding: 10px 20px;
    background: ${COLORS.white};
    z-index: 10;
`;
