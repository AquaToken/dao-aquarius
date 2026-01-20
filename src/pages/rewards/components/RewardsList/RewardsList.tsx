import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { FilterOptions, getPools, PoolsSortFields } from 'api/amm';
import { getRewards, RewardsSort } from 'api/rewards';

import { AppRoutes } from 'constants/routes';

import { getTimeAgoValue } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { createAsset } from 'helpers/token';

import { useUrlParam } from 'hooks/useUrlParam';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { PoolProcessed } from 'types/amm';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import Info from 'assets/icons/status/icon-info-16.svg';
import Warning from 'assets/icons/status/warning-16.svg';

import { ExternalLink } from 'basics/links';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Table, { CellAlign } from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

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

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        margin-top: 4rem;
    `}
`;

const Title = styled.h3`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.textPrimary};
    font-weight: normal;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2rem;
        font-size: 2.5rem;
    `}
`;

const LastUpdated = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};

    span {
        margin-right: 1rem;
    }

    svg {
        cursor: help;
    }
`;

const TooltipInner = styled.div`
    width: 20rem;
    white-space: pre-wrap;

    div {
        font-size: 1.4rem;
    }
`;

const WarningIcon = styled(Warning)`
    margin: 0 0.5rem;
`;

const Amount = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};

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

    const [loading, setLoading] = useState(false);
    const [pools, setPools] = useState(null);

    const { processNewAssets } = useAssetsStore();

    const { isLogged } = useAuthStore();

    const navigate = useNavigate();

    const { value: sort, setValue: setSort } = useUrlParam<RewardsSort>(
        UrlParams.sort,
        RewardsSort.totalUp,
    );

    useEffect(() => {
        getPools(FilterOptions.all, 1, 1000, PoolsSortFields.liquidityUp).then(res =>
            setPools(res.pools),
        );
    }, []);

    const marketHasPools = useCallback(
        marketKey => {
            if (!pools) {
                return true;
            }
            const { asset1_code, asset1_issuer, asset2_code, asset2_issuer } = marketKey;

            const tokenStr1 = marketKeyToString(asset1_code, asset1_issuer);
            const tokenStr2 = marketKeyToString(asset2_code, asset2_issuer);

            const poolsForMarket = pools.find(
                (pool: PoolProcessed) =>
                    pool.tokens.length === 2 &&
                    pool.tokens_str.some(str => str === tokenStr1) &&
                    pool.tokens_str.some(str => str === tokenStr2),
            );

            return Boolean(poolsForMarket);
        },
        [pools],
    );

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

    const goToMarketPage = ({ asset1_code, asset1_issuer, asset2_code, asset2_issuer }) => {
        navigate(
            AppRoutes.section.market.to.market({
                base: marketKeyToString(asset1_code, asset1_issuer),
                counter: marketKeyToString(asset2_code, asset2_issuer),
            }),
        );
    };

    const goToCreatePool = () => {
        if (isLogged) {
            navigate(AppRoutes.section.amm.link.create);
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {
            redirectURL: AppRoutes.section.amm.link.create,
        });
    };

    if (!rewards) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Header>
                <Title>LP Rewards by Market</Title>

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
                        children: 'Aquarius AMM daily reward',
                        sort: {
                            onClick: () =>
                                setSort(
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
                        children: 'SDEX daily reward',
                        sort: {
                            onClick: () =>
                                setSort(
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
                        children: 'Total daily reward',
                        sort: {
                            onClick: () =>
                                setSort(
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
                                            createAsset(
                                                market_key.asset1_code,
                                                market_key.asset1_issuer,
                                            ),
                                            createAsset(
                                                market_key.asset2_code,
                                                market_key.asset2_issuer,
                                            ),
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
                                        {!marketHasPools(market_key) && (
                                            <Tooltip
                                                content={
                                                    <TooltipInner>
                                                        AMM rewards are not distributed because this
                                                        market doesn’t have Aquarius pool yet.
                                                        <ExternalLink
                                                            asDiv
                                                            onClick={() => goToCreatePool()}
                                                        >
                                                            Create pool
                                                        </ExternalLink>
                                                    </TooltipInner>
                                                }
                                                position={TOOLTIP_POSITION.top}
                                                background={COLORS.white}
                                                color={COLORS.textPrimary}
                                                showOnHover
                                            >
                                                <WarningIcon />
                                            </Tooltip>
                                        )}
                                        <span>
                                            {formatBalance(daily_amm_reward)} AQUA (
                                            {Math.round(
                                                (daily_amm_reward * 100) /
                                                    (daily_sdex_reward + daily_amm_reward),
                                            )}
                                            %)
                                        </span>{' '}
                                    </Amount>
                                ),
                                label: 'Aquarius AMM daily reward',
                                align: CellAlign.Right,
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
                                    </Amount>
                                ),
                                label: 'SDEX daily reward',
                                align: CellAlign.Right,
                            },
                            {
                                children: `${formatBalance(daily_total_reward)} AQUA`,
                                label: 'Total daily reward',
                                align: CellAlign.Right,
                                labelColor: COLORS.textPrimary,
                            },
                        ],
                    }),
                )}
            />
        </Container>
    );
};

export default RewardsList;
