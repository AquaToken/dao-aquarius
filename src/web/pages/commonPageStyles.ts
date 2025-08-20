import styled from 'styled-components';

import { COLORS } from 'web/styles';

export const PageContainer = styled.div<{ $withoutPadding: boolean }>`
    padding: ${props => (props.$withoutPadding ? '0' : '0 2.4rem')};
    display: flex;
    align-items: center;
    flex-direction: column;
    scroll-behavior: smooth;
    background-color: ${COLORS.white};
`;
