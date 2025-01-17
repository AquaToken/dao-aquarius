import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getPoolMembersCount, getPoolStats } from 'api/amm';

import { formatBalance } from 'helpers/format-number';
import { truncateString } from 'helpers/truncate-string';

import { ModalService, StellarService } from 'services/globalServices';
import { POOL_TYPE } from 'services/soroban.service';

import { PoolClassicProcessed, PoolExtended, PoolProcessed, PoolUserProcessed } from 'types/amm';
import { Asset as AssetType } from 'types/stellar';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import MigrateLiquidityStep1 from 'web/modals/migrate-liquidity/MigrateLiquidityStep1';
import { Breakpoints, COLORS } from 'web/styles';

import Arrow from 'assets/icon-arrow-down.svg';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import { DotsLoader } from 'basics/loaders';
import Market from 'basics/Market';

import LiquidityChart from 'pages/amm/components/LiquidityChart/LiquidityChart';
import VolumeChart from 'pages/amm/components/VolumeChart/VolumeChart';

import MigratePoolButton from './MigratePoolButton/MigratePoolButton';

import CopyButton from '../../../../web/basics/buttons/CopyButton';
import DepositToPool from '../DepositToPool/DepositToPool';
import WithdrawFromPool from '../WithdrawFromPool/WithdrawFromPool';

const PoolBlock = styled.div`
    display: flex;
    flex-direction: column;
    padding: 2rem 1rem;
    background: ${COLORS.purple}12;
    border-radius: 0.5rem;
    margin-bottom: 1.6rem;
`;

const PoolMain = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;

    ${respondDown(Breakpoints.sm)`
        padding: 1rem;
        flex-direction: column;
        border-radius: 0.6rem;
        align-items: unset;
    `}
`;

const PoolLiquidity = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 2.8rem;
    margin-left: auto;
    white-space: nowrap;

    label {
        color: ${COLORS.grayText};
        font-weight: 400;
        display: none;
    }

    ${respondDown(Breakpoints.sm)`
        margin-left: unset;
        flex-direction: row;
        justify-content: space-between;
        
        label {
            display: block;
        }
    `}
`;

const PoolStats = styled.div`
    display: flex;
    align-items: center;
    width: 50%;
    gap: 1.4rem;

    div {
        display: flex;
        flex-direction: column;

        &:nth-child(1) {
            flex: 1;
        }

        &:nth-child(2),
        &:nth-child(3) {
            flex: 2;
        }

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

    ${respondDown(Breakpoints.sm)`
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
    background-color: ${COLORS.white};
    border-radius: 0.6rem;
    height: 4.8rem;
    width: 4.8rem;
    min-width: 4.8rem;
    cursor: pointer;

    &:hover {
        background-color: ${COLORS.gray};
    }

    ${respondDown(Breakpoints.sm)`
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

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

const ExpandedBlock = styled.div<{ $withoutTopPadding?: boolean }>`
    display: flex;
    flex-direction: column;
    padding: ${({ $withoutTopPadding }) => ($withoutTopPadding ? '0 2.4rem 2rem' : '3rem 2.4rem')};
    border-radius: 0.6rem;
    background-color: ${COLORS.white};
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

    ${respondDown(Breakpoints.sm)`
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

    ${respondDown(Breakpoints.sm)`
        span {
            font-size: 1.2rem!important;
        }
    `}
`;

const Buttons = styled.div`
    ${flexRowSpaceBetween};
    gap: 0.8rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

type SorobanPool = PoolProcessed | PoolUserProcessed;

interface PoolsListProps {
    pools: SorobanPool[] | PoolClassicProcessed[];
    onUpdate: () => void;
    isUserList?: boolean;
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
    isUserList,
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

    const rates = useMemo(
        () =>
            pools.map(pool => {
                if (pool.total_share === 0) {
                    return null;
                }

                const results = [];

                for (let i = 0; i < pool.assets.length; i++) {
                    let result = `1 ${pool.assets[i].code}`;
                    const baseShare = pool.reserves[i];

                    for (let j = 0; j < pool.assets.length; j++) {
                        if (i !== j) {
                            const conversionRate = formatBalance(pool.reserves[j] / baseShare);
                            result += ` = ${conversionRate} ${pool.assets[j].code}`;
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
                const liquidity = new BigNumber((pool as SorobanPool).liquidity?.toString())
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
                            <Market
                                assets={pool.assets}
                                poolAddress={!withDeposit && (pool as SorobanPool).address}
                                withoutLink
                                mobileVerticalDirections
                                poolType={pool.pool_type}
                                isRewardsOn={Boolean(Number((pool as SorobanPool).reward_tps))}
                            />
                            {!isUserList ? (
                                <PoolStats>
                                    <div>
                                        <span>Fee:</span>
                                        <span>{(Number(pool.fee) * 100).toFixed(2)}%</span>
                                    </div>
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
                            ) : (
                                <PoolLiquidity>
                                    <label>My Liquidity</label>
                                    <span>
                                        $
                                        {formatBalance(
                                            (+balance / +totalShare) *
                                                +liquidity *
                                                StellarService.priceLumenUsd,
                                            true,
                                        )}
                                    </span>
                                </PoolLiquidity>
                            )}
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
                                                    <VolumeChart
                                                        data={poolStats[index]}
                                                        volume24h={{
                                                            volume_usd: (pool as SorobanPool)
                                                                .volume_usd,
                                                        }}
                                                        width={Math.min(
                                                            450,
                                                            +window.innerWidth - 105,
                                                        )}
                                                        height={320}
                                                    />
                                                    <LiquidityChart
                                                        data={poolStats[index]}
                                                        currentLiquidity={
                                                            (pool as SorobanPool).liquidity_usd
                                                        }
                                                        width={Math.min(
                                                            450,
                                                            +window.innerWidth - 105,
                                                        )}
                                                        height={320}
                                                    />
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

                                        {pool.pool_type !== POOL_TYPE.classic && isUserList && (
                                            <ExpandedDataRow>
                                                <span>Daily rewards:</span>
                                                <span>
                                                    {formatBalance(
                                                        ((+(pool as SorobanPool).reward_tps / 1e7) *
                                                            60 *
                                                            60 *
                                                            24 *
                                                            +balance) /
                                                            +totalShare,
                                                        true,
                                                    )}{' '}
                                                    AQUA
                                                </span>
                                            </ExpandedDataRow>
                                        )}

                                        {pool.assets.map((asset: AssetType, index: number) => (
                                            <ExpandedDataRow key={asset.code + asset.issuer}>
                                                <span>
                                                    {isUserList ? 'Pooled' : 'Total'} {asset.code}:
                                                </span>
                                                <span>
                                                    {!isUserList
                                                        ? formatBalance(+pool.reserves[index] / 1e7)
                                                        : Number(pool.total_share)
                                                        ? formatBalance(
                                                              ((+pool.reserves[index] / 1e7) *
                                                                  +balance) /
                                                                  +totalShare,
                                                          )
                                                        : '0'}{' '}
                                                    <Asset asset={asset} onlyLogoSmall />
                                                </span>
                                            </ExpandedDataRow>
                                        ))}
                                        {isUserList && (
                                            <ExpandedDataRow>
                                                <span>Fee</span>
                                                <span>{(+pool.fee * 100).toFixed(2)}%</span>
                                            </ExpandedDataRow>
                                        )}
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
                                                                          base: pool.assets[0],
                                                                          counter: pool.assets[1],
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
