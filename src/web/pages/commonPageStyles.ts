import styled from 'styled-components';

import { commonSectionPaddings, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, MAX_WIDTHS } from 'web/styles';

export const PageContainer = styled.main<{
    $color?: string;
    $mobileColor?: string;
    $mobileBreakpoint?: Breakpoints;
}>`
    display: flex;
    align-items: center;
    flex-direction: column;
    scroll-behavior: smooth;
    background-color: ${props => props.$color || COLORS.transparent};
    flex: 1 0 auto;

    ${({ $mobileBreakpoint }) => respondDown($mobileBreakpoint ?? Breakpoints.sm)`
        background-color: ${props => props.$mobileColor || COLORS.transparent};
    `}
`;

export const SectionWrapper = styled.div<{ $color: string; $isWide: boolean }>`
    max-width: ${props => (props.$isWide ? MAX_WIDTHS.wide : MAX_WIDTHS.common)};
    background-color: ${props => props.$color || COLORS.transparent};
    ${commonSectionPaddings};
`;
