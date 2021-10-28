import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import SortIcon from '../../../../common/assets/img/icon-sort.svg';
import ExternalLinkIcon from '../../../../common/assets/img/icon-external-link.svg';
import AccountViewer from '../AccountViewer/AccountViewer';
import Solution from '../Solution/Solution';
import { useMemo, useState } from 'react';
import { makeComparator } from '../../../../common/helpers/helpers';

const VotesBlock = styled.div`
    width: 100%;
`;

const Title = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;
const VotesList = styled.div`
    display: flex;
    flex-direction: column;
`;

const HeaderRow = styled.div`
    display: flex;
    height: 5.2rem;
`;

const Cell = styled.div`
    display: flex;
    flex: 1;
    align-items: center;
    padding: 0 0.4rem;
`;

const CellAcc = styled(Cell)`
    flex: 3;
    min-width: 21.5rem;
`;
const CellSolution = styled(Cell)`
    flex: 3;
`;
const CellAmount = styled(Cell)`
    flex: 2;
    justify-content: flex-end;
`;
const VoteRow = styled.div`
    display: flex;
    height: 5rem;
    font-size: 1.6rem;
    line-height: 2.8rem;

    color: ${COLORS.paragraphText};
`;

const ExternalLink = styled.a`
    display: flex;
    align-items: center;
    margin-left: 0.4rem;
`;

const SortingHeader = styled.button`
    background: none;
    border: none;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: ${({ position }: { position?: string }) => {
        if (position === 'right') return 'flex-end';
        if (position === 'left') return 'flex-start';
        return 'center';
    }};

    color: ${COLORS.grayText};
    & > svg {
        margin-left: 0.4rem;
    }
    &:hover {
        color: ${COLORS.purple};
    }
`;

const votesMockData = [
    {
        account: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
        solution: 'Vote For',
        amount: 1039389,
    },
    {
        account: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
        solution: 'Vote Against',
        amount: 241213,
    },
    {
        account: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
        solution: 'Vote For',
        amount: 1344213,
    },
];

const IS_KEY_NUMBER = {
    account: false,
    solution: false,
    amount: true,
};

const Votes = (): JSX.Element => {
    const [sort, setSort] = useState('account');
    const [isReversedSort, setIsReversedSort] = useState(false);

    const changeSort = (newSort) => {
        const isEqualSort = sort === newSort;
        setSort(newSort);
        setIsReversedSort(isEqualSort ? !isReversedSort : false);
    };

    const sortedVotes = useMemo(() => {
        return votesMockData.sort(
            makeComparator({
                key: sort,
                isReversedSort,
                isNum: IS_KEY_NUMBER[sort],
            }),
        );
    }, [votesMockData, sort, isReversedSort]);

    return (
        <VotesBlock>
            <Title>Votes ({sortedVotes.length})</Title>
            <VotesList>
                <HeaderRow>
                    <CellAcc>
                        <SortingHeader position="left" onClick={() => changeSort('account')}>
                            Account <SortIcon />
                        </SortingHeader>
                    </CellAcc>
                    <CellSolution>
                        <SortingHeader position="left" onClick={() => changeSort('solution')}>
                            Solution <SortIcon />
                        </SortingHeader>
                    </CellSolution>
                    <CellAmount>
                        <SortingHeader position="right" onClick={() => changeSort('amount')}>
                            AQUA Voted <SortIcon />
                        </SortingHeader>
                    </CellAmount>
                </HeaderRow>
                {sortedVotes.map((vote) => {
                    const { account, solution, amount } = vote;
                    return (
                        <VoteRow key={account}>
                            <CellAcc>
                                <AccountViewer pubKey={account} />
                            </CellAcc>
                            <CellSolution>
                                <Solution label={solution} />
                            </CellSolution>
                            <CellAmount>
                                {amount.toLocaleString('en-US')} AQUA{' '}
                                <ExternalLink href="">
                                    <ExternalLinkIcon />
                                </ExternalLink>
                            </CellAmount>
                        </VoteRow>
                    );
                })}
            </VotesList>
        </VotesBlock>
    );
};

export default Votes;
