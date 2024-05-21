import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { respondDown } from '../../../../common/mixins';
import Button from '../../../../common/basics/Button';

const Container = styled.section`
    width: 100%;
    background-color: ${COLORS.purple};
    display: flex;
    justify-content: center;
    flex: auto;
    position: relative;
    min-height: 0;
    margin-bottom: 7rem;
`;

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    max-width: 142rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 1.6rem;
        max-width: 55rem;
    `}
`;

const Title = styled.div`
    font-weight: bold;
    font-size: 2rem;
    line-height: 9.4rem;
    color: ${COLORS.white};

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
        line-height: 2rem;
    `}
`;

const Testnet = () => {
    const goToTestnet = () => {
        window.open('https://testnet.aqua.network', '_blank');
    };
    return (
        <Container>
            <Wrapper>
                <div>
                    <Title>Preview the new generation of Aquarius AMM, built with Soroban. </Title>
                </div>
                <Button isWhite onClick={() => goToTestnet()}>
                    Try on Testnet
                </Button>
            </Wrapper>
        </Container>
    );
};

export default Testnet;
