import styled from 'styled-components';

import { cardBoxShadow, flexAllCenter, flexColumn } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

export const CenteredWrapper = styled.div`
    ${flexAllCenter};
    overflow-x: hidden;
`;

export const Container = styled.div`
    ${cardBoxShadow};
    ${flexColumn};
    background-color: ${COLORS.white};
    width: 62.4rem;
    margin-top: 14.4rem;
    margin-bottom: 18rem;
    padding: 4.8rem;
`;
