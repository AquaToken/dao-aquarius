import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../../../common/styles';

const ButtonBody = styled.button<{ isVoteFor?: boolean }>`
    display: flex;
    align-items: center;
    height: 6.6rem;
    width: 100%;
    padding: 2.1rem 3.4rem 2.1rem 2.1rem;

    font-size: 1.6rem;
    line-height: 2.4rem;

    color: ${COLORS.white};

    background-color: ${({ isVoteFor }) => (isVoteFor ? COLORS.pinkRed : COLORS.purple)};

    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all ease 200ms;

    &:hover {
        opacity: 0.8;
    }

    &:active {
        transform: scale(0.9);
    }

    &:disabled {
        background-color: ${COLORS.gray};
        color: ${COLORS.placeholder};
        pointer-events: none;
    }
`;

interface VotingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    isVoteFor?: boolean;
}

const VotingButton = ({ isVoteFor, children, ...props }: VotingButtonProps): JSX.Element => {
    return (
        <ButtonBody isVoteFor={isVoteFor} {...props}>
            {children}
        </ButtonBody>
    );
};

export default VotingButton;
