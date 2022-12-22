import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

const CircleButtonContainer = styled.button`
    ${flexAllCenter};
    height: 4.8rem;
    width: 4.8rem;
    border-radius: 50%;
    border: none;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    cursor: pointer;
    transition: all ease 200ms;
    color: ${COLORS.purple};

    &:hover {
        background-color: ${COLORS.lightGray};
    }

    &:active {
        transform: scale(0.9);
    }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: string | JSX.Element;
}

const CircleButton = ({ children, ...props }: ButtonProps): JSX.Element => {
    return <CircleButtonContainer {...props}>{children}</CircleButtonContainer>;
};

export default CircleButton;
