import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import Lobstr from 'assets/lobstr-name-logo.svg';
import StellarX from 'assets/stellarx-logo.svg';
import Stellarterm from 'assets/stellarterm-logo.svg';
import Lumenswap from 'assets/lumenswap.svg';
import Ledger from 'assets/ledger.svg';
import Freighter from 'assets/freighter.svg';
import Upbit from 'assets/upbit.svg';
import Bitnumb from 'assets/bitnumb.svg';
import Gopax from 'assets/gopax.svg';
import Probit from 'assets/probit.svg';
import Coinone from 'assets/coinone.svg';
import ExternalLink from '../../../../common/basics/ExternalLink';
import { respondDown } from '../../../../common/mixins';

const Container = styled.section`
    position: relative;
    display: grid;
    padding: 8rem 10rem 11.6rem;
    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0;
    grid-template-areas: 'a b' 'c d';
    grid-column-gap: 6rem;
    grid-row-gap: 8rem;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    margin: auto;

    ${respondDown(Breakpoints.md)`
        grid-template-areas: 'a' 'b' 'd' 'c';
        grid-row-gap: 3.8rem;
        grid-template-columns: 1fr;
        padding: 2.1rem 1.6rem 1.6rem;
    `}
`;

const Text = styled.div`
    max-width: 36.6rem;
    font-size: 1.6rem;
    line-height: 2.9rem;
    color: ${COLORS.descriptionText};

    h4 {
        font-size: 3.5rem;
        line-height: 4.1rem;
        margin-bottom: 1.7rem;
        font-weight: normal;
        color: ${COLORS.titleText};
    }

    ${respondDown(Breakpoints.md)`
        justify-self: flex-start !important;
        max-width: initial;
        font-size: 1.4rem;
        line-height: 2.5rem;
        h4 {
            font-size: 2.9rem;
            line-height: 3.3rem;
        }
    `}
`;

const TextWallets = styled(Text)`
    grid-area: a;
    justify-self: flex-end;
`;

const TextExchanges = styled(Text)`
    grid-area: d;
`;

const Icons = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 1.6rem;
    grid-row-gap: 1.6rem;

    ${respondDown(Breakpoints.sm)`
         grid-template-columns: 1fr 1fr;
    `}
`;

const IconsWallets = styled(Icons)`
    grid-area: b;
`;

const IconsExchanges = styled(Icons)`
    grid-area: c;
`;

const Link = styled.a`
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    height: 13rem;
    background: ${COLORS.lightGray};
    border-radius: 0.5rem;
    cursor: pointer;
    transition: 0.3s;
    padding: 1rem;

    &:hover {
        transform: scale(1.07);
    }

    svg,
    img {
        margin: auto;
    }
`;

const SupportedBy = () => {
    return (
        <Container>
            <TextWallets>
                <h4>Supported wallets</h4>
                <div>
                    AQUA is supported by all wallets on the Stellar network, choose the one you
                    like. We recommend using LOBSTR for mobile and StellarX for desktop.
                </div>
            </TextWallets>
            <IconsWallets>
                <Link href="https://lobstr.co/" target="_blank">
                    <Lobstr />
                </Link>
                <Link href="https://www.stellarx.com/" target="_blank">
                    <StellarX />
                </Link>
                <Link href="https://stellarterm.com/" target="_blank">
                    <Stellarterm />
                </Link>
                <Link href="https://lumenswap.io/" target="_blank">
                    <Lumenswap />
                </Link>
                <Link href="https://www.ledger.com/" target="_blank">
                    <Ledger />
                </Link>
                <Link href="https://www.freighter.app/" target="_blank">
                    <Freighter />
                </Link>
            </IconsWallets>
            <TextExchanges>
                <h4>Supported exchanges</h4>
                <div>
                    We are working to make sure AQUA airdrop is supported by major exchanges. Keep
                    an eye on announcements on Twitter and refer to our Medium article.
                    <ExternalLink href="https://medium.com/aquarius-aqua/airdrop-2-participating-exchanges-daec43175387">
                        View full list
                    </ExternalLink>
                </div>
            </TextExchanges>
            <IconsExchanges>
                <Link href="https://sg.upbit.com/" target="_blank">
                    <Upbit />
                </Link>
                <Link href="https://www.bithumb.com/" target="_blank">
                    <Bitnumb />
                </Link>
                <Link href="https://www.gopax.co.kr/" target="_blank">
                    <Gopax />
                </Link>
                <Link href="https://www.probit.com/" target="_blank">
                    <Probit />
                </Link>
                <Link href="https://coinone.co.kr/" target="_blank">
                    <Coinone />
                </Link>
                <Link href="https://www.hanbitco.com/" target="_blank">
                    <img
                        src="https://www.hanbitco.com/logos/hanbitco_logo_black.png"
                        height="15"
                        width="90"
                        alt="hanbitco"
                    />
                </Link>
            </IconsExchanges>
        </Container>
    );
};

export default SupportedBy;
