import * as React from 'react';
import { useState } from 'react';
import Pair from '../../../vote/components/common/Pair';
import { formatBalance } from '../../../../common/helpers/helpers';
import Button from '../../../../common/basics/Button';
import { ModalService, StellarService } from '../../../../common/services/globalServices';
import WithdrawFromPool from '../WithdrawFromPool/WithdrawFromPool';
import DepositToPool from '../DepositToPool/DepositToPool';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import Arrow from '../../../../common/assets/img/icon-arrow-down.svg';
import Asset from '../../../vote/components/AssetDropdown/Asset';

const PoolBlock = styled.div`
    display: flex;
    flex-direction: column;
    margin: 2rem 0;
`;

const PoolMain = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;

    ${respondDown(Breakpoints.sm)`
        padding: 1rem;
        flex-direction: column;
        background-color: ${COLORS.lightGray};
        border-radius: 0.6rem;
        align-items: unset;
    `}
`;

const PoolStat = styled.div`
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
    `}//span:last-child {
    //    font-size: 1.4rem;
    //    font-weight: 400;
    //    line-height: 1.6rem;
    //}
`;

const ExpandButton = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.lightGray};
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

const ExpandedBlock = styled.div`
    display: flex;
    flex-direction: column;
    padding: 3rem 2.4rem;
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

    ${respondDown(Breakpoints.sm)`
        margin-top: 0;
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

const Buttons = styled.div`
    ${flexRowSpaceBetween};
    gap: 0.8rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

const PoolsList = ({ pools, onUpdate, isUserList }) => {
    const [expandedIndexes, setExpandedIndexes] = useState([]);
    const togglePool = (id) => {
        if (expandedIndexes.includes(id)) {
            return closePool(id);
        }
        openPool(id);
    };

    const openPool = (id) => {
        setExpandedIndexes([...expandedIndexes, id]);
    };

    const closePool = (id) => {
        setExpandedIndexes([...expandedIndexes.filter((i) => i !== id)]);
    };
    return (
        <>
            {pools.map((pool) => {
                const balance = pool.balance / 1e7;
                const liquidity = pool.liquidity / 1e7;
                const totalShare = pool.total_share / 1e7;
                return (
                    <PoolBlock>
                        <PoolMain>
                            <Pair
                                base={pool.assets[0]}
                                counter={pool.assets[1]}
                                thirdAsset={pool.assets[2]}
                                fourthAsset={pool.assets[3]}
                                poolAddress={pool.address}
                                withoutLink
                                mobileVerticalDirections
                            />
                            <PoolStat>
                                <label>My Liquidity:</label>
                                <span>
                                    $
                                    {formatBalance(
                                        (isUserList
                                            ? (balance / totalShare) * liquidity
                                            : liquidity) * StellarService.priceLumenUsd,
                                        true,
                                    )}
                                </span>
                                {/*<span>Daily fee: {'<'}0.01%</span>*/}
                            </PoolStat>
                            <ExpandButton onClick={() => togglePool(pool.address)}>
                                <ArrowDown $isOpen={expandedIndexes.includes(pool.address)} />
                            </ExpandButton>
                        </PoolMain>
                        {expandedIndexes.includes(pool.address) && (
                            <ExpandedBlock>
                                {Boolean(pool.balance) && (
                                    <ExpandedDataRow>
                                        <span>Pool shares:</span>
                                        <span>
                                            {formatBalance(balance, true)} (
                                            {Number(pool.total_share)
                                                ? formatBalance((100 * balance) / totalShare, true)
                                                : '0'}
                                            %)
                                        </span>
                                    </ExpandedDataRow>
                                )}
                                {pool.assets.map((asset, index) => (
                                    <ExpandedDataRow key={asset.code + asset.issuer}>
                                        <span>
                                            {isUserList ? 'Pooled' : 'Total'} {asset.code}:
                                        </span>
                                        <span>
                                            {!isUserList
                                                ? formatBalance(pool.reserves[index] / 1e7)
                                                : Number(pool.total_share)
                                                ? formatBalance(
                                                      ((pool.reserves[index] / 1e7) * balance) /
                                                          totalShare,
                                                  )
                                                : '0'}{' '}
                                            <Asset asset={asset} onlyLogoSmall />
                                        </span>
                                    </ExpandedDataRow>
                                ))}
                                {Boolean(pool.liquidity) && (
                                    <ExpandedDataRow>
                                        <span>Total liquidity:</span>
                                        <span>
                                            $
                                            {formatBalance(
                                                liquidity * StellarService.priceLumenUsd,
                                                true,
                                            )}
                                        </span>
                                    </ExpandedDataRow>
                                )}
                                <ExpandedDataRow>
                                    <span>Fee</span>
                                    <span>{pool.fee * 100}%</span>
                                </ExpandedDataRow>
                                <Buttons>
                                    {Boolean(pool.balance) && (
                                        <Button
                                            fullWidth
                                            onClick={() =>
                                                ModalService.openModal(WithdrawFromPool, {
                                                    pool,
                                                    accountShare: balance,
                                                }).then(() => onUpdate())
                                            }
                                        >
                                            Remove liquidity
                                        </Button>
                                    )}
                                    <Button
                                        fullWidth
                                        onClick={(e) => {
                                            e.preventDefault();
                                            ModalService.openModal(DepositToPool, {
                                                pool,
                                            }).then(() => onUpdate());
                                        }}
                                    >
                                        Add liquidity
                                    </Button>
                                </Buttons>
                            </ExpandedBlock>
                        )}
                    </PoolBlock>
                );
            })}
        </>
    );
};

export default PoolsList;
