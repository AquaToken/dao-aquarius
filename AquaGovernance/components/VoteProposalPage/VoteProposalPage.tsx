import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProposalRequest, UPDATE_INTERVAL } from '../../api/api';
import PageLoader from '../../../common/basics/PageLoader';
import { Proposal } from '../../api/types';
import ProposalScreen from './Proposal/ProposalScreen';

export enum SimpleProposalOptions {
    voteFor = 'Vote For',
    voteAgainst = 'Vote Against',
}

export enum SimpleProposalResultsLabels {
    votesFor = 'Votes For',
    votesAgainst = 'Votes Against',
}

const VoteProposalPage = (): JSX.Element => {
    const { id } = useParams<{ id?: string }>();

    const [proposal, setProposal] = useState<null | Proposal>(null);
    const [updateIndex, setUpdateIndex] = useState(0);

    useEffect(() => {
        getProposalRequest(id).then((response) => {
            setProposal(response.data);
        });
    }, [updateIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex((prev) => prev + 1);
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, []);

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
