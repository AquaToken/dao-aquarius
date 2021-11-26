import * as React from 'react';
import styled from 'styled-components';
import Sidebar from '../Sidebar/Sidebar';
import ArrowLeft from '../../../../common/assets/img/icon-arrow-left.svg';
import CopyButton from '../../../../common/basics/CopyButton';
import AccountViewer from '../AccountViewer/AccountViewer';
import { commonMaxWidth, flexAllCenter, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { Link } from 'react-router-dom';
import CurrentResults from '../CurrentResults/CurrentResults';
import Votes from '../Votes/Votes';
import { getDateString } from '../../../../common/helpers/helpers';
import { Proposal } from '../../../api/types';
import { statePage } from '../../ProposalCreationPage/ProposalCreationPage';
import ExternalLink from '../../../../common/basics/ExternalLink';
import { useEffect } from 'react';

const ProposalQuestion = styled.div`
    width: 100%;
    padding: 4rem 0 11.7rem;
    background-color: ${COLORS.lightGray};
`;

const BackTo = styled.div`
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
    border: none;
    cursor: pointer;
    transition: all ease 200ms;

    &:hover {
        background-color: ${COLORS.lightGray};
    }

    &:active {
        transform: scale(0.9);
    }
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
    margin-bottom: 1rem;
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

const ProposalScreen = ({
    proposal,
    isTemplate,
    setScreenState,
}: {
    proposal: Proposal;
    isTemplate?: boolean;
    setScreenState?: (state) => void;
}): JSX.Element => {
    const { title, text, proposed_by: proposedBy, start_at: startDate, end_at: endDate } = proposal;

    const startDateView = getDateString(new Date(startDate).getTime(), { withTime: true });
    const endDateView = getDateString(new Date(endDate).getTime(), { withTime: true });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Sidebar isTemplate={isTemplate} proposal={proposal} />
            <ProposalQuestion>
                <ProposalSection>
                    <LeftContent>
                        <BackTo>
                            {isTemplate ? (
                                <>
                                    <BackButton
                                        as="button"
                                        onClick={() => setScreenState(statePage.creation)}
                                    >
                                        <ArrowLeft />
                                    </BackButton>
                                    <span>Back to edit proposal</span>
                                </>
                            ) : (
                                <>
                                    <BackButton to="/">
                                        <ArrowLeft />
                                    </BackButton>
                                    <span>Proposals</span>
                                </>
                            )}
                        </BackTo>
                        <QuestionText>{title}</QuestionText>
                    </LeftContent>
                </ProposalSection>
            </ProposalQuestion>
            <ProposalSection>
                <LeftContent>
                    <Title>Proposal</Title>
                    <DescriptionText dangerouslySetInnerHTML={{ __html: text }} />
                </LeftContent>
            </ProposalSection>
            <ProposalSection>
                <LeftContent>
                    <Title>Discussion</Title>
                    <DetailsDescription>
                        Participate in the discussion of this proposal on Discord
                        (#governance-voting).
                        <ExternalLink href="https://discord.gg/sgzFscHp4C">
                            View discussion
                        </ExternalLink>
                    </DetailsDescription>
                </LeftContent>
            </ProposalSection>
            <ProposalSection>
                <LeftContent>
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
                </LeftContent>
            </ProposalSection>
            <ProposalSection>
                <LeftContent>
                    <CurrentResults proposal={proposal} />
                </LeftContent>
            </ProposalSection>
            {!isTemplate && (
                <ProposalSection>
                    <LeftContent>
                        <Votes />
                    </LeftContent>
                </ProposalSection>
            )}
        </>
    );
};

export default ProposalScreen;
