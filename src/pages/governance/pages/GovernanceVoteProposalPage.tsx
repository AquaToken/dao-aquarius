import * as React from 'react';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { AppRoutes } from 'constants/routes';

import PageLoader from 'basics/loaders/PageLoader';

import NotFoundPage from 'components/NotFoundPage';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import { getProposalRequest, UPDATE_INTERVAL } from '../api/api';
import { Proposal } from '../api/types';
import ProposalScreen from '../components/GovernanceVoteProposalPage/Proposal/ProposalScreen';

const Main = styled.main`
    ${respondDown(Breakpoints.md)`
         background: ${COLORS.gray50};
    `}
`;

export enum SimpleProposalOptions {
    voteFor = 'For',
    voteAgainst = 'Against',
}

export enum SimpleProposalResultsLabels {
    votesFor = 'For',
    votesAgainst = 'Against',
}

const GovernanceVoteProposalPage = (): JSX.Element => {
    const { id, version } = useParams<{ id?: string; version?: string }>();

    const [proposal, setProposal] = useState<null | Proposal>(null);
    const [updateIndex, setUpdateIndex] = useState(0);
    const [error, setError] = useState(false);

    useEffect(() => {
        getProposalRequest(id)
            .then(response => {
                setProposal(response.data);
            })
            .catch(() => {
                setError(true);
            });
    }, [updateIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex(prev => prev + 1);
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    if (error) {
        return <NotFoundPage />;
    }

    if (!proposal) {
        return <PageLoader />;
    }

    if (
        Number(version) === proposal.version ||
        (Boolean(version) &&
            !proposal.history_proposal.find(history => history.version === Number(version)))
    ) {
        return (
            <Navigate
                to={AppRoutes.section.governance.to.proposal({ id: String(proposal.id) })}
                replace
            />
        );
    }

    return (
        <Main>
            <ProposalScreen proposal={proposal} version={version} />
        </Main>
    );
};

export default GovernanceVoteProposalPage;
