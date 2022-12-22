import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../../common/styles';
import Fail from '../../../../../common/assets/img/icon-fail-white.svg';

const Container = styled.div`
    display: flex;
    align-items: center;
    height: 30px;
    padding: 0 1.6rem 0 0.8rem;
    background: ${COLORS.pinkRed};
    border-radius: 45px;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.white};

    svg {
        margin-right: 1.1rem;
    }
`;

const NotEligible = () => {
    return (
        <Container>
            <Fail />
            Not eligible for airdrop
        </Container>
    );
};

export default NotEligible;
