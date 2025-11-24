import styled from 'styled-components';

import { commonMaxWidth } from 'styles/mixins';

export const MainBlock = styled.main`
    flex: 1 0 auto;
`;

export const MainSection = styled.div`
    ${commonMaxWidth};
    width: 100%;
`;
