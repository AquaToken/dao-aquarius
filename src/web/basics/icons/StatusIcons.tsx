import * as React from 'react';
import styled from 'styled-components';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import Fail from 'assets/icon-fail.svg';
import Pending from 'assets/icon-pending.svg';
import Success from 'assets/icon-success.svg';

const IconBlock = styled.div<{ $isBig?: boolean }>`
    height: ${({ $isBig }) => ($isBig ? '5.6rem' : '4rem')};
    width: ${({ $isBig }) => ($isBig ? '5.6rem' : '4rem')};
    min-height: ${({ $isBig }) => ($isBig ? '5.6rem' : '4rem')};
    min-width: ${({ $isBig }) => ($isBig ? '5.6rem' : '4rem')};
    border-radius: 50%;
    background-color: #${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
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
