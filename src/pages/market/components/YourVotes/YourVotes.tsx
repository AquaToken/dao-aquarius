import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar/events/events';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import PageLoader from 'basics/loaders/PageLoader';

import { PairStats } from 'pages/vote/api/types';

import VotesList from '../../../vote/components/MainPage/ManageVotesModal/VotesList/VotesList';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    padding: 4.2rem 3.2rem 2rem;
    border-radius: 0.5rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `}
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    margin-bottom: 1.6rem;
    color: ${COLORS.textPrimary};
`;

const Loader = styled.div`
    display: flex;
    padding: 5rem 0;
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
    margin-bottom: 3.2rem;
`;

interface YourVotes {
    votesData: PairStats;
}

const YourVotes = ({ votesData }: YourVotes): React.ReactNode => {
    const { account, isLogged } = useAuthStore();

    const [claims, setClaims] = useState(
        isLogged ? StellarService.cb.getPairVotes(votesData, account.accountId())?.reverse() : null,
    );

    useEffect(() => {
        if (!account) {
            setClaims(null);
            return;
        }
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setClaims(
                    StellarService.cb.getPairVotes(votesData, account.accountId())?.reverse(),
                );
            }
        });

        return () => unsub();
    }, [account]);

    if (!claims) {
        return (
            <Container>
                <Title>Your votes</Title>
                <Loader>
                    <PageLoader />
                </Loader>
            </Container>
        );
    }

    return (
        <Container>
            <Title>Your votes</Title>
            {claims.length ? (
                <>
                    <Description>
                        View your votes for a market and claim unlocked votes back
                    </Description>

                    <VotesList votes={claims} pair={votesData} />
                </>
            ) : (
                <Description>You didn't vote for this market</Description>
            )}
        </Container>
    );
};

export default YourVotes;
