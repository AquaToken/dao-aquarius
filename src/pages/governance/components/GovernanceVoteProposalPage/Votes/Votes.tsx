import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getVotes, getVoteTxHash, VoteFields } from 'api/governance';

import { GD_ICE_CODE } from 'constants/assets';
import { DAO_UPDATE_INTERVAL } from 'constants/dao';

import { getDateString } from 'helpers/date';
import { getIsTestnetEnv } from 'helpers/env';
import { formatBalance } from 'helpers/format-number';

import { Vote } from 'types/governance';

import ExternalLinkIcon from 'assets/icons/nav/icon-external-link-16.svg';
import DIce from 'assets/tokens/dice-logo.svg';
import Ice from 'assets/tokens/ice-logo.svg';

import { IconSort } from 'basics/icons';
import { CircleLoader } from 'basics/loaders';
import Pagination from 'basics/Pagination';

import PublicKeyWithIcon from 'components/PublicKeyWithIcon';

import { flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import Solution from '../Solution/Solution';

const VotesBlock = styled.div`
    width: 100%;
`;

const Title = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
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
    margin-right: 0.3rem;
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

    color: ${COLORS.textTertiary};

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

enum SortingHeaderPosition {
    left = 'left',
    right = 'right',
}

const SortingHeader = styled.button<{ $position: SortingHeaderPosition }>`
    background: none;
    border: none;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: ${({ $position }) => {
        if ($position === SortingHeaderPosition.right) return 'flex-end';
        if ($position === SortingHeaderPosition.left) return 'flex-start';
        return 'center';
    }};

    color: ${COLORS.textGray};
    & > svg {
        margin-left: 0.4rem;
    }
    &:hover {
        color: ${COLORS.purple500};
    }
`;

const LoaderContainer = styled.div`
    ${flexAllCenter};
    width: 100%;
    padding: 1rem 0;
`;

const GdIceLogo = styled(DIce)`
    height: 1.6rem;
    width: 1.6rem;
    margin-left: 0.8rem;
`;

const IceLogo = styled(Ice)`
    height: 1.6rem;
    width: 1.6rem;
    margin-left: 0.8rem;
`;

const onVoteLinkClick = (url: string) => {
    const tab = window.open('', '_blank');
    getVoteTxHash(url).then((hash: string) => {
        if (hash) {
            tab.location.href = `https://stellar.expert/explorer/${
                getIsTestnetEnv() ? 'testnet' : 'public'
            }/tx/${hash}`;
        }
    });
};

const PAGE_SIZE = 10;

const Votes = (): React.ReactNode => {
    const [updateIndex, setUpdateIndex] = useState(0);
    const [sort, setSort] = useState(VoteFields.date);
    const [isReversedSort, setIsReversedSort] = useState(false);

    const [votes, setVotes] = useState<Vote[] | null>(null);
    const [totalVotes, setTotalVotes] = useState(null);
    const [page, setPage] = useState(1);

    const { id } = useParams<{ id?: string }>();

    useEffect(() => {
        getVotes(id, PAGE_SIZE, page, sort, isReversedSort).then(result => {
            setTotalVotes(result.count);
            setVotes(result.results);
        });
    }, [sort, isReversedSort, updateIndex, page]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex(prev => prev + 1);
        }, DAO_UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    const changeSort = (newSort: VoteFields) => {
        const isEqualSort = sort === newSort;
        setSort(newSort);
        setPage(1);
        setIsReversedSort(isEqualSort ? !isReversedSort : false);
    };

    if (!votes) {
        return (
            <LoaderContainer>
                <CircleLoader />
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
                        <SortingHeader
                            $position={SortingHeaderPosition.left}
                            onClick={() => changeSort(VoteFields.date)}
                        >
                            Date{' '}
                            <IconSort
                                isEnabled={sort === VoteFields.date}
                                isReversed={isReversedSort}
                            />
                        </SortingHeader>
                    </CellDate>
                    <CellAcc>
                        <SortingHeader
                            $position={SortingHeaderPosition.left}
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
                            $position={SortingHeaderPosition.left}
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
                            $position={SortingHeaderPosition.right}
                            onClick={() => changeSort(VoteFields.amount)}
                        >
                            Voted{' '}
                            <IconSort
                                isEnabled={sort === VoteFields.amount}
                                isReversed={isReversedSort}
                            />
                        </SortingHeader>
                    </CellAmount>
                </HeaderRow>
                {votes?.map(vote => {
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
                                <PublicKeyWithIcon pubKey={account} narrowForMobile />
                            </CellAcc>
                            <CellSolution>
                                <Solution choice={voteChoice} />
                            </CellSolution>
                            <CellAmount>
                                {formatBalance(Number(amount), true)}
                                {vote.asset_code === GD_ICE_CODE ? <GdIceLogo /> : <IceLogo />}
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
                    onPageChange={res => {
                        setPage(res);
                    }}
                    totalCount={totalVotes}
                />
            </VotesList>
        </VotesBlock>
    );
};

export default Votes;
