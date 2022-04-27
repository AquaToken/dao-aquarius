import * as React from 'react';
import { useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { getProposalRequest, UPDATE_INTERVAL } from '../../api/api';
import PageLoader from '../../../common/basics/PageLoader';
import { Proposal } from '../../api/types';

import ProposalScreen from './Proposal/ProposalScreen';
import NotFoundPage from '../../../common/components/NotFoundPage/NotFoundPage';
import styled from 'styled-components';
import { respondDown } from '../../../common/mixins';
import { Breakpoints, COLORS } from '../../../common/styles';
import { MainRoutes } from '../../routes';

const Main = styled.main`
    ${respondDown(Breakpoints.md)`
         background: ${COLORS.lightGray};
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

const VoteProposalPage = (): JSX.Element => {
    const { id, version } = useParams<{ id?: string; version?: string }>();

    const [proposal, setProposal] = useState<null | Proposal>(null);
    const [updateIndex, setUpdateIndex] = useState(0);
    const [error, setError] = useState(false);

    useEffect(() => {
        getProposalRequest(id)
            .then((response) => {
                setProposal(response.data);
            })
            .catch(() => {
                setError(true);
            });
    }, [updateIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex((prev) => prev + 1);
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
            !proposal.history_proposal.find((history) => history.version === Number(version)))
    ) {
        return <Redirect to={`${MainRoutes.proposal}/${proposal.id}`} />;
    }

    return (
        <Main>
            <ProposalScreen proposal={proposal} version={version} />
        </Main>
    );
};

export default VoteProposalPage;
