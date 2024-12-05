import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { GovernanceRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import PageLoader from 'basics/loaders/PageLoader';

import { getProposalsRequest, PROPOSAL_FILTER } from '../../governance/api/api';
import ProposalPreview from '../../governance/components/GovernanceMainPage/ProposalPreview/ProposalPreview';
import { Container, Header, Title } from '../AmmRewards/AmmRewards';
import { Empty, Section } from '../YourVotes/YourVotes';

const YourGovernanceVotes = () => {
    const [proposals, setProposals] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        getProposalsRequest(PROPOSAL_FILTER.MY_VOTES, account.accountId()).then(res => {
            setProposals(res.data.results.reverse());
        });
    }, []);

    return (
        <Container>
            <Header>
                <Title>Your governance votes</Title>
            </Header>

            {!proposals ? (
                <PageLoader />
            ) : proposals.length ? (
                proposals.map(proposal => (
                    <ProposalPreview key={proposal.id} proposal={proposal} withMyVotes />
                ))
            ) : (
                <Section>
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>It looks like you don’t have any active votes.</span>
                        <span>
                            You can vote <Link to={GovernanceRoutes.main}>from here.</Link>
                        </span>
                    </Empty>
                </Section>
            )}
        </Container>
    );
};

export default YourGovernanceVotes;
