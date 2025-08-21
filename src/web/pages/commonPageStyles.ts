import styled from 'styled-components';

import { commonSectionPaddings } from 'web/mixins';
import { COLORS, MAX_WIDTHS } from 'web/styles';

export const PageContainer = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    scroll-behavior: smooth;
`;

export const SectionWrapper = styled.div<{ $color: string }>`
    max-width: ${MAX_WIDTHS.medium};
    background-color: ${props => props.$color || COLORS.white};
    ${commonSectionPaddings};
`;
