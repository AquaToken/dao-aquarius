import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import ProgressLine from '../../../../common/basics/ProgressLine';
import { getDateString, roundToPrecision } from '../../../../common/helpers/helpers';

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
`;

const TableCell = styled.div`
    flex: 1;
`;

const TableCellAmount = styled.div`
    flex: 2;
    text-align: right;
`;

const CurrentLocks = ({ locks, aquaBalance }) => {
    const locksSum = locks.reduce((acc, lock) => {
        acc += Number(lock.amount);
        return acc;
    }, 0);

    const percent = roundToPrecision((locksSum / (aquaBalance + locksSum)) * 100, 2);
    return (
        <Container>
            <Title>Current locks </Title>
            <ProgressLine
                percent={+percent}
                leftLabel={`Locked: ${locksSum} AQUA (${percent}%)`}
                rightLabel={`${aquaBalance + locksSum} AQUA`}
            />
            <LocksList>
                <HeaderRow>
                    <TableCell>Lock start </TableCell>
                    <TableCell>Lock end</TableCell>
                    <TableCellAmount>AQUA locked</TableCellAmount>
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
                        <TableCellAmount>{lock.amount}</TableCellAmount>
                    </TableRow>
                ))}
            </LocksList>
        </Container>
    );
};

export default CurrentLocks;
