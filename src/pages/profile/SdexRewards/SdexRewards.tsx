import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { formatBalance } from 'helpers/format-number';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { COLORS } from 'web/styles';

import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import Table, { CellAlign } from 'basics/Table';

import { StellarService } from '../../../common/services/globalServices';
import { MainRoutes } from '../../../routes';
import Market from '../../vote/components/common/Market';
import {
    AquaBalance,
    AquaLogo,
    Container,
    ExternalLinkStyled,
    getSortFunction,
    Header,
    InOffers,
    Section,
    StyledLabel,
    Summary,
    Title,
    TOOLTIP_TEXT,
} from '../AmmRewards/AmmRewards';
import { getSdexRewards } from '../api/api';
import BoostBanner from '../BoostBanner/BoostBanner';
import { Empty } from '../YourVotes/YourVotes';

enum SortField {
    market = 'market',
    your = 'your',
}

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
                <Title>SDEX rewards overview</Title>
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
                                    ? StellarService.createAsset(baseCode, baseIssuer)
                                    : StellarService.createLumen();

                                const counter = counterIssuer
                                    ? StellarService.createAsset(counterCode, counterIssuer)
                                    : StellarService.createLumen();

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
                                                            title={`Boosted ${boostValue}x`}
                                                            text={TOOLTIP_TEXT}
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
