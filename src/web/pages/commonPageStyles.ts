import styled from 'styled-components';

import { commonSectionPaddings } from 'web/mixins';
import { COLORS, MAX_WIDTHS } from 'web/styles';

export const PageContainer = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    flex-direction: column;
    scroll-behavior: smooth;
    background-color: ${props => props.$color || COLORS.transparent};
`;

export const SectionWrapper = styled.div<{ $color: string; $isWide: boolean }>`
    max-width: ${props => (props.$isWide ? MAX_WIDTHS.wide : MAX_WIDTHS.common)};
    background-color: ${props => props.$color || COLORS.transparent};
    ${commonSectionPaddings};
`;
