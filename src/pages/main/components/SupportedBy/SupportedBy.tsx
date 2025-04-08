import * as React from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Freighter from 'assets/freighter-dark.svg';
import HotWalletIcon from 'assets/hot-wallet.svg';
import Lobstr from 'assets/lobstr-name-logo.svg';
import StellarTerm from 'assets/stellarterm-logo.svg';
import StellarX from 'assets/stellarx-logo.svg';

const Container = styled.section`
    display: flex;
    justify-content: center;
    flex: auto;
    position: relative;
    min-height: 0;
    margin-top: 15rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 8rem;
    `}
`;

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    max-width: 142rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.lg)`
        padding: 0 1.6rem;
        max-width: 55rem;
        flex-direction: column;
        align-items: flex-start;
    `}
`;

const Title = styled.span`
    font-size: 1.6rem;
    line-height: 1.9rem;
    color: ${COLORS.placeholder};

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2.3rem;
    `}
`;

const ImageBlock = styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    max-width: 108rem;
    align-items: center;

    ${respondDown(Breakpoints.lg)`
        width: 100%;
        justify-content: space-between;
        flex-wrap: wrap;
        
        svg {
            width: 14.3rem;
            margin-bottom: 2rem;
            margin-right: auto;
            margin-left: auto;
        }
    `}
`;

const HotWallet = styled(HotWalletIcon)`
    width: 19.5rem;

    ${respondDown(Breakpoints.lg)`
        width: 14rem;
    `}
`;

const SupportedBy = () => (
    <Container>
        <Wrapper>
            <Title>Supported by:</Title>

            <ImageBlock>
                <a href="https://lobstr.co/" target="_blank" rel="noreferrer">
                    <Lobstr />
                </a>

                <a href="https://www.stellarx.com/" target="_blank" rel="noreferrer">
                    <StellarX />
                </a>

                <a href="https://www.freighter.app/" target="_blank" rel="noreferrer">
                    <Freighter />
                </a>

                <a href="https://stellarterm.com/" target="_blank" rel="noreferrer">
                    <StellarTerm />
                </a>

                <a href="https://stellarterm.com/" target="_blank" rel="noreferrer">
                    <HotWallet />
                </a>
            </ImageBlock>
        </Wrapper>
    </Container>
);

export default SupportedBy;
