import * as React from 'react';
import styled from 'styled-components';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import CMC from 'assets/coin-market-cap.svg';
import Coingecko from 'assets/coingecko.svg';
import DefiLlama from 'assets/defillama.svg';
import Digifinex from 'assets/digifinex.svg';
import Gopax from 'assets/gopax-logo.svg';
import Latoken from 'assets/latoken.svg';
import Probit from 'assets/probit-logo.svg';
import Expert from 'assets/stellar-expert.svg';
import XT from 'assets/xt.svg';

import AquaLink from 'pages/token/components/AquaLinks/AquaLink/AquaLink';

const Container = styled.div`
    padding: 0 10rem;
    ${commonMaxWidth};
    margin-top: 4.8rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        padding: 0;
        margin-top: 0;
    `}
`;

const Content = styled.div`
    display: flex;
    align-items: center;
    padding: 2.2rem 0;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        padding: 0;
    `}

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 3.2rem;
        align-items: flex-start;
    `}
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
    width: 50%;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Label = styled.span`
    color: ${COLORS.grayText};
    white-space: nowrap;
`;

const Links = styled.div`
    display: flex;

    ${respondDown(Breakpoints.md)`
        flex-wrap: wrap;
        gap: 1.6rem;
        justify-content: space-between;
    `}
`;

const AquaLinks = ({ ...props }) => (
    <Container {...props}>
        <Content>
            <Section>
                <Label>See on</Label>
                <Links>
                    <AquaLink
                        href="https://stellar.expert/explorer/public/asset/AQUA-GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA"
                        label="StellarExpert"
                    >
                        <Expert />
                    </AquaLink>
                    <AquaLink href="https://www.coingecko.com/en/coins/aquarius" label="CoinGecko">
                        <Coingecko />
                    </AquaLink>
                    <AquaLink
                        href="https://coinmarketcap.com/currencies/aquarius/"
                        label="CoinMarketCap"
                    >
                        <CMC />
                    </AquaLink>
                    <AquaLink href="https://defillama.com/dexs/aquarius-stellar" label="DefiLlama">
                        <DefiLlama />
                    </AquaLink>
                </Links>
            </Section>
            <Section>
                <Label>Listed on</Label>
                <Links>
                    <AquaLink href="https://www.xt.com/en/trade/aqua_usdc" label="XT">
                        <XT />
                    </AquaLink>
                    <AquaLink href="https://latoken.com/exchange/AQUA_USDC" label="Latoken">
                        <Latoken />
                    </AquaLink>
                    <AquaLink
                        href="https://www.digifinex.com/en-ww/trade/USDT/AQUA?tradeKind=spot"
                        label="Digifinex"
                    >
                        <Digifinex />
                    </AquaLink>
                    <AquaLink
                        href="https://www.probit.com/en-us/app/exchange/AQUA-USDT"
                        label="Probit Global"
                    >
                        <Probit />
                    </AquaLink>
                    <AquaLink href="https://www.gopax.co.kr/exchange/aqua-krw" label="GOPAX">
                        <Gopax />
                    </AquaLink>
                </Links>
            </Section>
        </Content>
    </Container>
);

export default AquaLinks;
