import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { getPoolMembersCount, getPoolStats } from 'api/amm';

import { POOL_TYPE } from 'constants/amm';
import { ChartPeriods } from 'constants/charts';

import { contractValueToAmount } from 'helpers/amount';
import { formatBalance } from 'helpers/format-number';
import { truncateString } from 'helpers/truncate-string';

import { ModalService, StellarService } from 'services/globalServices';

import { PoolClassicProcessed, PoolExtended, PoolProcessed, PoolUserProcessed } from 'types/amm';
import { Asset as AssetType } from 'types/stellar';
import { SorobanToken } from 'types/token';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import MigrateLiquidityStep1 from 'web/modals/migrate-liquidity/MigrateLiquidityStep1';
import { Breakpoints, COLORS } from 'web/styles';

import Arrow from 'assets/icon-arrow-down.svg';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import CopyButton from 'basics/buttons/CopyButton';
import { DotsLoader } from 'basics/loaders';
import Market from 'basics/Market';

import LiquidityChart from 'pages/amm/components/LiquidityChart/LiquidityChart';
import VolumeChart from 'pages/amm/components/VolumeChart/VolumeChart';

import MigratePoolButton from './MigratePoolButton/MigratePoolButton';

import DepositToPool from '../DepositToPool/DepositToPool';
import WithdrawFromPool from '../WithdrawFromPool/WithdrawFromPool';

const PoolBlock = styled.div`
    display: flex;
    flex-direction: column;
    margin: 2rem 0;
`;

const PoolMain = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;

    ${respondDown(Breakpoints.xl)`
        padding: 1rem;
        flex-direction: column;
        background-color: ${COLORS.lightGray};
        border-radius: 0.6rem;
        align-items: unset;
    `}
`;

const MarketStyled = styled(Market)`
    width: 60%;

    ${respondDown(Breakpoints.xl)`
        width: 100%;
     `}
`;

const PoolStats = styled.div<{ $isSinglePool: boolean }>`
    display: flex;
    align-items: center;
    width: ${({ $isSinglePool }) => ($isSinglePool ? '40%' : '30%')};
    gap: 1.4rem;
    margin-left: ${({ $isSinglePool }) => ($isSinglePool ? 'unset' : 'auto')};

    div {
        display: flex;
        flex-direction: column;
        flex: 2;

        span {
            white-space: nowrap;
        }

        span:first-child {
            color: ${COLORS.grayText};
        }

        span:last-child {
            color: ${COLORS.paragraphText};
        }
    }

    ${respondDown(Breakpoints.xxl)`
         width: ${({ $isSinglePool }) => ($isSinglePool ? '40%' : '20%')};
     `};

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
        width: 100%;
        gap: 1rem;
        
        div {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
        }
    `}
`;

const ExpandButton = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.lightGray};
    border-radius: 0.6rem;
    height: 4.8rem;
    width: 4.8rem;
    min-width: 4.8rem;
    cursor: pointer;
    margin-left: auto;

    &:hover {
        background-color: ${COLORS.gray};
    }

    ${respondDown(Breakpoints.xl)`
        width: 100%;
    `}
`;

const ArrowDown = styled(Arrow)<{ $isOpen: boolean }>`
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'unset')};
    transform-origin: center;
    transition: transform linear 200ms;
`;

const Charts = styled.div`
    display: flex;
    justify-content: space-evenly;
    margin-bottom: 1rem;
    gap: 1.6rem;

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
    `}
`;

const Chart = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.white};
    border-radius: 0.6rem;
    width: 100%;
    padding: 0 1.6rem;
`;

const ExpandedBlock = styled.div<{ $withoutTopPadding?: boolean }>`
    display: flex;
    flex-direction: column;
    padding: ${({ $withoutTopPadding }) => ($withoutTopPadding ? '0 2.4rem 2rem' : '3rem 2.4rem')};
    border-radius: 0.6rem;
    background-color: ${COLORS.lightGray};
    margin-top: 2.4rem;
    animation: open ease-in-out 200ms;
    transform-origin: top;

    @keyframes open {
        0% {
            transform: scaleY(0);
        }
        80% {
            transform: scaleY(1.1);
        }
        100% {
            transform: scaleY(1);
        }
    }

    ${respondDown(Breakpoints.xl)`
        margin-top: 0;
        padding: 0 1rem;
    `}
