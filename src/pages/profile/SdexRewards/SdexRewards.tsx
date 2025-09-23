import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';
import { createAsset, createLumen } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Aqua from 'assets/aqua-logo-small.svg';

import Label from 'basics/Label';
import { ExternalLink } from 'basics/links';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Table, { CellAlign } from 'basics/Table';

import { getSdexRewards } from '../api/api';
import BoostBanner from '../BoostBanner/BoostBanner';
import { Empty } from '../YourVotes/YourVotes';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

export const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 4.8rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 2rem;
        margin-bottom: 2rem;
   `}
`;

export const Title = styled.h2`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    font-weight: 400;

    ${respondDown(Breakpoints.md)`
        text-align: center;
   `}
`;

export const Section = styled.section`
    background: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 2.6rem 2.3rem;

    ${respondDown(Breakpoints.md)`
        padding: 0;
        background: ${COLORS.lightGray};
    `}
`;

export const ExternalLinkStyled = styled(ExternalLink)`
    font-size: 1.4rem;
    line-height: 2rem;
`;

export const Summary = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    display: flex;
    align-items: center;
`;

export const AquaLogo = styled(Aqua)`
    width: 2.4rem;
    height: 2.4rem;
    margin-left: 1.6rem;
    margin-right: 0.8rem;
`;

export const AquaBalance = styled.div`
    font-size: 2rem;
    line-height: 2.4rem;
    color: ${COLORS.titleText};
    margin-right: 1rem;
`;

export const TooltipInner = styled.span`
    width: 40rem;
    white-space: pre-line;

    ${respondDown(Breakpoints.md)`
        width: 20rem;
    `}
`;

export const StyledLabel = styled(Label)`
    margin-left: 1rem;
`;

export const InOffers = styled.div`
    display: flex;
    flex-direction: column;
    line-height: 2.4rem;

    ${respondDown(Breakpoints.md)`
        text-align: right;
    `}
