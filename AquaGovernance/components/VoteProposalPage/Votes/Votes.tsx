import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import ExternalLinkIcon from '../../../../common/assets/img/icon-external-link.svg';
import AccountViewer from '../AccountViewer/AccountViewer';
import Solution from '../Solution/Solution';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import { IconSort } from '../../../../common/basics/Icons';
import { useParams } from 'react-router-dom';
import { Vote } from '../../../api/types';
import { getVotes, getVoteTxHash, UPDATE_INTERVAL, VoteFields } from '../../../api/api';
import Loader from '../../../../common/assets/img/loader.svg';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import Pagination from '../../../../common/basics/Pagination';

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
`;

const CellDate = styled(Cell)`
    flex: 2.2;
`;
const CellAcc = styled(Cell)`
    flex: 4.5;
    min-width: 21.5rem;

    ${respondDown(Breakpoints.md)`
        flex: 3;
        min-width: unset;
    `}
`;
const CellSolution = styled(Cell)`
    flex: 2.2;
`;
const CellAmount = styled(Cell)`
    flex: 4;
    justify-content: flex-end;
    text-align: right;
`;
const VoteRow = styled.div`
    display: flex;
    height: 5rem;
    font-size: 1.6rem;
    line-height: 2.8rem;

    color: ${COLORS.paragraphText};

    ${respondDown(Breakpoints.md)`
        font-size: 1.2rem;
        line-height: 1.4rem;
    `}
`;

const ExternalLink = styled.a`
    display: flex;
    align-items: center;
    margin-left: 0.4rem;
    cursor: pointer;
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

const LoaderContainer = styled.div`
    ${flexAllCenter};
    width: 100%;
    padding: 1rem 0;
`;

const VotesLoader = styled(Loader)`
    height: 3rem;
    width: 3rem;
`;

const onVoteLinkClick = (url: string) => {
    getVoteTxHash(url).then((hash: string) => {
        if (hash) {
            window.open(`https://stellar.expert/explorer/public/tx/${hash}`, '_blank');
        }
    });
};

const PAGE_SIZE = 10;

const Votes = (): JSX.Element => {
    const [updateIndex, setUpdateIndex] = useState(0);
    const [sort, setSort] = useState(VoteFields.date);
    const [isReversedSort, setIsReversedSort] = useState(false);

    const [votes, setVotes] = useState<Vote[] | null>(null);
    const [totalVotes, setTotalVotes] = useState(null);
    const [page, setPage] = useState(1);

    const { id } = useParams<{ id?: string }>();

    useEffect(() => {
        getVotes(id, PAGE_SIZE, page, sort, isReversedSort).then((result) => {
            setTotalVotes(result.data.count);
            setVotes(result.data.results);
        });
    }, [sort, isReversedSort, updateIndex, page]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex((prev) => prev + 1);
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    const changeSort = (newSort) => {
        const isEqualSort = sort === newSort;
        setSort(newSort);
        setPage(1);
        setIsReversedSort(isEqualSort ? !isReversedSort : false);
    };

    if (!votes) {
        return (
            <LoaderContainer>
                <VotesLoader />
            </LoaderContainer>
        );
    }

    if (!votes.length) {
        return null;
    }

    return (
        <VotesBlock>
            <Title>Votes ({totalVotes})</Title>
            <VotesList>
                <HeaderRow>
                    <CellDate>
                        <SortingHeader position="left" onClick={() => changeSort(VoteFields.date)}>
                            Date{' '}
                            <IconSort
                                isEnabled={sort === VoteFields.date}
                                isReversed={isReversedSort}
                            />
                        </SortingHeader>
                    </CellDate>
                    <CellAcc>
                        <SortingHeader
                            position="left"
                            onClick={() => changeSort(VoteFields.account)}
                        >
                            Account{' '}
                            <IconSort
                                isEnabled={sort === VoteFields.account}
                                isReversed={isReversedSort}
                            />
                        </SortingHeader>
                    </CellAcc>
                    <CellSolution>
                        <SortingHeader
                            position="left"
                            onClick={() => changeSort(VoteFields.solution)}
                        >
                            Vote{' '}
                            <IconSort
                                isEnabled={sort === VoteFields.solution}
                                isReversed={isReversedSort}
                            />
                        </SortingHeader>
                    </CellSolution>
                    <CellAmount>
                        <SortingHeader
                            position="right"
                            onClick={() => changeSort(VoteFields.amount)}
                        >
                            AQUA Voted{' '}
                            <IconSort
                                isEnabled={sort === VoteFields.amount}
                                isReversed={isReversedSort}
                            />
                        </SortingHeader>
                    </CellAmount>
                </HeaderRow>
                {votes?.map((vote) => {
                    const {
                        account_issuer: account,
                        vote_choice: voteChoice,
                        amount,
                        transaction_link: txLink,
                        created_at: date,
                    } = vote;
                    return (
                        <VoteRow key={txLink}>
                            <CellDate>
                                {getDateString(new Date(date).getTime(), {
                                    withTime: true,
                                    withoutYear: true,
                                })}
                            </CellDate>
                            <CellAcc>
                                <AccountViewer pubKey={account} narrowForMobile />
                            </CellAcc>
                            <CellSolution>
                                <Solution choice={voteChoice} />
                            </CellSolution>
                            <CellAmount>
                                {formatBalance(Number(amount), true)} AQUA{' '}
                                <ExternalLink onClick={() => onVoteLinkClick(txLink)}>
                                    <ExternalLinkIcon />
                                </ExternalLink>
                            </CellAmount>
                        </VoteRow>
                    );
                })}
                <Pagination
                    pageSize={PAGE_SIZE}
                    currentPage={page}
                    itemName="votes"
                    onPageChange={(res) => {
                        setPage(res);
                    }}
                    totalCount={totalVotes}
                />
            </VotesList>
        </VotesBlock>
    );
};

export default Votes;