`;

const ExpandedDataRow = styled.div`
    ${flexRowSpaceBetween};
    color: ${COLORS.grayText};
    gap: 0.8rem;

    span:last-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }

    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }
`;

const Rates = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;

    span {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
    }

    ${respondDown(Breakpoints.xl)`
        span {
            font-size: 1.2rem!important;
        }
    `}
`;

const Buttons = styled.div`
    ${flexRowSpaceBetween};
    gap: 0.8rem;

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
    `}
`;

type SorobanPool = PoolProcessed | PoolUserProcessed;

interface PoolsListProps {
    pools: SorobanPool[] | PoolClassicProcessed[];
    onUpdate: () => void;
    withDeposit?: boolean;
    isCommonList?: boolean;
    baseAmount?: string;
    counterAmount?: string;
    base?: AssetType;
    counter?: AssetType;
    onConfirm?: () => void;
}

const PoolsList = ({
    pools,
    onUpdate,
    isCommonList,
    withDeposit,
    baseAmount,
    counterAmount,
    base,
    counter,
    onConfirm,
}: PoolsListProps) => {
    const [expandedIndexes, setExpandedIndexes] = useState(
        isCommonList && pools.length === 1 ? [(pools[0] as SorobanPool).address] : [],
    );
    const [poolMembers, setPoolMembers] = useState(null);
    const [poolStats, setPoolStats] = useState(null);
    const [chartWidth, setChartWidth] = useState(0);

    useEffect(() => {
        if (!isCommonList) {
            return;
        }

        Promise.all(
            pools.map(pool =>
                getPoolMembersCount((pool as SorobanPool).address).then(
                    ({ membersCount }) => membersCount,
                ),
            ),
        ).then(res => {
            setPoolMembers(res);
        });

        Promise.all(
            pools.map(pool =>
                getPoolStats((pool as SorobanPool).address).then(({ stats }) => stats),
            ),
        ).then(res => {
            setPoolStats(res);
        });
    }, []);

    const openPool = (id: string) => {
        setExpandedIndexes(withDeposit ? [id] : [...expandedIndexes, id]);
    };

    const closePool = (id: string) => {
        setExpandedIndexes(withDeposit ? [] : [...expandedIndexes.filter(i => i !== id)]);
    };

    const togglePool = (id: string) => {
        if (expandedIndexes.includes(id)) {
            return closePool(id);
        }
        openPool(id);
    };

    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!poolStats || !expandedIndexes.length) {
            return;
        }
        const updateWidth = () => {
            if (chartRef.current) {
                setChartWidth(chartRef.current.offsetWidth - 32);
            }
        };
        updateWidth();

        const handleResize = () => {
            requestAnimationFrame(updateWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [poolStats, expandedIndexes]);

    const rates = useMemo(
        () =>
            pools.map(pool => {
                if (pool.total_share === 0) {
                    return null;
                }

                const results = [];

                for (let i = 0; i < pool.tokens.length; i++) {
                    let result = `1 ${pool.tokens[i].code}`;
                    const baseShare = pool.reserves[i];

                    for (let j = 0; j < pool.tokens.length; j++) {
                        if (i !== j) {
                            const conversionRate = formatBalance(pool.reserves[j] / baseShare);
                            result += ` = ${conversionRate} ${pool.tokens[j].code}`;
                        }
                    }

                    results.push(result);
                }

                return results;
            }),
        [pools],
    );

    return (
        <>
            {pools.map((pool: SorobanPool | PoolClassicProcessed, index: number) => {
                const balance = new BigNumber(((pool as PoolUserProcessed).balance ?? 0).toString())
                    .div(1e7)
                    .toString();
                const totalShare = new BigNumber((pool as SorobanPool).total_share?.toString())
                    .div(1e7)
                    .toString();
                return (
                    <PoolBlock
                        key={(pool as SorobanPool).address ?? (pool as PoolClassicProcessed).id}
                    >
                        <PoolMain>
                            <MarketStyled
                                assets={pool.tokens}
                                poolAddress={!withDeposit && (pool as SorobanPool).address}
                                withoutLink
                                mobileVerticalDirections
                                poolType={pool.pool_type}
                                isRewardsOn={Boolean(Number((pool as SorobanPool).reward_tps))}
                                fee={pool.fee.toString()}
                            />

                            <PoolStats $isSinglePool={isCommonList && pools.length === 1}>
                                <div>
                                    <span>Daily Rewards:</span>
                                    <span>
                                        {formatBalance(
                                            (+(pool as SorobanPool).reward_tps / 1e7) *
                                                60 *
                                                60 *
                                                24,
                                            true,
                                        )}{' '}
                                        AQUA
                                    </span>
                                </div>
                                <div>
                                    <span>TVL:</span>
                                    <span>
                                        $
                                        {formatBalance(
                                            (Number(pool.liquidity) *
                                                StellarService.priceLumenUsd) /
                                                1e7,
                                            true,
                                        )}
                                    </span>
                                </div>
                            </PoolStats>

                            {isCommonList && pools.length === 1 ? null : (
                                <ExpandButton
                                    onClick={() =>
                                        togglePool(
                                            (pool as SorobanPool).address ??
                                                (pool as PoolClassicProcessed).id,
                                        )
                                    }
                                >
                                    <ArrowDown
                                        $isOpen={expandedIndexes.includes(
                                            (pool as SorobanPool).address ??
                                                (pool as PoolClassicProcessed).id,
                                        )}
                                    />
                                </ExpandButton>
                            )}
                        </PoolMain>
                        {expandedIndexes.includes(
                            (pool as SorobanPool).address ?? (pool as PoolClassicProcessed).id,
                        ) && (
                            <ExpandedBlock $withoutTopPadding={withDeposit}>
                                {withDeposit ? (
                                    <DepositToPool
                                        params={{
                                            pool: pool as PoolExtended,
                                            isModal: false,
                                            baseAmount,
                                            counterAmount,
                                            base,
                                            counter,
                                            onUpdate,
                                        }}
                                        confirm={() => {
                                            if (onConfirm) {
                                                onConfirm();
                                            }
                                        }}
                                        close={() => void 0}
                                    />
                                ) : (
                                    <>
                                        {isCommonList &&
                                            poolStats &&
                                            Boolean(poolStats[index].length) && (
                                                <Charts>
                                                    <Chart ref={chartRef}>
                                                        <VolumeChart
                                                            data={poolStats[index]}
                                                            volume24h={{
                                                                volume_usd: (pool as SorobanPool)
                                                                    .volume_usd,
                                                            }}
                                                            width={chartWidth}
                                                            height={320}
                                                            defaultPeriod={ChartPeriods.month}
                                                        />
                                                    </Chart>
                                                    <Chart>
                                                        <LiquidityChart
                                                            data={poolStats[index]}
                                                            currentLiquidity={
                                                                (pool as SorobanPool).liquidity_usd
                                                            }
                                                            width={chartWidth}
                                                            height={320}
                                                            defaultPeriod={ChartPeriods.month}
                                                        />
                                                    </Chart>
                                                </Charts>
                                            )}
                                        {Boolean((pool as PoolUserProcessed).balance) && (
                                            <ExpandedDataRow>
                                                <span>Pool shares:</span>
                                                <span>
                                                    {formatBalance(+balance, true)} (
                                                    {Number(pool.total_share)
                                                        ? formatBalance(
                                                              (100 * +balance) / +totalShare,
                                                              true,
                                                          )
                                                        : '0'}
                                                    %)
                                                </span>
                                            </ExpandedDataRow>
                                        )}

                                        {pool.tokens.map((asset, index: number) => (
                                            <ExpandedDataRow key={asset.code + asset.issuer}>
                                                <span>Total {asset.code}:</span>
                                                <span>
                                                    {formatBalance(
                                                        +contractValueToAmount(
                                                            pool.reserves[index],
                                                            (asset as SorobanToken).decimal,
                                                        ),
                                                        true,
                                                    )}
                                                    <Asset asset={asset} onlyLogoSmall />
                                                </span>
                                            </ExpandedDataRow>
                                        ))}
                                        {isCommonList && (
                                            <>
                                                <ExpandedDataRow>
                                                    <span>Total share:</span>
                                                    <span>
                                                        {formatBalance(+pool.total_share / 1e7)}
                                                    </span>
                                                </ExpandedDataRow>
                                                <ExpandedDataRow>
                                                    <span>Members:</span>
                                                    <span>
                                                        {poolMembers ? (
                                                            formatBalance(poolMembers[index])
                                                        ) : (
                                                            <DotsLoader />
                                                        )}
                                                    </span>
                                                </ExpandedDataRow>
                                                <ExpandedDataRow>
                                                    <span>Pool hash:</span>
                                                    <span>
                                                        <CopyButton
                                                            text={(pool as SorobanPool).index}
                                                            isBlackText
                                                        >
                                                            {truncateString(
                                                                (pool as SorobanPool).index,
                                                            )}
                                                        </CopyButton>
                                                    </span>
                                                </ExpandedDataRow>
                                                <ExpandedDataRow>
                                                    <span>Pool address:</span>
                                                    <span>
                                                        <CopyButton
                                                            text={(pool as SorobanPool).address}
                                                            isBlackText
                                                        >
                                                            {truncateString(
                                                                (pool as SorobanPool).address,
                                                            )}
                                                        </CopyButton>
                                                    </span>
                                                </ExpandedDataRow>
                                                {Boolean(Number(pool.total_share)) && (
                                                    <ExpandedDataRow>
                                                        <span>Exchange rates:</span>
                                                        <Rates>
                                                            {rates[index]
                                                                ? rates[index].map(rate => (
                                                                      <span key={rate}>{rate}</span>
                                                                  ))
                                                                : 'Empty pool'}
                                                        </Rates>
                                                    </ExpandedDataRow>
                                                )}
                                            </>
                                        )}
                                        {!isCommonList && (
                                            <Buttons>
                                                {Boolean((pool as PoolUserProcessed).balance) && (
                                                    <Button
                                                        fullWidth
                                                        onClick={() =>
                                                            pool.pool_type === POOL_TYPE.classic
                                                                ? ModalService.openModal(
                                                                      MigrateLiquidityStep1,
                                                                      {
                                                                          pool,
                                                                          base: pool.tokens[0],
                                                                          counter: pool.tokens[1],
                                                                      },
                                                                  ).then(() => onUpdate())
                                                                : ModalService.openModal(
                                                                      WithdrawFromPool,
                                                                      {
                                                                          pool,
                                                                      },
                                                                  ).then(() => onUpdate())
                                                        }
                                                    >
                                                        Remove liquidity
                                                    </Button>
                                                )}

                                                {pool.pool_type === POOL_TYPE.classic ? (
                                                    <MigratePoolButton
                                                        pool={pool as PoolClassicProcessed}
                                                        onUpdate={() => onUpdate()}
                                                    />
                                                ) : (
                                                    <Button
                                                        fullWidth
                                                        onClick={(e: React.MouseEvent) => {
                                                            e.preventDefault();
                                                            ModalService.openModal(
                                                                DepositToPool,
                                                                {
                                                                    pool,
                                                                    onUpdate,
                                                                },
                                                                false,
                                                                null,
                                                                true,
                                                            );
                                                        }}
                                                        disabled={
                                                            (pool as SorobanPool).deposit_killed
                                                        }
                                                    >
                                                        Add liquidity
                                                    </Button>
                                                )}
                                            </Buttons>
                                        )}
                                    </>
                                )}
                            </ExpandedBlock>
                        )}
                    </PoolBlock>
                );
            })}
        </>
    );
};

export default PoolsList;
