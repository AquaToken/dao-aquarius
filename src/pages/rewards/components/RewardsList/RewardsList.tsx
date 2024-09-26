import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getTimeAgoValue } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Link from 'assets/icon-external-link.svg';
import Info from 'assets/icon-info.svg';

import PageLoader from 'basics/loaders/PageLoader';
import Table, { CellAlign } from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { MarketRoutes } from '../../../../routes';
import Market from '../../../vote/components/common/Market';
import { getRewards, RewardsSort } from '../../api/api';

const Container = styled.section`
    position: relative;
    margin: 0 auto;
    max-width: 142rem;
    padding: 1rem 10rem 0;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        max-width: 55rem;
    `}
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4.2rem;
    padding: 0 1rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        margin-top: 4rem;
    `}
`;

const Title = styled.h3`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.titleText};
    font-weight: normal;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2rem;
    `}
`;

const LastUpdated = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};

    span {
        margin-right: 1rem;
    }

    svg {
        cursor: help;
    }
`;

const TooltipInner = styled.div`
    width: 15rem;
    white-space: pre-wrap;
`;

const LinkIcon = styled(Link)`
    margin-left: 0.5rem;
`;

const Amount = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};

    a {
        display: flex;
        align-items: center;
    }
`;

enum UrlParams {
    sort = 'ordering',
}

const marketKeyToString = (code, issuer) => {
    if (code === 'XLM' && !issuer) {
        return 'native';
    }
    return `${code}:${issuer}`;
};

const RewardsList = () => {
    const [rewards, setRewards] = useState(null);
    const [sort, setSort] = useState(null);
    const [loading, setLoading] = useState(false);

    const { processNewAssets } = useAssetsStore();

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        if (!sort) {
            return;
        }
        setLoading(true);
        getRewards(sort).then(res => {
            setRewards(res);
            setLoading(false);
            const assets = res.reduce((acc, item) => {
                const { asset1_code, asset1_issuer, asset2_code, asset2_issuer } = item.market_key;
                acc.push({ code: asset1_code, issuer: asset1_issuer });
                acc.push({ code: asset2_code, issuer: asset2_issuer });
                return acc;
            }, []);

            processNewAssets(assets);
        });
    }, [sort]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (!params.has(UrlParams.sort)) {
            params.append(UrlParams.sort, RewardsSort.totalUp);
            history.replace({ search: params.toString() });
            return;
        }

        setSort(params.get(UrlParams.sort));
    }, [location]);

    const changeSort = sortValue => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.sort, sortValue);
        history.push({ pathname: location.pathname, search: params.toString() });
    };

    const goToMarketPage = ({ asset1_code, asset1_issuer, asset2_code, asset2_issuer }) => {
        history.push(
            `${MarketRoutes.main}/${marketKeyToString(
                asset1_code,
                asset1_issuer,
            )}/${marketKeyToString(asset2_code, asset2_issuer)}`,
        );
    };

    if (!rewards) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Header>
                <Title>Market Rewards</Title>

                <LastUpdated>
                    <span>
                        Last updated {getTimeAgoValue(new Date(rewards[0].last_updated).getTime())}
                    </span>
                    <Tooltip
                        content={
                            <TooltipInner>
                                Market rewards are updated once a day at a random time.
                            </TooltipInner>
                        }
                        position={TOOLTIP_POSITION.bottom}
                        showOnHover
                    >
                        <Info />
                    </Tooltip>
                </LastUpdated>
            </Header>
            <Table
                pending={rewards && loading}
                head={[
                    { children: 'Market', flexSize: 1.5 },
                    {
                        children: 'SDEX daily reward',
                        sort: {
                            onClick: () =>
                                changeSort(
                                    sort === RewardsSort.sdexUp
                                        ? RewardsSort.sdexDown
                                        : RewardsSort.sdexUp,
                                ),
                            isEnabled: sort === RewardsSort.sdexUp || sort === RewardsSort.sdexDown,
                            isReversed: sort === RewardsSort.sdexDown,
                        },
                        align: CellAlign.Right,
                    },
                    {
                        children: 'AMM daily reward',
                        sort: {
                            onClick: () =>
                                changeSort(
                                    sort === RewardsSort.ammUp
                                        ? RewardsSort.ammDown
                                        : RewardsSort.ammUp,
                                ),
                            isEnabled: sort === RewardsSort.ammUp || sort === RewardsSort.ammDown,
                            isReversed: sort === RewardsSort.ammDown,
                        },
                        align: CellAlign.Right,
                    },
                    {
                        children: 'Total daily reward',
                        sort: {
                            onClick: () =>
                                changeSort(
                                    sort === RewardsSort.totalUp
                                        ? RewardsSort.totalDown
                                        : RewardsSort.totalUp,
                                ),
                            isEnabled:
                                sort === RewardsSort.totalUp || sort === RewardsSort.totalDown,
                            isReversed: sort === RewardsSort.totalDown,
                        },
                        align: CellAlign.Right,
                    },
                ]}
                body={rewards.map(
                    ({ daily_sdex_reward, daily_total_reward, daily_amm_reward, market_key }) => ({
                        key:
                            market_key.asset1_code +
                            market_key.asset1_issuer +
                            market_key.asset2_code +
                            market_key.asset2_issuer,
                        onRowClick: () => goToMarketPage(market_key),
                        mobileFontSize: '1.4rem',
                        rowItems: [
                            {
                                children: (
                                    <Market
                                        assets={[
                                            {
                                                code: market_key.asset1_code,
                                                issuer: market_key.asset1_issuer,
                                            },
                                            {
                                                code: market_key.asset2_code,
                                                issuer: market_key.asset2_issuer,
                                            },
                                        ]}
                                        withoutLink
                                        mobileVerticalDirections
                                    />
                                ),
                                flexSize: 1.5,
                            },
                            {
                                children: (
                                    <Amount>
                                        <span>
                                            {formatBalance(daily_sdex_reward)} AQUA (
                                            {Math.round(
                                                (daily_sdex_reward * 100) /
                                                    (daily_sdex_reward + daily_amm_reward),
                                            )}
                                            %)
                                        </span>
                                        <a
                                            href={`https://www.stellarx.com/markets/${marketKeyToString(
                                                market_key.asset1_code,
                                                market_key.asset1_issuer,
                                            )}/${marketKeyToString(
                                                market_key.asset2_code,
                                                market_key.asset2_issuer,
                                            )}`}
                                            target="_blank"
                                            onClick={e => {
                                                e.stopPropagation();
                                            }}
                                            title="StellarX"
                                            rel="noreferrer"
                                        >
                                            <LinkIcon />
                                        </a>
                                    </Amount>
                                ),
                                label: 'SDEX daily reward',
                                align: CellAlign.Right,
                            },
                            {
                                children: (
                                    <Amount>
                                        <span>
                                            {formatBalance(daily_amm_reward)} AQUA (
                                            {Math.round(
                                                (daily_amm_reward * 100) /
                                                    (daily_sdex_reward + daily_amm_reward),
                                            )}
                                            %)
                                        </span>{' '}
                                        <a
                                            href={`https://www.stellarx.com/amm/analytics/${marketKeyToString(
                                                market_key.asset1_code,
                                                market_key.asset1_issuer,
                                            )}/${marketKeyToString(
                                                market_key.asset2_code,
                                                market_key.asset2_issuer,
                                            )}`}
                                            target="_blank"
                                            onClick={e => {
                                                e.stopPropagation();
                                            }}
                                            title="StellarX"
                                            rel="noreferrer"
                                        >
                                            <LinkIcon />
                                        </a>
                                    </Amount>
                                ),
                                label: 'AMM daily reward',
                                align: CellAlign.Right,
                            },
                            {
                                children: `${formatBalance(daily_total_reward)} AQUA`,
                                label: 'Total daily reward',
                                align: CellAlign.Right,
                                labelColor: COLORS.titleText,
                            },
                        ],
                    }),
                )}
            />
        </Container>
    );
};

export default RewardsList;
