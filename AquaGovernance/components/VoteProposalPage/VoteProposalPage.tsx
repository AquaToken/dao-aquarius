import * as React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar/Sidebar';
import ArrowLeft from '../../../common/assets/img/icon-arrow-left.svg';
import CopyButton from '../../../common/basics/CopyButton';
import AccountViewer from './AccountViewer/AccountViewer';
import { commonMaxWidth, flexAllCenter, respondDown } from '../../../common/mixins';
import { Breakpoints, COLORS } from '../../../common/styles';
import { Link, useParams } from 'react-router-dom';
import CurrentResults from './CurrentResults/CurrentResults';
import Votes from './Votes/Votes';
import { useEffect, useState } from 'react';
import { getProposalRequest, UPDATE_INTERVAL } from '../../api/api';
import PageLoader from '../../../common/basics/PageLoader';
import { getDateString } from '../../../common/helpers/helpers';
import { Proposal } from '../../api/types';

import ProposalScreen from './Proposal/ProposalScreen';

const ProposalQuestion = styled.div`
    width: 100%;
    padding: 4rem 0 11.7rem;
    background-color: ${COLORS.lightGray};
`;

const BackToProposals = styled.div`
    display: flex;
    column-gap: 1.6rem;
    align-items: center;
`;

const BackButton = styled(Link)`
    ${flexAllCenter};
    width: 4.8rem;
    height: 4.8rem;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 50%;
    text-decoration: none;
    cursor: pointer;
`;

const QuestionText = styled.h3`
    font-size: 5.6rem;
    line-height: 6.4rem;
    margin-top: 2.3rem;
    color: ${COLORS.titleText};
`;

const ProposalSection = styled.div`
    padding: 6rem 0 0 4rem;
    width: 100%;
    ${commonMaxWidth};
`;

const LeftContent = styled.div`
    max-width: 78rem;

    ${respondDown(Breakpoints.lg)`
        max-width: 58.2rem;
      `}
`;

const Title = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;

const DescriptionText = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    white-space: pre-wrap;
`;

const DataDetails = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 3.2rem;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
`;

const DetailsTitle = styled.div`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};
`;

const DetailsDescription = styled.div`
    margin-top: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.paragraphText};
`;

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
            {/*<Sidebar proposal={proposal} />*/}
            {/*<ProposalQuestion>*/}
            {/*    <ProposalSection>*/}
            {/*        <LeftContent>*/}
            {/*            <BackToProposals>*/}
            {/*                <BackButton to="/">*/}
            {/*                    <ArrowLeft />*/}
            {/*                </BackButton>*/}
            {/*                <span>Proposals</span>*/}
            {/*            </BackToProposals>*/}
            {/*            <QuestionText>{title}</QuestionText>*/}
            {/*        </LeftContent>*/}
            {/*    </ProposalSection>*/}
            {/*</ProposalQuestion>*/}
            {/*<ProposalSection>*/}
            {/*    <LeftContent>*/}
            {/*        <Title>Proposal</Title>*/}
            {/*        <DescriptionText>{text}</DescriptionText>*/}
            {/*    </LeftContent>*/}
            {/*</ProposalSection>*/}
            {/*<ProposalSection>*/}
            {/*    <LeftContent>*/}
            {/*        <Title>Details</Title>*/}
            {/*        <DataDetails>*/}
            {/*            <Column>*/}
            {/*                <DetailsTitle>Voting start:</DetailsTitle>*/}
            {/*                <DetailsDescription>{startDateView}</DetailsDescription>*/}
            {/*            </Column>*/}
            {/*            <Column>*/}
            {/*                <DetailsTitle>Voting end:</DetailsTitle>*/}
            {/*                <DetailsDescription>{endDateView}</DetailsDescription>*/}
            {/*            </Column>*/}
            {/*            <Column>*/}
            {/*                <DetailsTitle>Proposed by:</DetailsTitle>*/}
            {/*                <DetailsDescription>*/}
            {/*                    <CopyButton text={proposedBy}>*/}
            {/*                        <AccountViewer pubKey={proposedBy} />*/}
            {/*                    </CopyButton>*/}
            {/*                </DetailsDescription>*/}
            {/*            </Column>*/}
            {/*        </DataDetails>*/}
            {/*    </LeftContent>*/}
            {/*</ProposalSection>*/}
            {/*<ProposalSection>*/}
            {/*    <LeftContent>*/}
            {/*        <CurrentResults proposal={proposal} />*/}
            {/*    </LeftContent>*/}
            {/*</ProposalSection>*/}
            {/*<ProposalSection>*/}
            {/*    <LeftContent>*/}
            {/*        <Votes />*/}
            {/*    </LeftContent>*/}
            {/*</ProposalSection>*/}

            <ProposalScreen proposal={proposal} />
        </main>
    );
};

export default VoteProposalPage;
