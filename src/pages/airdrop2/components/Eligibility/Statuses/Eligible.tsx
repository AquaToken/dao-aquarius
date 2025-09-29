import * as React from 'react';
import styled from 'styled-components';

import { COLORS } from 'web/styles';

import Success from 'assets/icons/status/success-white-14.svg';

const Container = styled.div`
    display: flex;
    align-items: center;
    height: 30px;
    padding: 0 1.6rem 0 0.8rem;
    background: linear-gradient(
        300.06deg,
        ${COLORS.purple950} -19.81%,
        ${COLORS.purple400} 141.52%
    );
    border-radius: 45px;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.white};

    svg {
        margin-right: 1.1rem;
    }
`;

const Eligible = () => (
    <Container>
        <Success />
        Eligible for airdrop
    </Container>
);

export default Eligible;
