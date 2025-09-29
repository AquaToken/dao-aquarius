import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getAquaInPoolsSum, getAquaPoolsMembers, getAquaXlmRate } from 'api/amm';

import { MainRoutes } from 'constants/routes';

import { getAquaAssetData, getUsdcAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { createLumen } from 'helpers/token';

import { StellarService } from 'services/globalServices';

import { cardBoxShadow, commonMaxWidth, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import { ToggleGroup } from 'basics/inputs';
import { ExternalLink } from 'basics/links';
import { DotsLoader } from 'basics/loaders';

import Changes24 from 'components/Changes24';
import Price from 'components/Price';

const Container = styled.section`
    padding: 0 10rem;
    ${commonMaxWidth};
    margin-top: 8rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        padding: 0 1.6rem;
        margin-top: 4.8rem;
    `}
`;

const Title = styled.h1`
    font-weight: 700;
    font-size: 5.6rem;
    line-height: 6.4rem;

    ${respondDown(Breakpoints.sm)`
        font-size: 2.9rem;
        line-height: 3rem;
        font-weight: 400;
    `}
`;

const Description = styled.p`
    font-size: 1.6rem;
    line-height: 2.8rem;
    margin: 1.6rem 0 0;
`;

const Blocks = styled.div`
    display: flex;
    gap: 6rem;
    margin-top: 4.6rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const Block = styled.div`
    display: flex;
    flex-direction: column;
    ${cardBoxShadow};
    padding: 4.2rem 3.2rem;
    flex: 1;
    border-radius: 4.4rem;
`;

const BlockHeader = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 3.2rem;
    height: 4.2rem;

    h3 {
        font-weight: 700;
        font-size: 2rem;
        line-height: 2.8rem;
        color: ${COLORS.textPrimary};
    }

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        align-items: flex-start;
        gap: 0.8rem;
        margin-bottom: 5rem;
    `}
`;

const BlockRow = styled.div`
    ${flexRowSpaceBetween};

    &:not(:last-child) {
        margin-bottom: 1.2rem;
    }

    span:first-child {
        color: ${COLORS.textGray};
    }

    span:last-child {
        color: ${COLORS.textTertiary};
    }

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
        align-items: flex-start;
        gap: 0.8rem;
        
        &:not(:last-child) {
            margin-bottom: 2rem;
        }
    `}
`;

const PriceStyled = styled(Price)`
    color: ${COLORS.textTertiary};
    margin: 0;
`;

const enum SDEX_ASSETS {
    xlm = 'XLM',
    usdc = 'USDC',
}

const OPTIONS = [
    { value: SDEX_ASSETS.xlm, label: 'XLM' },
    { value: SDEX_ASSETS.usdc, label: 'USDC' },
];

const AquaPerformance = () => {
    const [sdexCounter, setSdexCounter] = useState(SDEX_ASSETS.xlm);
    const [aquaInAmmSum, setAquaInAmmSum] = useState(null);
    const [aquaInAmmMembers, setAquaInAmmMembers] = useState(null);
    const [bestPoolReserves, setBestPoolReserves] = useState(null);
    const [isReverted, setIsReverted] = useState(true);
    const [isRevertedSdex, setIsRevertedSdex] = useState(true);
    const [sdexStats, setSdexStats] = useState(null);

    const { aquaStellarAsset } = getAquaAssetData();
    const { usdcStellarAsset } = getUsdcAssetData();
    const lumen = createLumen();

    const counter = useMemo(() => {
        if (sdexCounter === SDEX_ASSETS.xlm) {
            return lumen;
        }
        if (sdexCounter === SDEX_ASSETS.usdc) {
            return usdcStellarAsset;
        }
    }, [sdexCounter]);

    useEffect(() => {
        getAquaInPoolsSum().then(setAquaInAmmSum);

        getAquaPoolsMembers().then(setAquaInAmmMembers);

        getAquaXlmRate().then(setBestPoolReserves);
    }, []);

    useEffect(() => {
        setSdexStats(null);
        StellarService.price.getAsset24hStats(aquaStellarAsset, counter).then(setSdexStats);
    }, [counter]);

    return (
        <Container>
            <Title>AQUA performance</Title>
            <Description>
                AQUA drives liquidity and rewards activity across Stellar DEX and AMM markets.
            </Description>
            <Blocks>
                <Block>
                    <BlockHeader>
                        <h3>On Aquarius AMM</h3>
                        <ExternalLink to={`${MainRoutes.amm}?search=AQUA`}>
                            Browse AQUA pools
                        </ExternalLink>
                    </BlockHeader>
                    <BlockRow>
                        <span>AQUA deposited</span>
                        <span>
                            {aquaInAmmSum ? (
                                `${formatBalance(aquaInAmmSum.sum, true, true)} ($${formatBalance(
                                    aquaInAmmSum.sum_usd,
                                    true,
                                    true,
                                )})`
                            ) : (
                                <DotsLoader />
                            )}
                        </span>
                    </BlockRow>
                    <BlockRow>
                        <span>Liquidity providers</span>
                        <span>
                            {aquaInAmmMembers ? formatBalance(aquaInAmmMembers) : <DotsLoader />}
                        </span>
                    </BlockRow>
                    <BlockRow>
                        <span>Best exchange rate</span>
                        <span>
                            {bestPoolReserves ? (
                                <PriceStyled
                                    baseAmount={bestPoolReserves[0]}
                                    counterAmount={bestPoolReserves[1]}
                                    pending={false}
                                    base={createLumen()}
                                    counter={aquaStellarAsset}
                                    isReverted={isReverted}
                                    setIsReverted={setIsReverted}
                                    hasError={false}
                                />
                            ) : (
                                <DotsLoader />
                            )}
                        </span>
                    </BlockRow>
                </Block>
                <Block>
                    <BlockHeader>
                        <h3>On Stellar DEX</h3>
                        <ToggleGroup
                            value={sdexCounter}
                            options={OPTIONS}
                            onChange={setSdexCounter}
                        />
                    </BlockHeader>
                    <BlockRow>
                        <span>Volume 24H</span>
                        <span>
                            {sdexStats ? (
                                `${formatBalance(sdexStats.volume, true, true)} AQUA`
                            ) : (
                                <DotsLoader />
                            )}
                        </span>
                    </BlockRow>
                    <BlockRow>
                        <span>Change 24H</span>
                        <span>
                            {sdexStats ? (
                                <Changes24 changes24h={sdexStats.changes24h} />
                            ) : (
                                <DotsLoader />
                            )}
                        </span>
                    </BlockRow>
                    <BlockRow>
                        <span>Last price</span>
                        <span>
                            {sdexStats ? (
                                <PriceStyled
                                    baseAmount={sdexStats.price.n}
                                    counterAmount={sdexStats.price.d}
                                    pending={false}
                                    base={counter}
                                    counter={aquaStellarAsset}
                                    isReverted={isRevertedSdex}
                                    setIsReverted={setIsRevertedSdex}
                                    hasError={false}
                                />
                            ) : (
                                <DotsLoader />
                            )}
                        </span>
                    </BlockRow>
                </Block>
            </Blocks>
        </Container>
    );
};

export default AquaPerformance;
