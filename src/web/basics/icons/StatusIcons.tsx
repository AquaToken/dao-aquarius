import * as React from 'react';
import styled from 'styled-components';

import Fail from 'assets/icons/status/fail-red.svg';
import Pending from 'assets/icons/status/pending.svg';
import Success from 'assets/icons/status/success.svg';

import { cardBoxShadow, flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const IconBlock = styled.div<{ $isBig?: boolean }>`
    height: ${({ $isBig }) => ($isBig ? '5.6rem' : '4rem')};
    width: ${({ $isBig }) => ($isBig ? '5.6rem' : '4rem')};
    min-height: ${({ $isBig }) => ($isBig ? '5.6rem' : '4rem')};
    min-width: ${({ $isBig }) => ($isBig ? '5.6rem' : '4rem')};
    border-radius: 50%;
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    ${flexAllCenter};

    svg {
        height: ${({ $isBig }) => ($isBig ? '3.4rem' : '2.4rem')};
        width: ${({ $isBig }) => ($isBig ? '3.4rem' : '2.4rem')};
    }
`;

export const IconSuccess = ({ isBig }: { isBig?: boolean }): React.ReactNode => (
    <IconBlock $isBig={isBig}>
        <Success />
    </IconBlock>
);

export const IconFail = ({ isBig }: { isBig?: boolean }): React.ReactNode => (
    <IconBlock $isBig={isBig}>
        <Fail />
    </IconBlock>
);

export const IconPending = ({ isBig }: { isBig?: boolean }): React.ReactNode => (
    <IconBlock $isBig={isBig}>
        <Pending />
    </IconBlock>
);
