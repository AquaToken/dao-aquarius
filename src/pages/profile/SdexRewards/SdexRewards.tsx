import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TableBody, TableHead, TableHeadRow } from '../../vote/components/MainPage/Table/Table';
import Pair from '../../vote/components/common/Pair';
import { StellarService } from '../../../common/services/globalServices';
import { getSdexRewards } from '../api/api';
import useAuthStore from '../../../store/authStore/useAuthStore';
import PageLoader from '../../../common/basics/PageLoader';
import { Empty } from '../YourVotes/YourVotes';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../routes';
import { formatBalance } from '../../../common/helpers/helpers';
import {
    AquaBalance,
    AquaLogo,
    Cell,
    Container,
    DailyRewards,
    ExternalLinkStyled,
    getSortFunction,
    Header,
    InOffers,
    PairCell,
    Section,
    Summary,
    Table,
    TableBodyRow,
    Title,
    TOOLTIP_TEXT,
} from '../AmmRewards/AmmRewards';
import useAssetsStore from '../../../store/assetsStore/useAssetsStore';
import { SortingHeader } from '../../bribes/components/BribesPage/BribesTable/BribesTable';
import { IconSort } from '../../../common/basics/Icons';
import DotsLoader from '../../../common/basics/DotsLoader';
import Label from '../../../common/basics/Label';
import BoostBanner from '../BoostBanner/BoostBanner';

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

const SdexRewards = ({ aquaUsdPrice }) => {
    const { account } = useAuthStore();

    const [sdexRewards, setSdexRewards] = useState(null);
    const [sort, setSort] = useState(SortField.your);
    const [isSortReversed, setIsSortReversed] = useState(false);
    const [offers, setOffers] = useState(null);

    const { processNewAssets } = useAssetsStore();

    useEffect(() => {
        StellarService.getAccountOffers(account.accountId()).then((res) => {
            setOffers(res);
        });
    }, []);

    useEffect(() => {
        getSdexRewards(account.accountId()).then((res) => {
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
        (sortField) => {
            if (sortField === sort) {
                setIsSortReversed((prevState) => !prevState);
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
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <PairCell>Pair</PairCell>
                                <Cell>In offers</Cell>
                                <Cell>
                                    <SortingHeader
                                        position="right"
                                        onClick={() => changeSort(SortField.market)}
                                    >
                                        SDEX daily reward
                                        <IconSort
                                            isEnabled={sort === SortField.market}
                                            isReversed={isSortReversed}
                                        />
                                    </SortingHeader>
                                </Cell>
                                <Cell>
                                    <SortingHeader
                                        position="right"
                                        onClick={() => changeSort(SortField.your)}
                                    >
                                        Your daily reward
                                        <IconSort
                                            isEnabled={sort === SortField.your}
                                            isReversed={isSortReversed}
                                        />
                                    </SortingHeader>
                                </Cell>
                            </TableHeadRow>
                        </TableHead>

                        <TableBody>
                            {sorted.map(
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

                                    return (
                                        <TableBodyRow
                                            key={
                                                baseCode + baseIssuer + counterCode + counterIssuer
                                            }
                                        >
                                            <PairCell>
                                                <Pair
                                                    base={base}
                                                    counter={counter}
                                                    withoutLink
                                                    mobileVerticalDirections
                                                    withMarketLink
                                                />
                                            </PairCell>
                                            <Cell>
                                                <label>In offers:</label>
                                                {offers ? (
                                                    <InOffers>
                                                        <div>
                                                            {formatBalance(baseSum, true)}{' '}
                                                            {base.code}
                                                        </div>
                                                        <div>
                                                            {formatBalance(counterSum, true)}{' '}
                                                            {counter.code}
                                                        </div>
                                                    </InOffers>
                                                ) : (
                                                    <DotsLoader />
                                                )}
                                            </Cell>
                                            <Cell>
                                                <label>SDEX daily reward:</label>
                                                {formatBalance(marketReward, true)} AQUA
                                            </Cell>
                                            <Cell>
                                                <label>Your daily reward:</label>

                                                <DailyRewards>
                                                    {formatBalance(dailyReward, true)} AQUA
                                                </DailyRewards>
                                                {Boolean(boost) && (
                                                    <Label
                                                        title={`Boosted ${boostValue}x`}
                                                        text={TOOLTIP_TEXT}
                                                        isBlue
                                                    />
                                                )}
                                            </Cell>
                                        </TableBodyRow>
                                    );
                                },
                            )}
                        </TableBody>
                    </Table>
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
