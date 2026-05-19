import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getProposalsRequest, PROPOSAL_FILTER } from 'api/governance';

import { AppRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import PageLoader from 'basics/loaders/PageLoader';

import ProposalPreview from '../../governance/components/GovernanceMainPage/ProposalPreview/ProposalPreview';
import AssetRegistryMyVotesProposalPreview from '../../../web/pages/asset-registry/pages/AssetRegistryMainPage/components/AssetRegistryMyVotesProposalPreview/AssetRegistryMyVotesProposalPreview';
import { Container, Header, Title } from '../SdexRewards/SdexRewards';
import { Empty, Section } from '../YourVotes/YourVotes';

const YourGovernanceVotes = () => {
    const [proposals, setProposals] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        getProposalsRequest({
            filter: PROPOSAL_FILTER.MY_VOTES,
            pubkey: account.accountId(),
            page: 1,
            pageSize: 50,
            includeAssetProposals: true,
        }).then(res => {
            setProposals(res.proposals.results);
        });
    }, []);

    return (
        <Container>
            <Header>
                <Title>Governance Votes</Title>
            </Header>

            {!proposals ? (
                <PageLoader />
            ) : proposals.length ? (
                proposals.map(proposal =>
                    proposal.proposal_type === 'ADD_ASSET' ||
                    proposal.proposal_type === 'REMOVE_ASSET' ? (
                        <AssetRegistryMyVotesProposalPreview
                            key={proposal.id}
                            proposal={proposal}
                        />
                    ) : (
                        <ProposalPreview key={proposal.id} proposal={proposal} withMyVotes />
                    ),
                )
            ) : (
                <Section>
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>It looks like you don’t have any active votes.</span>
                        <span>
                            You can vote{' '}
                            <Link to={AppRoutes.section.governance.link.index}>from here.</Link>
                        </span>
                    </Empty>
                </Section>
            )}
        </Container>
    );
};

export default YourGovernanceVotes;
