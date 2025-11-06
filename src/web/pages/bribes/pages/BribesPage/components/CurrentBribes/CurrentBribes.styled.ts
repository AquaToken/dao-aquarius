import styled from 'styled-components';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

export const LoaderContainer = styled.div`
    ${flexAllCenter};
    margin: 5rem 0;
`;

export const Apy = styled.span`
    border-bottom: 0.1rem dashed ${COLORS.purple500};
    line-height: 2rem;
`;
