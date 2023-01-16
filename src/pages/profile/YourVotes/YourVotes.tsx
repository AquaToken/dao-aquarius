import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../common/styles';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { ModalService, StellarService } from '../../../common/services/globalServices';
import { StellarEvents } from '../../../common/services/stellar.service';
import { getTotalVotingStats, getUserPairsList } from '../../vote/api/api';
import { PairStats } from '../../vote/api/types';
import Table from '../../vote/components/MainPage/Table/Table';
import PageLoader from '../../../common/basics/PageLoader';
import { formatBalance } from '../../../common/helpers/helpers';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../common/mixins';
import Button from '../../../common/basics/Button';
import VotesAmountModal from '../../vote/components/MainPage/VoteModals/VotesAmountModal';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import ManageUnlockedVotes from '../../vote/components/MainPage/ManageUnlockedVotes/ManageUnlockedVotes';
import useAssetsStore from '../../../store/assetsStore/useAssetsStore';
import { getAssetsFromPairs } from '../../vote/components/MainPage/MainPage';
import { Link } from 'react-router-dom';
import { VoteRoutes } from '../../../routes';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const Title = styled.h2`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    font-weight: 400;
    margin-bottom: 4.8rem;
`;

export const Section = styled.section`
    background: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 4rem 4.8rem;

    ${respondDown(Breakpoints.md)`
        padding: 2rem 1.6rem;
    `}
`;

const TableSection = styled(Section)`
    margin-top: 3.2rem;

    ${respondDown(Breakpoints.md)`
       background: ${COLORS.lightGray};
       padding: 0;
       overflow: hidden;
    `}
`;

export const Empty = styled.div`
    ${flexAllCenter};
    flex-direction: column;

    h3 {
        font-size: 2rem;
        line-height: 2.8rem;
        color: ${COLORS.titleText};
        margin-bottom: 0.9rem;
    }

    span {
        line-height: 180%;
        color: ${COLORS.grayText};
    }

    a {
        color: ${COLORS.purple};
    }
`;

const UnlockedVotes = styled.div`
    ${flexRowSpaceBetween};

    ${respondDown(Breakpoints.md)`
       flex-direction: column;
    `}
`;

const UnlockedVotesData = styled.div`
    display: flex;
    flex-direction: column;
`;

const UnlockedVotesTitle = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
`;

const UnlockedVotesStats = styled.span`
    color: ${COLORS.grayText};
`;

const ManageButton = styled(Button)`
    ${respondDown(Breakpoints.md)`
        width: 100%;
        margin-top: 3rem;
    `}
`;

const YourVotes = () => {
    const [updateId, setUpdateId] = useState(1);
    const [unclaimedVotesInfo, setUnclaimedVotesInfo] = useState(null);
    const [votes, setVotes] = useState(null);

    const [totalStats, setTotalStats] = useState(null);

    const { account, isLogged } = useAuthStore();

    const { processNewAssets } = useAssetsStore();

    const processAssetsFromPairs = (pairs) => {
        const assets = getAssetsFromPairs(pairs);

        processNewAssets(assets);
    };

    useEffect(() => {
        if (!isLogged) {
            return;
        }
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setUpdateId((prevState) => prevState + 1);
            }
        });

        return () => unsub();
    }, [isLogged]);

    useEffect(() => {
        if (!isLogged) {
            setUnclaimedVotesInfo(null);
            return;
        }
        const keys = StellarService.getKeysSimilarToMarketKeys(account.accountId());

        getUserPairsList(keys).then((res) => {
            setVotes(res);
            processAssetsFromPairs(res);
            const processedClaims = res.reduce(
                (acc, pair) => {
                    const pairUnclaimedVotes = StellarService.getPairVotes(
                        pair as PairStats,
                        account.accountId(),
                    ).filter((claim) => new Date(claim.claimBackDate) < new Date());

                    const sum = pairUnclaimedVotes.reduce((votesSum, claim) => {
                        votesSum += Number(claim.amount);
                        return votesSum;
                    }, 0);

                    acc.sum = acc.sum + sum;
                    acc.count = acc.count + pairUnclaimedVotes.length;

                    return acc;
                },
                { count: 0, sum: 0 },
            );
            setUnclaimedVotesInfo(processedClaims);
        });
    }, [updateId, isLogged]);

    useEffect(() => {
        getTotalVotingStats().then((res) => {
            setTotalStats(res);
        });
    }, []);

    const startVote = (pair) => {
        if (isLogged) {
            ModalService.openModal(VotesAmountModal, {
                pairs: [pair],
                isSingleVoteForModal: true,
                updatePairs: () => {},
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    return (
        <Container>
            <Title>Your liquidity votes</Title>

            {!totalStats || !votes || !unclaimedVotesInfo ? (
                <PageLoader />
            ) : (
                <>
                    {Boolean(unclaimedVotesInfo.count) && (
                        <Section>
                            <UnlockedVotes>
                                <UnlockedVotesData>
                                    <UnlockedVotesTitle>You have unlocked votes</UnlockedVotesTitle>
                                    <UnlockedVotesStats>
                                        {unclaimedVotesInfo.count} votes for{' '}
                                        {formatBalance(unclaimedVotesInfo.sum)} AQUA + ICE
                                    </UnlockedVotesStats>
                                </UnlockedVotesData>

                                <ManageButton
                                    onClick={() =>
                                        ModalService.openModal(ManageUnlockedVotes, {
                                            pairs: votes,
                                        })
                                    }
                                >
                                    Manage unlocked votes
                                </ManageButton>
                            </UnlockedVotes>
                        </Section>
                    )}

                    {votes.length ? (
                        <TableSection>
                            <Table
                                pairs={votes}
                                selectedPairs={[]}
                                selectPair={startVote}
                                loading={!totalStats || !votes}
                                totalStats={totalStats}
                                isYourVotes={true}
                            />
                        </TableSection>
                    ) : (
                        <Section>
                            <Empty>
                                <h3>There's nothing here.</h3>
                                <span>It looks like there are don't have an active votes.</span>
                                <span>
                                    You can <Link to={VoteRoutes.main}>vote right now.</Link>
                                </span>
                            </Empty>
                        </Section>
                    )}
                </>
            )}
        </Container>
    );
};

export default YourVotes;
