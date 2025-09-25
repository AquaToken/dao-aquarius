import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { cardBoxShadow, flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import BlankButton from './BlankButton';

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
//TODO: LINK OR BUTTON???
const CircleButtonContainer = styled(BlankButton)`
    ${flexAllCenter};
    height: 4.8rem;
    width: 4.8rem;
    border-radius: 50%;
    border: none;
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    cursor: pointer;
    transition: all ease 200ms;
    color: ${COLORS.purple500};

    &:hover {
        background-color: ${COLORS.gray50};
    }

    &:active {
        transform: scale(0.9);
    }
`;

const Label = styled.span`
    margin-left: 1.6rem;
    color: ${COLORS.textTertiary};
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLDivElement> {
    children: string | React.ReactNode;
    label?: string;
    to?: string;
}

const CircleButton = ({ children, label, to, ...props }: ButtonProps): React.ReactNode => {
    const Wrapper = (to ? WrapperLink : WrapperDiv) as React.ElementType;

    return (
        <Wrapper to={to} {...props}>
            <CircleButtonContainer>{children}</CircleButtonContainer>
            {Boolean(label) && <Label>{label}</Label>}
        </Wrapper>
    );
};

export default CircleButton;
