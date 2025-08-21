import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Freighter from 'assets/freighter-dark.svg';
import HotWallet from 'assets/hot-wallet.svg';
import LobstrIcon from 'assets/lobstr-name-logo.svg';
import StellarTermIcon from 'assets/stellarterm-logo.svg';
import StellarXIcon from 'assets/stellarx-logo.svg';

const Wrapper = styled.section`
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: 8rem;
    gap: 2.4rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 3.2rem;
        flex-direction: column;
    `}
`;

const Title = styled.span`
    font-size: 1.6rem;
    color: ${COLORS.placeholder};
    display: none;

    ${respondDown(Breakpoints.md)`
        
        display: block;
    `}
`;

const FlexTitle = styled(Title)`
    display: flex;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const ImageBlock = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6.4rem;
    align-items: center;
    justify-content: center;
    padding: 16px 0;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        gap: 3.2rem;
    `}
`;

const FreighterIcon = styled(Freighter)`
    height: 2.4rem;
`;

const HotWalletIcon = styled(HotWallet)`
    height: 2.4rem;
`;

const SupportedWallets = () => (
    <Wrapper>
        <Title>Supported by:</Title>

        <ImageBlock>
            <FlexTitle>Supported by:</FlexTitle>

            <a href="https://lobstr.co/" target="_blank" rel="noreferrer">
                <LobstrIcon />
            </a>

            <a href="https://www.stellarx.com/" target="_blank" rel="noreferrer">
                <StellarXIcon />
            </a>

            <a href="https://www.freighter.app/" target="_blank" rel="noreferrer">
                <FreighterIcon />
            </a>

            <a href="https://stellarterm.com/" target="_blank" rel="noreferrer">
                <StellarTermIcon />
            </a>

            <a href="https://hot-labs.org/" target="_blank" rel="noreferrer">
                <HotWalletIcon />
            </a>
        </ImageBlock>
    </Wrapper>
);

export default SupportedWallets;
