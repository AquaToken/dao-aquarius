import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getVotes, getVoteTxHash, VoteFields } from 'api/governance';

import { GD_ICE_CODE } from 'constants/assets-env';
import { DAO_UPDATE_INTERVAL } from 'constants/dao';

import { getDateString } from 'helpers/date';
import { getIsTestnetEnv } from 'helpers/env';
import { formatBalance, roundToPrecision } from 'helpers/format-number';

import { Proposal, Vote } from 'types/governance';

import ExternalLinkIcon from 'assets/icons/nav/icon-external-link-16.svg';
import DIce from 'assets/tokens/dice-logo.svg';
import Ice from 'assets/tokens/ice-logo.svg';

import { CircleLoader } from 'basics/loaders';
import Pagination from 'basics/Pagination';
import Table, { CellAlign } from 'basics/Table';

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
    margin-bottom: 1.6rem;
`;
const VotesList = styled.div`
    display: flex;
    flex-direction: column;
`;

const ExternalLink = styled.a`
    display: flex;
    align-items: center;
    margin-left: 0.4rem;
    cursor: pointer;
`;

const Account = styled.div`
    display: flex;
    align-items: center;
    min-width: 21.5rem;

    ${respondDown(Breakpoints.md)`
        min-width: unset;
    `}
`;

const Amount = styled.div`
    display: flex;
    align-items: center;
    text-align: right;
`;

const TotalShare = styled.div`
    display: flex;
    align-items: center;
    font-weight: 700;
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
const SHARE_SORT = 'share';

type VoteSortColumn = VoteFields | typeof SHARE_SORT;

const getVoteShare = (amount: string, totalVotingPower: number) => {
    const share = (Number(amount) / totalVotingPower) * 100;

    if (!Number.isFinite(share)) {
        return '—';
    }

    const roundedShare = roundToPrecision(share, 2);

    if (share > 0 && Number(roundedShare) === 0) {
        return '<0.01%';
    }

    return `${roundedShare}%`;
};

const Votes = ({ proposal }: { proposal: Proposal }): React.ReactNode => {
    const [updateIndex, setUpdateIndex] = useState(0);
    const [sort, setSort] = useState(VoteFields.date);
    const [activeSortColumn, setActiveSortColumn] = useState<VoteSortColumn>(VoteFields.date);
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

    const changeSort = (newSort: VoteFields, sortColumn: VoteSortColumn = newSort) => {
        const isEqualSort = activeSortColumn === sortColumn;
        setSort(newSort);
        setActiveSortColumn(sortColumn);
        setPage(1);
        setIsReversedSort(isEqualSort ? !isReversedSort : false);
    };

    const totalVotingPower =
        Number(proposal.vote_for_result) +
        Number(proposal.vote_against_result) +
        Number(proposal.vote_abstain_result ?? 0);

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
                <Table
                    head={[
                        {
                            children: 'Date',
                            flexSize: 2.2,
                            sort: {
                                onClick: () => changeSort(VoteFields.date),
                                isEnabled: activeSortColumn === VoteFields.date,
                                isReversed: isReversedSort,
                            },
                        },
                        {
                            children: 'Account',
                            flexSize: 4.5,
                            sort: {
                                onClick: () => changeSort(VoteFields.account),
                                isEnabled: activeSortColumn === VoteFields.account,
                                isReversed: isReversedSort,
                            },
                        },
                        {
                            children: 'Vote',
                            flexSize: 2.2,
                            sort: {
                                onClick: () => changeSort(VoteFields.solution),
                                isEnabled: activeSortColumn === VoteFields.solution,
                                isReversed: isReversedSort,
                            },
                        },
                        {
                            children: 'Voted',
                            flexSize: 3,
                            align: CellAlign.Right,
                            sort: {
                                onClick: () => changeSort(VoteFields.amount),
                                isEnabled: activeSortColumn === VoteFields.amount,
                                isReversed: isReversedSort,
                            },
                        },
                        {
                            children: '% of Total',
                            flexSize: 2,
                            align: CellAlign.Right,
                            sort: {
                                onClick: () => changeSort(VoteFields.amount, SHARE_SORT),
                                isEnabled: activeSortColumn === SHARE_SORT,
                                isReversed: isReversedSort,
                            },
                        },
                    ]}
                    body={votes.map(vote => {
                        const {
                            account_issuer: account,
                            vote_choice: voteChoice,
                            amount,
                            transaction_link: txLink,
                            created_at: date,
                        } = vote;

                        return {
                            key: txLink,
                            isNarrow: true,
                            mobileBackground: COLORS.gray50,
                            rowItems: [
                                {
                                    children: getDateString(new Date(date).getTime(), {
                                        withTime: true,
                                        withoutYear: true,
                                    }),
                                    flexSize: 2.2,
                                    label: 'Date:',
                                },
                                {
                                    children: (
                                        <Account>
                                            <PublicKeyWithIcon pubKey={account} narrowForMobile />
                                        </Account>
                                    ),
                                    flexSize: 4.5,
                                    label: 'Account:',
                                },
                                {
                                    children: <Solution choice={voteChoice} />,
                                    flexSize: 2.2,
                                    label: 'Vote:',
                                },
                                {
                                    children: (
                                        <Amount>
                                            {formatBalance(amount, true)}
                                            {vote.asset_code === GD_ICE_CODE ? (
                                                <GdIceLogo />
                                            ) : (
                                                <IceLogo />
                                            )}
                                        </Amount>
                                    ),
                                    flexSize: 3,
                                    align: CellAlign.Right,
                                    label: 'Voted:',
                                },
                                {
                                    children: (
                                        <TotalShare>
                                            {getVoteShare(amount, totalVotingPower)}
                                            <ExternalLink onClick={() => onVoteLinkClick(txLink)}>
                                                <ExternalLinkIcon />
                                            </ExternalLink>
                                        </TotalShare>
                                    ),
                                    flexSize: 2,
                                    align: CellAlign.Right,
                                    label: '% of Total:',
                                },
                            ],
                        };
                    })}
                />
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
