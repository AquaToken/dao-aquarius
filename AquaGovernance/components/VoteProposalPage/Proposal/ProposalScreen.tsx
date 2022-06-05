import * as React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Sidebar from '../Sidebar/Sidebar';
import ArrowLeft from '../../../../common/assets/img/icon-arrow-left.svg';
import ArrowDown from '../../../../common/assets/img/icon-arrow-down.svg';
import ExternalIcon from '../../../../common/assets/img/icon-external-link.svg';
import IconEdit from '../../../../common/assets/img/icon-edit.svg';
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
import { useIsOnViewport, useIsOverScrolled } from '../../../../common/hooks/useIsOnViewport';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import { MainRoutes } from '../../../routes';
import Versions from '../Versions/Versions';

const ProposalQuestion = styled.div`
    width: 100%;
    padding: 4rem 0 11.7rem;
    background-color: ${COLORS.lightGray};

    ${respondDown(Breakpoints.md)`
        padding: 1.6rem 0;
    `}
`;

const BackTo = styled.div`
    display: flex;
    column-gap: 1.6rem;
    align-items: center;
`;

export const BackButton = styled(Link)`
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
    z-index: 1;

    &:hover {
        background-color: ${COLORS.lightGray};
    }

    &:active {
        transform: scale(0.9);
    }
`;
const EditButtonLabel = styled.div`
    margin-left: auto;
`;

const QuestionText = styled.h3`
    font-size: 5.6rem;
    line-height: 6.4rem;
    margin-top: 2.3rem;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.md)`
        font-size: 4rem;
        line-height: 4.5rem;
        margin-bottom: 3.2rem;
    `}
`;

const ProposalSection = styled.div`
    padding: 6rem 0 0 4rem;
    width: 100%;
    ${commonMaxWidth};

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem 0;
    `}
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

    ${respondDown(Breakpoints.md)`
        word-break: break-word;
    `}
`;

const DataDetails = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 3.2rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        
        &:not(:last-child) {
            margin-bottom: 0.8rem;
        }
    `}
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

    ${respondDown(Breakpoints.md)`
        margin-top: 0;
    `}
`;

const ExternalButton = styled.div`
    margin-left: 1rem;
    ${flexAllCenter};
    cursor: pointer;
`;

const AccountBlock = styled.div`
    ${flexAllCenter};
`;

const SidebarWeb = styled(Sidebar)`
    z-index: 2;
    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const SidebarMobile = styled(Sidebar)`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: block;
    `}
`;

const viewOnStellarExpert = (account: string) => {
    window.open(`https://stellar.expert/explorer/public/account/${account}`, '_blank');
};

const ScrollToSidebarButton = styled.div`
    display: none;
    position: fixed;
    justify-content: space-between;
    align-items: center;
    bottom: 0;
    left: 0;
    width: 100%;
    background: ${COLORS.white};
    box-shadow: 0 -0.5rem 1rem rgba(0, 6, 54, 0.06);
    border-radius: 1rem 1rem 0 0;
    padding: 2.4rem 1.6rem;
    font-size: 1.6rem;
    line-height: 2.4rem;
    font-weight: bold;
    cursor: pointer;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const TabNav = styled.div`
    background-color: ${COLORS.lightGray};
    position: sticky;
    top: 0;
    z-index: 1;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const TabNavContent = styled.div`
    ${commonMaxWidth};
    padding-left: 4rem;
    display: flex;
`;

const TabNavItem = styled.div<{ active?: boolean }>`
    padding: 1.7rem 0 1.3rem;
    color: ${({ active }) => (active ? COLORS.purple : COLORS.grayText)};
    font-weight: ${({ active }) => (active ? 700 : 400)};
    border-bottom: ${({ active }) => (active ? `0.1rem solid ${COLORS.purple}` : 'none')};
    cursor: pointer;

    &:hover {
        border-bottom: 0.1rem solid ${COLORS.purple};
        color: ${COLORS.purple};
    }

    &:not(:last-child) {
        margin-right: 2.5rem;
    }
`;

const DiscordChannelOwner = styled.div`
    margin-top: 2.1rem;
    margin-bottom: 1.6rem;

    div:first-child {
        font-weight: 400;
        font-size: 1.4rem;
        line-height: 1.6rem;
        color: ${COLORS.grayText};
    }

    div:last-child {
        font-weight: 400;
        font-size: 1.6rem;
        line-height: 2.4rem;
        color: ${COLORS.paragraphText};
    }
`;

