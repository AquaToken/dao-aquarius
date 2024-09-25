import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

const WrapperDiv = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
`;

const WrapperLink = styled(Link)`
    display: flex;
    align-items: center;
    text-decoration: none;
    cursor: pointer;
`;

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

const Label = styled.span`
    margin-left: 1.6rem;
    color: ${COLORS.paragraphText};
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
    children: string | JSX.Element;
    label?: string;
    to?: string;
}

const CircleButton = ({ children, label, to, ...props }: ButtonProps): JSX.Element => {
    const Wrapper = (to ? WrapperLink : WrapperDiv) as React.ElementType;

    return (
        <Wrapper to={to} {...props}>
            <CircleButtonContainer>{children}</CircleButtonContainer>
            {Boolean(label) && <Label>{label}</Label>}
        </Wrapper>
    );
};

export default CircleButton;
