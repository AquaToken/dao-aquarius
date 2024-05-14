import * as React from 'react';
import Pair from '../../../vote/components/common/Pair';
import { formatBalance } from '../../../../common/helpers/helpers';
import Button from '../../../../common/basics/Button';
import { ModalService } from '../../../../common/services/globalServices';
import WithdrawFromPool from '../WithdrawFromPool/WithdrawFromPool';
import DepositToPool from '../DepositToPool/DepositToPool';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import Arrow from '../../../../common/assets/img/icon-arrow-down.svg';
import { useState } from 'react';

const PoolBlock = styled.div`
    display: flex;
    flex-direction: column;
    margin: 2rem 0;
`;

const PoolMain = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;
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

    span:last-child {
        font-size: 1.4rem;
        font-weight: 400;
        line-height: 1.6rem;
    }
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
`;

const ExpandedDataRow = styled.div`
    ${flexRowSpaceBetween};
    color: ${COLORS.grayText};
    gap: 0.8rem;

    span:last-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
    }

    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }
`;
const PoolsList = ({ pools, onUpdate }) => {
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
                console.log(pool.address);
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
                            />
                            <PoolStat>
                                <span>$1.53</span>
                                <span>Daily fee: {'<'}0.01%</span>
                            </PoolStat>
                            <ExpandButton onClick={() => togglePool(pool.address)}>
                                <ArrowDown $isOpen={expandedIndexes.includes(pool.address)} />
                            </ExpandButton>
                        </PoolMain>
                        {expandedIndexes.includes(pool.address) && (
                            <ExpandedBlock>
                                {Boolean(pool.balance) && (
                                    <ExpandedDataRow>
                                        <span>Shares </span>
                                        <span>{formatBalance(pool.balance / 1e7)}</span>
                                    </ExpandedDataRow>
                                )}
                                {Boolean(pool.liquidity) && (
                                    <ExpandedDataRow>
                                        <span>Liquidity</span>
                                        <span>{formatBalance(pool.liquidity / 1e7)}</span>
                                    </ExpandedDataRow>
                                )}
                                <ExpandedDataRow>
                                    <span>Fee</span>
                                    <span>{pool.fee * 100}%</span>
                                </ExpandedDataRow>
                                <ExpandedDataRow>
                                    {Boolean(pool.balance) && (
                                        <Button
                                            fullWidth
                                            onClick={() =>
                                                ModalService.openModal(WithdrawFromPool, {
                                                    pool,
                                                    accountShare: pool.balance / 1e7,
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
                                </ExpandedDataRow>
                            </ExpandedBlock>
                        )}
                    </PoolBlock>
                );
            })}
        </>
    );
};

export default PoolsList;
