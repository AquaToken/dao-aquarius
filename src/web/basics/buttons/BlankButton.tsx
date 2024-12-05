import styled from 'styled-components';

import { COLORS } from 'web/styles';

const BlankButton = styled.button.attrs<{ type?: 'button' | 'submit' | 'reset'; as?: string }>(
    ({ type, as }) => ({
        type: type || (as ? undefined : 'button'),
    }),
)`
    background: none;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    text-align: inherit;
    padding: 0;
    margin: 0;
    -webkit-tap-highlight-color: transparent;

    border: 0.2rem solid ${COLORS.transparent};

    &:focus {
        border: 0.2rem solid ${COLORS.focusColor};
    }
`;

export default BlankButton;
