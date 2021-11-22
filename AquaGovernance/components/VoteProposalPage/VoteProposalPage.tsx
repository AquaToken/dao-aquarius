import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProposalRequest, UPDATE_INTERVAL } from '../../api/api';
import PageLoader from '../../../common/basics/PageLoader';
import { Proposal } from '../../api/types';

import ProposalScreen from './Proposal/ProposalScreen';
import NotFoundPage from '../../../common/components/NotFoundPage/NotFoundPage';

export enum SimpleProposalOptions {
    voteFor = 'For',
    voteAgainst = 'Against',
}

export enum SimpleProposalResultsLabels {
    votesFor = 'For',
    votesAgainst = 'Against',
}

const VoteProposalPage = (): JSX.Element => {
    const { id } = useParams<{ id?: string }>();

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

    return (
        <main>
            <ProposalScreen proposal={proposal} />
        </main>
    );
};

export default VoteProposalPage;