`;

export const TOOLTIP_TEXT =
    'You can freeze AQUA into ICE for additional benefits. One of them is a boost in SDEX and AMM rewards you can receive. The higher your ICE balance, the higher your boost can be.';

enum SortField {
    market = 'market',
    your = 'your',
}

export const getSortFunction = (value1, value2, isSortReversed) =>
    isSortReversed ? value1 - value2 : value2 - value1;

const getAssetString = (asset): string => {
    const {
        asset_code: assetCode,
        asset_issuer: assetIssuer,
        asset_type: assetType,
        code,
        issuer,
    } = asset;

    if (code) {
        return asset.isNative() ? 'native' : `${code}:${issuer}`;
    }

    return assetType === 'native' ? 'native' : `${assetCode}:${assetIssuer}`;
};

interface SdexRewardsProps {
    aquaUsdPrice: number;
}

const SdexRewards = ({ aquaUsdPrice }: SdexRewardsProps): React.ReactNode => {
    const { account } = useAuthStore();

    const [sdexRewards, setSdexRewards] = useState(null);
    const [sort, setSort] = useState(SortField.your);
    const [isSortReversed, setIsSortReversed] = useState(false);
    const [offers, setOffers] = useState(null);

    const { processNewAssets } = useAssetsStore();

    useEffect(() => {
        StellarService.getAccountOffers(account.accountId()).then(res => {
            setOffers(res);
        });
    }, []);

    useEffect(() => {
        getSdexRewards(account.accountId()).then(res => {
            setSdexRewards(res);

            const assets = res.reduce((acc, { market_key: pair }) => {
                const {
                    asset1_code: baseCode,
                    asset1_issuer: baseIssuer,
                    asset2_code: counterCode,
                    asset2_issuer: counterIssuer,
                } = pair;

                acc.push({ code: baseCode, issuer: baseIssuer });
                acc.push({ code: counterCode, issuer: counterIssuer });
                return acc;
            }, []);

            processNewAssets(assets);
        });
    }, []);

    const offersMap = useMemo(() => {
        if (!offers) {
            return null;
        }

        return offers.reduce((acc, item) => {
            const { buying, selling, amount } = item;
            const marketSlug = `${getAssetString(buying)}/${getAssetString(selling)}`;

            if (acc.has(marketSlug)) {
                const sum = acc.get(marketSlug);
                acc.set(marketSlug, sum + Number(amount));
                return acc;
            }

            acc.set(marketSlug, Number(amount));
            return acc;
        }, new Map());
    }, [offers]);

    const { sumBoost, sumRewards } = useMemo(() => {
        if (!sdexRewards || !sdexRewards.length) {
            return { sumBoost: 0, sumRewards: 0 };
        }

        return sdexRewards.reduce(
            (acc, reward) => {
                acc.sumRewards += reward.maker_reward * 24;
                acc.sumBoost += reward.boosted_reward;
                return acc;
            },
            { sumBoost: 0, sumRewards: 0 },
        );
    }, [sdexRewards]);

    const sorted = useMemo(() => {
        if (!sdexRewards) {
            return null;
        }
        switch (sort) {
            case SortField.market:
                return sdexRewards.sort((a, b) =>
                    getSortFunction(a.daily_sdex_reward, b.daily_sdex_reward, isSortReversed),
                );
            case SortField.your:
                return sdexRewards.sort((a, b) =>
                    getSortFunction(a.maker_reward, b.maker_reward, isSortReversed),
                );
            default:
                throw new Error('Invalid sort field');
        }
    }, [sdexRewards, sort, isSortReversed]);

    const changeSort = useCallback(
        sortField => {
            if (sortField === sort) {
                setIsSortReversed(prevState => !prevState);
                return;
            }
            setSort(sortField);
            setIsSortReversed(false);
        },
        [sort, isSortReversed],
    );

    return (
        <Container>
            <Header>
                <Title>SDEX Rewards</Title>
                {Boolean(sumRewards) && (
                    <Summary>
                        Daily SDEX reward: <AquaLogo />
                        <AquaBalance>{formatBalance(sumRewards, true)} AQUA</AquaBalance>
                        {aquaUsdPrice ? (
                            `(≈${(aquaUsdPrice * sumRewards).toFixed(2)}$)`
                        ) : (
                            <DotsLoader />
                        )}
                    </Summary>
                )}
            </Header>

            {Boolean(sorted?.length) && !sumBoost && <BoostBanner />}

            {!sorted ? (
                <PageLoader />
            ) : sorted.length ? (
                <Section>
                    <Table
                        head={[
                            { children: 'Market', flexSize: 2.5 },
                            { children: 'In offers' },
                            {
                                children: 'SDEX daily reward',
                                align: CellAlign.Right,
                                sort: {
                                    onClick: () => changeSort(SortField.market),
                                    isEnabled: sort === SortField.market,
                                    isReversed: isSortReversed,
                                },
                            },
                            {
                                children: 'Your daily reward',
                                align: CellAlign.Right,
                                sort: {
                                    onClick: () => changeSort(SortField.your),
                                    isEnabled: sort === SortField.your,
                                    isReversed: isSortReversed,
                                },
                                flexSize: 1.5,
                            },
                        ]}
                        body={sorted.map(
                            ({
                                market_key: pair,
                                maker_reward: reward,
                                boosted_reward: boost,
                                daily_sdex_reward: marketReward,
                            }) => {
                                const dailyReward = reward * 24;

                                const boostValue = (reward / (reward - boost)).toFixed(2);

                                const {
                                    asset1_code: baseCode,
                                    asset1_issuer: baseIssuer,
                                    asset2_code: counterCode,
                                    asset2_issuer: counterIssuer,
                                } = pair;

                                const base = baseIssuer
                                    ? createAsset(baseCode, baseIssuer)
                                    : createLumen();

                                const counter = counterIssuer
                                    ? createAsset(counterCode, counterIssuer)
                                    : createLumen();

                                const baseSum =
                                    offersMap?.get(
                                        `${getAssetString(counter)}/${getAssetString(base)}`,
                                    ) || 0;

                                const counterSum =
                                    offersMap?.get(
                                        `${getAssetString(base)}/${getAssetString(counter)}`,
                                    ) || 0;

                                return {
                                    key: baseCode + baseIssuer + counterCode + counterIssuer,
                                    mobileFontSize: '1.4rem',
                                    rowItems: [
                                        {
                                            children: (
                                                <Market
                                                    assets={[base, counter]}
                                                    withoutLink
                                                    mobileVerticalDirections
                                                    withMarketLink
                                                />
                                            ),
                                            flexSize: 2.5,
                                        },
                                        {
                                            children: offers ? (
                                                <InOffers>
                                                    <div>
                                                        {formatBalance(baseSum, true)} {base.code}
                                                    </div>
                                                    <div>
                                                        {formatBalance(counterSum, true)}{' '}
                                                        {counter.code}
                                                    </div>
                                                </InOffers>
                                            ) : (
                                                <DotsLoader />
                                            ),
                                            label: 'In offers:',
                                        },
                                        {
                                            children: `${formatBalance(marketReward, true)} AQUA`,
                                            label: 'SDEX daily reward:',
                                            align: CellAlign.Right,
                                        },
                                        {
                                            children: (
                                                <>
                                                    <span>
                                                        {formatBalance(dailyReward, true)} AQUA
                                                    </span>
                                                    {Boolean(boost) && (
                                                        <StyledLabel
                                                            labelText={`Boosted ${boostValue}x`}
                                                            tooltipText={TOOLTIP_TEXT}
                                                            background={COLORS.blue}
                                                        />
                                                    )}
                                                </>
                                            ),
                                            label: 'Your daily reward:',
                                            align: CellAlign.Right,
                                            flexSize: 1.5,
                                        },
                                    ],
                                };
                            },
                        )}
                    />
                </Section>
            ) : (
                <Section>
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>It looks like you don't get SDEX rewards</span>

                        <ExternalLinkStyled asDiv>
                            <Link to={MainRoutes.rewards}>Learn about SDEX rewards</Link>
                        </ExternalLinkStyled>
                    </Empty>
                </Section>
            )}
        </Container>
    );
};

export default SdexRewards;
