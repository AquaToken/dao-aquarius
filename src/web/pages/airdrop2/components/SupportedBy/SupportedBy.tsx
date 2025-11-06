import * as React from 'react';

import Bitnumb from 'assets/orgs/bitnumb.svg';
import Coinone from 'assets/orgs/coinone.svg';
import Gopax from 'assets/orgs/gopax.svg';
import Lumenswap from 'assets/orgs/lumenswap.svg';
import Probit from 'assets/orgs/probit.svg';
import Upbit from 'assets/orgs/upbit.svg';
import Freighter from 'assets/wallets/freighter/freighter.svg';
import Ledger from 'assets/wallets/ledger.svg';
import Lobstr from 'assets/wallets/lobstr/lobstr-name-logo.svg';
import Stellarterm from 'assets/wallets/stellarterm-logo.svg';
import StellarX from 'assets/wallets/stellarx-logo.svg';

import { ExternalLink } from 'basics/links';

import {
    Container,
    TextWallets,
    TextExchanges,
    IconsWallets,
    IconsExchanges,
    Link,
} from './SupportedBy.styled';

const SupportedBy: React.FC = () => (
    <Container>
        <TextWallets>
            <h4>Supported wallets</h4>
            <div>
                AQUA is supported by all wallets on the Stellar network, choose the one you like. We
                recommend using LOBSTR for mobile and StellarX for desktop.
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
                We are working to make sure AQUA airdrop is supported by major exchanges. Keep an
                eye on announcements on Twitter and refer to our Medium article.
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

export default SupportedBy;
