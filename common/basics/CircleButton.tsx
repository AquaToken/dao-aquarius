import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

const CircleButtonContainer = styled.div`
    ${flexAllCenter};
    height: 4.8rem;
    width: 4.8rem;
    border-radius: 50%;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    cursor: pointer;
`;

const CircleButton = ({ children }: { children: JSX.Element }): JSX.Element => {
    return <CircleButtonContainer>{children}</CircleButtonContainer>;
};

export default CircleButton;
