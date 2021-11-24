import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import Button from '../../../../common/basics/Button';
import StatusTag from './StatusTag/StatusTag';
import { PairStats } from '../../../api/types';
import { formatBalance } from '../../../../common/helpers/helpers';
import Pair from '../../common/Pair';

const TableBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;
const TableHead = styled.div`
    display: flex;
    width: 100%;
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
    &:first-child {
        flex: 4;
        min-width: 48rem;
    }
    &:nth-child(2) {
        flex: 1;
        min-width: 10rem;
    }
    &:last-child {
        flex: 1;
        justify-content: flex-end;
        min-width: 17rem;
    }
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

    ${TableCell}:nth-child(2) {
        font-size: 1.4rem;
        line-height: 2rem;
        color: ${COLORS.grayText};
    }
`;

const SortingHeader = styled.button`
    background: none;
    border: none;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    color: inherit;

    display: flex;
    align-items: center;
    justify-content: ${({ position }: { position?: string }) => {
        if (position === 'right') return 'flex-end';
        if (position === 'left') return 'flex-start';
        return 'center';
    }};

    & > svg {
        margin-left: 0.4rem;
    }
    &:hover {
        color: ${COLORS.purple};
    }
`;

const Table = ({
    pairs,
    selectedPairs,
    selectPair,
}: {
    pairs: PairStats[];
    selectedPairs: PairStats[];
    selectPair: (PairStats) => void;
}): JSX.Element => {
    if (!pairs.length) {
        return null;
    }

    const isPairSelected = ({ market_key: marketKey }: PairStats): boolean => {
        return selectedPairs.some((pair) => pair.market_key === marketKey);
    };
    return (
        <TableBlock>
            <TableHead>
                <TableHeadRow>
                    <TableCell>Pair</TableCell>
                    <TableCell>Users Voted</TableCell>
                    <TableCell>Your AQUA in Vote</TableCell>
                    <TableCell>AQUA Voted</TableCell>
                    <TableCell />
                </TableHeadRow>
            </TableHead>
            <TableBody>
                {pairs.map((pair) => {
                    return (
                        <TableBodyRow key={pair.id}>
                            <TableCell>
                                <Pair
                                    base={{ code: pair.asset1_code, issuer: pair.asset1_issuer }}
                                    counter={{ code: pair.asset2_code, issuer: pair.asset2_issuer }}
                                />
                            </TableCell>
                            <TableCell>
                                {pair.voting_amount ? formatBalance(pair.voting_amount) : null}
                            </TableCell>
                            <TableCell>
                                <StatusTag marketKey={pair.market_key} />
                            </TableCell>
                            <TableCell>
                                {pair.votes_value
                                    ? `${formatBalance(+pair.votes_value, true)} AQUA`
                                    : null}{' '}
                            </TableCell>
                            <TableCell>
                                {isPairSelected(pair) ? (
                                    <Button disabled>added</Button>
                                ) : (
                                    <Button onClick={() => selectPair(pair)}>Add To Vote</Button>
                                )}
                            </TableCell>
                        </TableBodyRow>
                    );
                })}
            </TableBody>
        </TableBlock>
    );
};

export default Table;
