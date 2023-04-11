import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import ProgressLine from '../../../../../common/basics/ProgressLine';
import {
    formatBalance,
    getDateString,
    roundToPrecision,
} from '../../../../../common/helpers/helpers';
import { flexRowSpaceBetween, respondDown } from '../../../../../common/mixins';
import { useCallback, useMemo } from 'react';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../common/basics/Tooltip';
import Info from '../../../../../common/assets/img/icon-info.svg';

const Container = styled.div`
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 3.2rem 3.2rem 4.2rem;
`;

const Title = styled.span`
    font-size: 2rem;
    line-height: 2.8rem;
    font-weight: bold;
    color: ${COLORS.titleText};
    margin-bottom: 3.2rem;
`;

const LocksList = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 8rem;
`;

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    margin-bottom: 3.8rem;

    ${respondDown(Breakpoints.md)`
         font-size: 1.2rem;
         line-height: 1.6rem;
    `}
`;

const TableRow = styled.div`
    display: flex;
    flex-direction: row;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};

    &:not(:last-child) {
        margin-bottom: 2.2rem;
    }

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
        line-height: 2rem;
    `}
`;

const TableCell = styled.div`
    flex: 1;

    ${respondDown(Breakpoints.md)`
        flex: 2;
    `}
`;

const TableCellAmount = styled.div`
    flex: 2;
    text-align: right;
`;

const InfoIcon = styled(Info)`
    margin-left: 0.5rem;
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    width: 32rem;

    ${respondDown(Breakpoints.md)`
        width: 20rem;
    `}
`;

const TooltipRow = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    margin-bottom: 0.4rem;
`;

const TooltipTotal = styled(TooltipRow)`
    font-weight: 700;
    color: ${COLORS.paragraphText};
    font-size: 1.6rem;
    line-height: 2.8rem;
`;

const Total = styled.div`
    display: flex;
    align-items: center;
    text-align: right;

    ${respondDown(Breakpoints.md)`
        div {
            width: min-content;
        }
    `}
`;

const CurrentLocks = ({
    locks,
    aquaBalance,
    distributions,
    ammAquaBalance,
    aquaInOffers,
    aquaInVotes,
}) => {
    const locksSum = locks.reduce((acc, lock) => {
        acc += Number(lock.amount);
        return acc;
    }, 0);

    const total = useMemo(() => {
        return locksSum + aquaBalance + aquaInOffers + ammAquaBalance + aquaInVotes;
    }, [locksSum, aquaBalance, aquaInOffers, ammAquaBalance, aquaInVotes]);

    const availablePercent = useMemo(() => {
        return roundToPrecision((aquaBalance / total) * 100, 2);
    }, [total]);
    const inOffersPercent = useMemo(() => {
        return roundToPrecision((aquaInOffers / total) * 100, 2);
    }, [total]);
    const inVotesPercent = useMemo(() => {
        return roundToPrecision((aquaInVotes / total) * 100, 2);
    }, [total]);
    const ammPercent = useMemo(() => {
        return roundToPrecision((ammAquaBalance / total) * 100, 2);
    }, [total]);

    const lockPercent = useMemo(() => {
        return roundToPrecision((locksSum / total) * 100, 2);
    }, [total]);

    const getIceAmount = useCallback(
        (balanceId) => {
            return distributions.find((distribution) => distribution.balance_id === balanceId)
                ?.distributed_amount;
        },
        [distributions, locks],
    );

    return (
        <Container>
            <Title>Current locks</Title>
            <ProgressLine
                percent={+lockPercent}
                leftLabel={`Locked: ${formatBalance(locksSum, true)} AQUA (${lockPercent}%)`}
                rightLabel={
                    <Tooltip
                        content={
                            <TooltipInner>
                                <TooltipTotal>
                                    <span>Total:</span>
                                    <span>{formatBalance(total, true)} AQUA</span>
                                </TooltipTotal>
                                <TooltipRow>
                                    <span>Available:</span>
                                    <span>
                                        {formatBalance(aquaBalance, true)} ({availablePercent}%)
                                    </span>
                                </TooltipRow>
                                <TooltipRow>
                                    <span>In offers:</span>
                                    <span>
                                        {formatBalance(aquaInOffers, true)} ({inOffersPercent}%)
                                    </span>
                                </TooltipRow>
                                <TooltipRow>
                                    <span>In AMM pool:</span>
                                    <span>
                                        {formatBalance(ammAquaBalance, true)} ({ammPercent}%)
                                    </span>
                                </TooltipRow>
                                <TooltipRow>
                                    <span>In votes:</span>
                                    <span>
                                        {formatBalance(aquaInVotes, true)} ({inVotesPercent}%)
                                    </span>
                                </TooltipRow>
                                <TooltipRow>
                                    <span>Locked:</span>
                                    <span>
                                        {formatBalance(locksSum, true)} ({lockPercent}%)
                                    </span>
                                </TooltipRow>
                            </TooltipInner>
                        }
                        position={
                            +window.innerWidth > 992 ? TOOLTIP_POSITION.top : TOOLTIP_POSITION.left
                        }
                        isWhite
                        showOnHover
                    >
                        <Total>
                            <div>{formatBalance(total, true)} AQUA</div>
                            <InfoIcon />
                        </Total>
                    </Tooltip>
                }
            />
            <LocksList>
                <HeaderRow>
                    <TableCell>Lock start </TableCell>
                    <TableCell>Lock end</TableCell>
                    <TableCellAmount>AQUA locked</TableCellAmount>
                    <TableCellAmount>ICE received</TableCellAmount>
                </HeaderRow>

                {locks.map((lock) => (
                    <TableRow key={lock.id}>
                        <TableCell>
                            {getDateString(new Date(lock.last_modified_time).getTime())}
                        </TableCell>
                        <TableCell>
                            {getDateString(
                                new Date(lock.claimants?.[0].predicate?.not?.abs_before).getTime(),
                            )}
                        </TableCell>
                        <TableCellAmount>{formatBalance(lock.amount, true)} AQUA</TableCellAmount>
                        <TableCellAmount>
                            {getIceAmount(lock.id)
                                ? `${formatBalance(getIceAmount(lock.id), true)} ICE`
                                : '-'}
                        </TableCellAmount>
                    </TableRow>
                ))}
            </LocksList>
        </Container>
    );
};

export default CurrentLocks;
