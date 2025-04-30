import * as React from 'react';
import styled from 'styled-components';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import CMC from 'assets/coin-market-cap.svg';
import Coingecko from 'assets/coingecko.svg';
import DefiLlama from 'assets/defillama.svg';
import Arrow from 'assets/icon-arrow-right.svg';
import Expert from 'assets/stellar-expert.svg';

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
`;

const Label = styled.span`
    color: ${COLORS.grayText};
    white-space: nowrap;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const Line = styled.div`
    margin: 0 2.4rem;
    border-top: 0.1rem solid ${COLORS.grayText};
    width: 100%;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const Links = styled.div`
    display: flex;

    ${respondDown(Breakpoints.md)`
        flex-wrap: wrap;
        justify-content: space-between;
    `}

    ${respondDown(Breakpoints.sm)`
        flex-wrap: unset;
        flex-direction: column;
        width: 100%;
        gap: 0.8rem;
    `}
`;

const Link = styled.a`
    display: flex;
    align-items: center;
    padding: 1.8rem 2rem 1.8rem 2.4rem;
    background-color: ${COLORS.lightGray};
    border-radius: 1.6rem;
    cursor: pointer;
    text-decoration: none;
    color: ${COLORS.titleText};
    font-weight: 700;

    svg:first-child {
        margin-right: 0.8rem;
    }

    svg:last-child {
        transition: all 0.2s ease;
        margin: 0 0.4rem 0 0.8rem;
    }

    &:not(:last-child) {
        margin-right: 1.6rem;
    }

    &:hover {
        svg:last-child {
            margin: 0 0 0 1.2rem;
        }
    }

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        justify-content: center;
        
        &:not(:last-child) {
            margin-right: 0;
        }
    `}
`;

const AquaLinks = ({ ...props }) => (
    <Container {...props}>
        <Content>
            <Label>See on</Label>
            <Line />
            <Links>
                <Link
                    href="https://stellar.expert/explorer/public/asset/AQUA-GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA"
                    target="_blank"
                >
                    <Expert />
                    StellarExpert
                    <Arrow />
                </Link>
                <Link href="https://www.coingecko.com/en/coins/aquarius" target="_blank">
                    <Coingecko />
                    CoinGecko
                    <Arrow />
                </Link>
                <Link href="https://coinmarketcap.com/currencies/aquarius/" target="_blank">
                    <CMC />
                    CoinMarketCap
                    <Arrow />
                </Link>
                <Link href="https://defillama.com/dexs/aquarius-stellar" target="_blank">
                    <DefiLlama />
                    DefiLlama
                    <Arrow />
                </Link>
            </Links>
        </Content>
    </Container>
);

export default AquaLinks;
