import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles';
import { flexAllCenter } from '../mixins';
import Success from '../assets/img/icon-success.svg';
import Fail from '../assets/img/icon-fail.svg';
import Pending from '../assets/img/icon-pending.svg';

const IconBlock = styled.div`
    height: 4rem;
    width: 4rem;
    border-radius: 50%;
    background-color: #${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    ${flexAllCenter};

    svg {
        height: 1.6rem;
        width: 1.6rem;
    }
`;

export const IconSuccess = (): JSX.Element => {
    return (
        <IconBlock>
            <Success />
        </IconBlock>
    );
};

export const IconFail = (): JSX.Element => {
    return (
        <IconBlock>
            <Fail />
        </IconBlock>
    );
};

export const IconPending = (): JSX.Element => {
    return (
        <IconBlock>
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
