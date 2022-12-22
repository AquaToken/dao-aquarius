import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import ProgressLine from '../../../../../common/basics/ProgressLine';
import {
    formatBalance,
    getDateString,
    roundToPrecision,
} from '../../../../../common/helpers/helpers';
import { respondDown } from '../../../../../common/mixins';
import { useCallback } from 'react';

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

const CurrentLocks = ({ locks, aquaBalance, distributions }) => {
    const locksSum = locks.reduce((acc, lock) => {
        acc += Number(lock.amount);
        return acc;
    }, 0);

    const percent = roundToPrecision((locksSum / (aquaBalance + locksSum)) * 100, 2);

    const getIceAmount = useCallback(
        (balanceId) => {
            return distributions.find((distribution) => distribution.balance_id === balanceId)
                ?.distributed_amount;
        },
        [distributions, locks],
    );

    return (
        <Container>
            <Title>Current locks </Title>
            <ProgressLine
                percent={+percent}
                leftLabel={`Locked: ${formatBalance(locksSum)} AQUA (${percent}%)`}
                rightLabel={`${formatBalance(aquaBalance + locksSum)} AQUA`}
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
