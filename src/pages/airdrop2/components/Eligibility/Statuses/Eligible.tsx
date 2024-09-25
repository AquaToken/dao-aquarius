import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../../common/styles';
import Success from 'assets/icon-success-white.svg';

const Container = styled.div`
    display: flex;
    align-items: center;
    height: 30px;
    padding: 0 1.6rem 0 0.8rem;
    background: linear-gradient(
        300.06deg,
        ${COLORS.buttonBackground} -19.81%,
        ${COLORS.tooltip} 141.52%
    );
    border-radius: 45px;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.white};

    svg {
        margin-right: 1.1rem;
    }
`;

const Eligible = () => {
    return (
        <Container>
            <Success />
            Eligible for airdrop
        </Container>
    );
};

export default Eligible;
