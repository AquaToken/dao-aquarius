import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles';
import { flexAllCenter } from '../mixins';
import Success from '../assets/img/icon-success.svg';
import Fail from '../assets/img/icon-fail.svg';
import Pending from '../assets/img/icon-pending.svg';

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

export const IconSuccess = ({ isBig }: { isBig?: boolean }): JSX.Element => {
    return (
        <IconBlock $isBig={isBig}>
            <Success />
        </IconBlock>
    );
};

export const IconFail = ({ isBig }: { isBig?: boolean }): JSX.Element => {
    return (
        <IconBlock $isBig={isBig}>
            <Fail />
        </IconBlock>
    );
};

export const IconPending = ({ isBig }: { isBig?: boolean }): JSX.Element => {
    return (
        <IconBlock $isBig={isBig}>
            <Pending />
        </IconBlock>
    );
};

export const IconSort = ({
    isEnabled,
    isReversed,
}: {
    isEnabled: boolean;
    isReversed: boolean;
}): JSX.Element => {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5 7L8 4L11 7"
                stroke={!isEnabled || isReversed ? COLORS.grayText : COLORS.transparent}
            />
            <path
                d="M11 9L8 12L5 9"
                stroke={!isEnabled || !isReversed ? COLORS.grayText : COLORS.transparent}
            />
        </svg>
    );
};
