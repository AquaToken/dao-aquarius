import styled from 'styled-components';

import { COLORS } from 'web/styles';

const BlankInput = styled.input`
    background: none;
    border: none;
    padding: 0;
    border-radius: 0;
    width: 100%;

    &:focus {
        border: 0.2rem solid ${COLORS.focusColor};
    }
`;

export default BlankInput;
