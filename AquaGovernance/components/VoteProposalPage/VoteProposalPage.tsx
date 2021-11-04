import * as React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar/Sidebar';
import ArrowLeft from '../../../common/assets/img/icon-arrow-left.svg';
import CopyButton from '../../../common/basics/CopyButton';
import AccountViewer from './AccountViewer/AccountViewer';
import { flexAllCenter, respondDown } from '../../../common/mixins';
import { Breakpoints, COLORS } from '../../../common/styles';
import { Link, useParams } from 'react-router-dom';
import CurrentResults from './CurrentResults/CurrentResults';
import Votes from './Votes/Votes';
import { useEffect, useState } from 'react';
import { getProposalRequest, UPDATE_INTERVAL } from '../../api/api';
import PageLoader from '../../../common/basics/PageLoader';
import { getDateString } from '../../../common/helpers/helpers';
import { Proposal } from '../../api/types';

const Container = styled.div`
    max-width: 80rem;

    ${respondDown(Breakpoints.lg)`
      max-width: 58.2rem;
    `}
`;

const ProposalQuestion = styled.div`
    width: 100%;
    padding: 10rem 4rem 11.7rem;
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

const ProposalSection = styled(Container)`
    padding: 6rem 0 0 4rem;
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

    const { title, text, proposed_by: proposedBy, start_at: startDate, end_at: endDate } = proposal;

    const startDateView = getDateString(new Date(startDate).getTime(), { withTime: true });
    const endDateView = getDateString(new Date(endDate).getTime(), { withTime: true });

    return (
        <main>
            <Sidebar proposal={proposal} />
            <ProposalQuestion>
                <Container>
                    <BackToProposals>
                        <BackButton to="/">
                            <ArrowLeft />
                        </BackButton>
                        <span>Proposals</span>
                    </BackToProposals>
                    <QuestionText>{title}</QuestionText>
                </Container>
            </ProposalQuestion>
            <ProposalSection>
                <Title>Proposal</Title>
                <DescriptionText>{text}</DescriptionText>
            </ProposalSection>
            <ProposalSection>
                <Title>Details</Title>
                <DataDetails>
                    <Column>
                        <DetailsTitle>Voting start:</DetailsTitle>
                        <DetailsDescription>{startDateView}</DetailsDescription>
                    </Column>
                    <Column>
                        <DetailsTitle>Voting end:</DetailsTitle>
                        <DetailsDescription>{endDateView}</DetailsDescription>
                    </Column>
                    <Column>
                        <DetailsTitle>Proposed by:</DetailsTitle>
                        <DetailsDescription>
                            <CopyButton text={proposedBy}>
                                <AccountViewer pubKey={proposedBy} />
                            </CopyButton>
                        </DetailsDescription>
                    </Column>
                </DataDetails>
            </ProposalSection>
            <ProposalSection>
                <CurrentResults proposal={proposal} />
            </ProposalSection>
            <ProposalSection>
                <Votes />
            </ProposalSection>
        </main>
    );
};

export default VoteProposalPage;