const scrollToRef = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const ProposalScreen = ({
    proposal,
    setScreenState,
    version,
}: {
    proposal: Proposal;
    version?: string;
    setScreenState?: (state) => void;
}): JSX.Element => {
    const {
        title,
        text,
        proposed_by: proposedBy,
        start_at: startDate,
        end_at: endDate,
        discord_channel_name: discordChannelName,
        discord_channel_url: discordChannelUrl,
        discord_username: discordUsername,
        proposal_status: status,
    } = proposal;

    const currentVersionProposal = version
        ? proposal.history_proposal.find((history) => history.version === Number(version))
        : null;

    const startDateView = getDateString(new Date(startDate).getTime(), { withTime: true });
    const endDateView = getDateString(new Date(endDate).getTime(), { withTime: true });

    useEffect(() => {
        document.body.scrollTo(0, 0);
    }, [version]);

    const mobileSidebarRef = useRef(null);

    const hideBottomBlock = useIsOnViewport(mobileSidebarRef);

    const proposalRef = useRef(null);
    const discussionRef = useRef(null);
    const detailsRef = useRef(null);
    const resultsRef = useRef(null);

    const isProposalOverScrolled = useIsOverScrolled(proposalRef, 50);
    const isDiscussionOverScrolled = useIsOverScrolled(discussionRef, 50);
    const isDetailsOverScrolled = useIsOverScrolled(detailsRef, 50);

    const { isLogged, account } = useAuthStore();

    return (
        <>
            <SidebarWeb proposal={proposal} />
            <ProposalQuestion>
                <ProposalSection>
                    <LeftContent>
                        <BackTo>
                            {status === null ? (
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

                            {isLogged &&
                                account.id === proposal.proposed_by &&
                                status === 'DISCUSSION' &&
                                !version && (
                                    <>
                                        <EditButtonLabel>Edit proposal</EditButtonLabel>
                                        <BackButton to={`${MainRoutes.edit}/${proposal.id}`}>
                                            <IconEdit />
                                        </BackButton>
                                    </>
                                )}
                        </BackTo>
                        <QuestionText>
                            {currentVersionProposal ? currentVersionProposal.title : title}
                        </QuestionText>
                    </LeftContent>
                </ProposalSection>
            </ProposalQuestion>
            {Boolean(status) && (
                <TabNav>
                    <TabNavContent>
                        <TabNavItem
                            active={!isProposalOverScrolled}
                            onClick={() => scrollToRef(proposalRef)}
                        >
                            Proposal
                        </TabNavItem>
                        <TabNavItem
                            active={isProposalOverScrolled && !isDiscussionOverScrolled}
                            onClick={() => scrollToRef(discussionRef)}
                        >
                            Discussion
                        </TabNavItem>
                        <TabNavItem
                            active={isDiscussionOverScrolled && !isDetailsOverScrolled}
                            onClick={() => scrollToRef(detailsRef)}
                        >
                            Details
                        </TabNavItem>
                        {(status === 'VOTING' || status === 'VOTED') && (
                            <TabNavItem
                                active={isDetailsOverScrolled}
                                onClick={() => scrollToRef(resultsRef)}
                            >
                                Results
                            </TabNavItem>
                        )}
                        {status === 'DISCUSSION' && Boolean(proposal.history_proposal.length) && (
                            <TabNavItem
                                active={isDetailsOverScrolled}
                                onClick={() => scrollToRef(resultsRef)}
                            >
                                Versions
                            </TabNavItem>
                        )}
                    </TabNavContent>
                </TabNav>
            )}
            <ProposalSection ref={proposalRef}>
                <LeftContent>
                    <Title>Proposal</Title>
                    <DescriptionText
                        dangerouslySetInnerHTML={{
                            __html: currentVersionProposal ? currentVersionProposal.text : text,
                        }}
                    />
                </LeftContent>
            </ProposalSection>
            <ProposalSection ref={discussionRef}>
                <LeftContent>
                    <Title>Discussion</Title>
                    <DetailsDescription>
                        Participate in the discussion of this proposal on Discord (
                        {discordChannelName || '#governance-voting'}).
                        {Boolean(discordUsername) && (
                            <DiscordChannelOwner>
                                <div>Discussion owner:</div>
                                <div>{discordUsername}</div>
                            </DiscordChannelOwner>
                        )}
                        {Boolean(discordChannelName) && (
                            <DiscordChannelOwner>
                                <div>Discussion channel:</div>
                                <div>{discordChannelName}</div>
                            </DiscordChannelOwner>
                        )}
                        <ExternalLink href={discordChannelUrl || 'https://discord.gg/sgzFscHp4C'}>
                            View discussion
                        </ExternalLink>
                    </DetailsDescription>
                </LeftContent>
            </ProposalSection>
            {Boolean(status) && (
                <ProposalSection ref={detailsRef}>
                    {(status === 'VOTING' || status === 'VOTED') && (
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
                                        <AccountBlock>
                                            <AccountViewer pubKey={proposedBy} />
                                            <ExternalButton
                                                onClick={() => viewOnStellarExpert(proposedBy)}
                                            >
                                                <ExternalIcon />
                                            </ExternalButton>
                                        </AccountBlock>
                                    </DetailsDescription>
                                </Column>
                            </DataDetails>
                        </LeftContent>
                    )}
                    {status === 'DISCUSSION' && (
                        <LeftContent>
                            <Title>Details</Title>
                            <DataDetails>
                                <Column>
                                    <DetailsTitle>Discussion created:</DetailsTitle>
                                    <DetailsDescription>
                                        {getDateString(new Date(proposal.created_at).getTime(), {
                                            withTime: true,
                                        })}
                                    </DetailsDescription>
                                </Column>
                                <Column>
                                    <DetailsTitle>
                                        {Boolean(version) ? 'Deprecated version:' : 'Latest edit:'}
                                    </DetailsTitle>
                                    <DetailsDescription>
                                        {Boolean(version)
                                            ? `v${
                                                  currentVersionProposal.version
                                              }.0 on ${getDateString(
                                                  new Date(
                                                      currentVersionProposal.created_at,
                                                  ).getTime(),
                                                  {
                                                      withTime: true,
                                                  },
                                              )}`
                                            : getDateString(
                                                  new Date(proposal.last_updated_at).getTime(),
                                                  {
                                                      withTime: true,
                                                  },
                                              )}
                                    </DetailsDescription>
                                </Column>
                                <Column>
                                    <DetailsTitle>
                                        {Boolean(version)
                                            ? 'Latest version:'
                                            : 'Discussion lifetime:'}
                                    </DetailsTitle>
                                    <DetailsDescription>
                                        {Boolean(version)
                                            ? `v${proposal.version}.0 on ${getDateString(
                                                  new Date(proposal.last_updated_at).getTime(),
                                                  {
                                                      withTime: true,
                                                  },
                                              )}`
                                            : getDateString(
                                                  new Date(proposal.last_updated_at).getTime() +
                                                      30 * 24 * 60 * 60 * 1000,
                                                  {
                                                      withTime: true,
                                                  },
                                              )}
                                    </DetailsDescription>
                                </Column>
                            </DataDetails>
                        </LeftContent>
                    )}
                </ProposalSection>
            )}
            {(status === 'VOTING' || status === 'VOTED') && (
                <ProposalSection ref={resultsRef}>
                    <LeftContent>
                        <CurrentResults proposal={proposal} />
                    </LeftContent>
                </ProposalSection>
            )}
            {(status === 'VOTING' || status === 'VOTED') && (
                <ProposalSection>
                    <LeftContent>
                        <Votes />
                    </LeftContent>
                </ProposalSection>
            )}
            {status === 'DISCUSSION' && Boolean(proposal.history_proposal.length) && (
                <ProposalSection ref={resultsRef}>
                    <LeftContent>
                        <Title>Versions ({proposal.history_proposal.length + 1})</Title>
                        <Versions proposal={proposal} />
                    </LeftContent>
                </ProposalSection>
            )}
            <SidebarMobile proposal={proposal} ref={mobileSidebarRef} />
            {!hideBottomBlock && (status === 'VOTED' || status === 'VOTING') && (
                <ScrollToSidebarButton onClick={() => scrollToRef(mobileSidebarRef)}>
                    <span>{status === 'VOTED' ? 'Go to the result' : 'Go to voting'}</span>
                    <ArrowDown />
                </ScrollToSidebarButton>
            )}
        </>
    );
};

export default ProposalScreen;
