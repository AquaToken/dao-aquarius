import styled from 'styled-components';

import FailIcon from 'assets/icons/status/fail-red.svg';

import BlankButton from 'basics/buttons/BlankButton';

import { COLORS } from 'styles/style-constants';

export const ResetButtonRoot = styled(BlankButton)`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    padding: 0;
    border: 0;
`;

export const ResetIcon = styled(FailIcon)`
    width: 1.6rem;
    height: 1.6rem;

    rect {
        fill: ${COLORS.gray100};
    }
`;
