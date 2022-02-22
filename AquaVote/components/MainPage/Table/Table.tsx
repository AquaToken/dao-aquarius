import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { PairStats, TotalStats } from '../../../api/types';
import { formatBalance } from '../../../../common/helpers/helpers';
import Pair from '../../common/Pair';
import PageLoader from '../../../../common/basics/PageLoader';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import VoteButton from './VoteButton/VoteButton';
import VoteAmount from './VoteAmount/VoteAmount';
import Button from '../../../../common/basics/Button';
import ManageIcon from '../../../../common/assets/img/icon-manage.svg';
import Tooltip, { TOOLTIP_POSITION } from '../../../../common/basics/Tooltip';
import { useState } from 'react';
import { ModalService } from '../../../../common/services/globalServices';
import ManageVotesModal from '../ManageVotesModal/ManageVotesModal';

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
export const TableHead = styled.div`
    display: flex;
    width: 100%;

    ${respondDown(Breakpoints.md)`
         display: none;
    `}
`;
export const TableHeadRow = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 5.2rem;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    white-space: nowrap;
`;

export const TableCell = styled.div`
    display: flex;
    align-items: center;
    flex: 2 0 0;
    min-width: 14rem;
    max-width: 100%;
`;

const PairInfo = styled(TableCell)`
    flex: 2;
    min-width: 48rem;
    ${respondDown(Breakpoints.md)`
        margin-bottom: 3.2rem;
    `}
`;

const VoteStats = styled(TableCell)`
    flex: 0.5;

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

const AquaVoted = styled(VoteStats)`
    flex: 1;
`;

const ButtonBlock = styled(TableCell)`
    flex: 1.5;
    justify-content: flex-end;
    min-width: 17rem;
`;

export const TableBody = styled.div`
    display: flex;
    flex-direction: column;
`;

export const TableBodyRow = styled.div`
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
        
        ${TableCell}:nth-child(2) {
            font-size: 1.6rem;
            line-height: 2.8rem;
            color: ${COLORS.grayText};
        }
    `}
`;

const ManageButton = styled(Button)`
    margin-left: 0.8rem;
`;

const TooltipInner = styled.div`
    font-size: 1.2rem;
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

export const MIN_REWARDS_PERCENT = 1;

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
    isYourVotes,
}: {
    pairs: PairStats[];
    selectedPairs: PairStats[];
    selectPair: (PairStats) => void;
    loading: boolean;
    totalStats: TotalStats;
    isYourVotes: boolean;
}): JSX.Element => {
    const [showTooltipId, setShowTooltipId] = useState(null);
    if (!pairs.length) {
        return null;
    }

    const isPairSelected = ({ market_key: marketKey }: PairStats): boolean => {
        return selectedPairs.some((pair) => pair.market_key === marketKey);
    };

    const manageVotes = (pair) => {
        ModalService.openModal(ManageVotesModal, { pair });
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
                    <PairInfo>Pair</PairInfo>
                    <VoteStats>Users Voted</VoteStats>
                    <AquaVoted>AQUA Voted</AquaVoted>
                    <ButtonBlock>Your Vote</ButtonBlock>
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
                                    isRewardsOn={
                                        (isRewardsOn(
                                            pair.votes_value,
                                            totalStats.votes_value_sum,
                                        ) ||
                                            Number(pair.adjusted_votes_value) >
                                                Number(pair.votes_value)) &&
                                        isRewardsOn(
                                            pair.adjusted_votes_value,
                                            totalStats.adjusted_votes_value_sum,
                                        )
                                    }
                                    mobileVerticalDirections
                                    authRequired={pair.auth_required}
                                    noLiquidity={pair.no_liquidity}
                                    boosted={
                                        Number(pair.adjusted_votes_value) > Number(pair.votes_value)
                                    }
                                />
                            </PairInfo>
                            <VoteStats>
                                <label>Users Voted:</label>
                                {pair.voting_amount ? formatBalance(pair.voting_amount) : null}
                            </VoteStats>
                            <AquaVoted>
                                <label>AQUA Voted:</label>
                                <VoteAmount pair={pair} totalStats={totalStats} />
                            </AquaVoted>
                            <ButtonBlock>
                                <VoteButton
                                    pair={pair}
                                    isPairSelected={isPairSelected(pair)}
                                    onButtonClick={() => selectPair(pair)}
                                    disabled={pair.auth_required || pair.no_liquidity}
                                />
                                {isYourVotes && (
                                    <Tooltip
                                        content={<TooltipInner>Manage votes</TooltipInner>}
                                        position={TOOLTIP_POSITION.top}
                                        isShow={showTooltipId === pair.account_id}
                                    >
                                        <ManageButton
                                            isSquare
                                            likeDisabled
                                            onMouseEnter={() => setShowTooltipId(pair.account_id)}
                                            onMouseLeave={() => setShowTooltipId(null)}
                                            onClick={() => manageVotes(pair)}
                                        >
                                            <ManageIcon />
                                        </ManageButton>
                                    </Tooltip>
                                )}
                            </ButtonBlock>
                        </TableBodyRow>
                    );
                })}
            </TableBody>
        </TableBlock>
    );
};

export default Table;
