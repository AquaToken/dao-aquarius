import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { PairStats, TotalStats } from '../../../api/types';
import { formatBalance } from '../../../../common/helpers/helpers';
import Pair from '../../common/Pair';
import PageLoader from '../../../../common/basics/PageLoader';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import VoteButton from './VoteButton/VoteButton';
import ThreeDotsMenu from './ThreeDotsMenu/ThreeDotsMenu';
import VoteAmount from './VoteAmount/VoteAmount';

const TableBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
`;

const TableLoader = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
    ${flexAllCenter};
    animation: showLoader 0.1s ease-in-out;

    @keyframes showLoader {
        0% {
            background-color: rgba(255, 255, 255, 0);
        }
        100% {
            background-color: rgba(255, 255, 255, 0.8);
        }
    }
`;
const TableHead = styled.div`
    display: flex;
    width: 100%;

    ${respondDown(Breakpoints.md)`
         display: none;
    `}
`;
const TableHeadRow = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 5.2rem;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    white-space: nowrap;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    flex: 2 0 0;
    min-width: 14rem;
    max-width: 100%;
`;

const PairInfo = styled(TableCell)`
    flex: 4;
    min-width: 48rem;
    ${respondDown(Breakpoints.md)`
            margin-bottom: 3.2rem;
    `}
`;

const VoteStats = styled(TableCell)`
    flex: 1;
    min-width: 10rem;
    label {
        display: none;
    }

    ${respondDown(Breakpoints.md)`
        ${flexRowSpaceBetween};
        align-items: flex-start;
        margin-bottom: 1.6rem;
        
        label {
            display: block;
         }
    `}
`;

const ButtonBlock = styled(TableCell)`
    flex: 1;
    justify-content: flex-end;
    min-width: 17rem;

    ${respondDown(Breakpoints.md)`
          justify-content: center;
    `}
`;

const TableBody = styled.div`
    display: flex;
    flex-direction: column;
`;

const TableBodyRow = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 9.6rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    position: relative;

    ${TableCell}:nth-child(2) {
        font-size: 1.4rem;
        line-height: 2rem;
        color: ${COLORS.grayText};
    }

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        background: ${COLORS.white};
        border-radius: 0.5rem;
        margin-bottom: 1.6rem;
        padding: 2.7rem 1.6rem 1.6rem;
    `}
`;

const ThreeDotsMenuWeb = styled(ThreeDotsMenu)`
    ${respondDown(Breakpoints.md)`
          display: none
    `}
`;

const ThreeDotsMenuMobile = styled(ThreeDotsMenu)`
    display: none;
    ${respondDown(Breakpoints.md)`
          display: block;
          position: absolute;
          top: 1.6rem;
          right: 1.6rem;
    `}
`;

// const SortingHeader = styled.button`
//     background: none;
//     border: none;
//     cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
//     padding: 0;
//     margin: 0;
//     width: 100%;
//     height: 100%;
//     color: inherit;
//
//     display: flex;
//     align-items: center;
//     justify-content: ${({ position }: { position?: string }) => {
//         if (position === 'right') return 'flex-end';
//         if (position === 'left') return 'flex-start';
//         return 'center';
//     }};
//
//     & > svg {
//         margin-left: 0.4rem;
//     }
//     &:hover {
//         color: ${COLORS.purple};
//     }
// `;

const MIN_REWARDS_PERCENT = 1;

const isRewardsOn = (value: string, total: string): boolean => {
    const percent = (Number(value) / Number(total)) * 100;

    return percent >= MIN_REWARDS_PERCENT;
};

const Table = ({
    pairs,
    selectedPairs,
    selectPair,
    loading,
    totalStats,
}: {
    pairs: PairStats[];
    selectedPairs: PairStats[];
    selectPair: (PairStats) => void;
    loading: boolean;
    totalStats: TotalStats;
}): JSX.Element => {
    if (!pairs.length) {
        return null;
    }

    const isPairSelected = ({ market_key: marketKey }: PairStats): boolean => {
        return selectedPairs.some((pair) => pair.market_key === marketKey);
    };
    return (
        <TableBlock>
            {(loading || !totalStats) && (
                <TableLoader>
                    <PageLoader />
                </TableLoader>
            )}

            <TableHead>
                <TableHeadRow>
                    <TableCell>Pair</TableCell>
                    <TableCell>Users Voted</TableCell>
                    <TableCell>AQUA Voted</TableCell>
                    <TableCell>Your Vote</TableCell>
                </TableHeadRow>
            </TableHead>
            <TableBody>
                {pairs.map((pair) => {
                    return (
                        <TableBodyRow key={pair.id}>
                            <PairInfo>
                                <Pair
                                    base={{ code: pair.asset1_code, issuer: pair.asset1_issuer }}
                                    counter={{ code: pair.asset2_code, issuer: pair.asset2_issuer }}
                                    isRewardsOn={isRewardsOn(
                                        pair.votes_value,
                                        totalStats.votes_value_sum,
                                    )}
                                    mobileVerticalDirections
                                />
                            </PairInfo>
                            <VoteStats>
                                <label>Users Voted:</label>
                                {pair.voting_amount ? formatBalance(pair.voting_amount) : null}
                            </VoteStats>
                            <VoteStats>
                                <label>AQUA Voted:</label>
                                <VoteAmount pair={pair} totalStats={totalStats} />
                            </VoteStats>
                            <ButtonBlock>
                                <VoteButton
                                    marketKeyUp={pair.market_key}
                                    marketKeyDown={pair.downvote_account_id}
                                    isPairSelected={isPairSelected(pair)}
                                    onButtonClick={() => selectPair(pair)}
                                />
                                <ThreeDotsMenuWeb pair={pair} />
                            </ButtonBlock>
                            <ThreeDotsMenuMobile pair={pair} />
                        </TableBodyRow>
                    );
                })}
            </TableBody>
        </TableBlock>
    );
};

export default Table;
