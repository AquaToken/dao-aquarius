import { forwardRef, RefObject, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import {
    CREATE_DISCUSSION_COST,
    CREATE_PROPOSAL_COST,
    PROPOSAL_STATUS,
    VoteOptions,
} from 'constants/dao';
import { AppRoutes } from 'constants/routes';

import {
    getProposalStatus,
    getQuorumPercentage,
    getVotingTokens,
    isQuorumReached,
} from 'helpers/dao';
import { getDateString } from 'helpers/date';
import { formatBalance, roundToPrecision } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { Proposal } from 'types/governance';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import Button from 'basics/buttons/Button';
import { VoteIcon } from 'basics/icons';
import { ExternalLink } from 'basics/links';

import { cardBoxShadow, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import NotEnoughAquaModal from '../../GovernanceMainPage/NotEnoughAquaModal/NotEnoughAquaModal';
import ProposalStatus from '../../GovernanceMainPage/ProposalStatus/ProposalStatus';
import CreateDiscussionModal from '../../GovernanceProposalCreationPage/CreateDiscussionModal/CreateDiscussionModal';
import PublishProposalModal from '../../GovernanceProposalCreationPage/PublishProposalModal/PublishProposalModal';
import ConfirmVoteModal from '../ConfirmVoteModal/ConfirmVoteModal';

const SidebarBlock = styled.aside`
    top: 2rem;
    right: 10%;
    margin: -46rem 0 0;
    width: 36.6rem;
    background: ${COLORS.white};
    border-radius: 0.5rem;
    position: sticky;
    float: right;
    ${cardBoxShadow};

    ${respondDown(Breakpoints.xl)`
        right: 4rem;
    `};

    ${respondDown(Breakpoints.md)`
        position: relative;
        width: calc(100% - 3.2rem);
        float: unset;
        top: unset;
        right: unset;
        margin: 1.6rem;
    `};
`;

const Container = styled.div`
    padding: 3.2rem 4.8rem 4.8rem;

    a {
        text-decoration: none;
    }
`;

export const SidebarTitle = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    margin-bottom: 3.4rem;
    color: ${COLORS.textPrimary};
`;
const SidebarTemplateTitle = styled(SidebarTitle)`
    margin-bottom: 0;
`;

const SidebarDescription = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
    margin-bottom: 4rem;
    margin-top: 1rem;
`;

const Notice = styled.div`
    margin-bottom: 2rem;
`;

const VotingButton = styled(Button)`
    text-transform: none;
    justify-content: flex-start;

    &:hover {
        opacity: 0.6;
    }

    &:active {
        transform: scale(0.9);
    }

    & > svg {
        margin-right: 1.3rem;
    }

    &:not(:last-child) {
        margin-bottom: 0.8rem;
    }
`;

const ForButton = styled(VotingButton)`
    background: ${COLORS.purple500};

    &:hover {
        background: ${COLORS.purple500};
    }
`;

const BoldText = styled.span`
    font-weight: bold;
    margin-left: 0.8rem;
`;

const AbstainButton = styled(VotingButton)`
    background: ${COLORS.gray100};

    span {
        color: ${COLORS.textGray};
    }

    &:hover {
        background: ${COLORS.gray100};
    }
`;

const AgainstButton = styled(VotingButton)`
    background: ${COLORS.red500};

    &:hover {
        background: ${COLORS.red500};
    }
`;

const Results = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
`;

const Title = styled.span`
    font-size: 1.6rem;
    font-weight: 400;
    color: ${COLORS.textSecondary};
    margin-top: 2.2rem;
`;

const EndDate = styled.span`
    font-size: 2rem;
    font-weight: bold;
    color: ${COLORS.textPrimary};
`;

const FinalResult = styled.span`
    color: ${COLORS.textGray};
    font-size: 1.4rem;
`;

const DiscussionDescription = styled.div`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textDark};
    margin-top: 1.6rem;
    margin-bottom: 2.5rem;
`;

const Sidebar = forwardRef(
    ({ proposal, ...props }: { proposal: Proposal }, ref: RefObject<HTMLDivElement>) => {
        const [selectedOption, setSelectedOption] = useState(null);
        const { isLogged, account } = useAuthStore();
        const { version } = useParams<{ version?: string }>();

        const onVoteClick = option => {
            if (isLogged) {
                ModalService.openModal(ConfirmVoteModal, option);
                return;
            }
            setSelectedOption(option);
            ModalService.openModal(ChooseLoginMethodModal, {
                callback: () => ModalService.openModal(ConfirmVoteModal, option),
            });
        };

        const onContinueClick = () => {
            const aquaBalance = account.getAquaBalance();
            const hasNecessaryBalance = aquaBalance >= CREATE_DISCUSSION_COST;

            if (!hasNecessaryBalance) {
                ModalService.openModal(NotEnoughAquaModal, { cost: CREATE_DISCUSSION_COST });
                return;
            }

            ModalService.openModal(CreateDiscussionModal, proposal);
        };

        const onPublishClick = () => {
            const aquaBalance = account.getAquaBalance();
            const hasNecessaryBalance = aquaBalance >= CREATE_PROPOSAL_COST;

            if (!hasNecessaryBalance) {
                ModalService.openModal(NotEnoughAquaModal, { cost: CREATE_PROPOSAL_COST });
                return;
            }

            ModalService.openModal(PublishProposalModal, { proposal });
        };

        useEffect(() => {
            if (isLogged && selectedOption) {
                ModalService.openModal(ConfirmVoteModal, selectedOption).then(() => {
                    setSelectedOption(null);
                });
            }
        }, [isLogged]);

        const {
            vote_for_issuer: voteForKey,
            vote_against_issuer: voteAgainstKey,
            abstain_issuer: voteAbstainKey,
            vote_for_result: voteForResult,
            vote_against_result: voteAgainstResult,
            start_at: startDate,
            end_at: endDate,
            proposal_status: status,
        } = proposal;

        if (status === 'VOTED') {
            const voteForValue = Number(voteForResult);
            const voteAgainstValue = Number(voteAgainstResult);

            const isVoteForWon = voteForValue > voteAgainstValue;

            const percent = getQuorumPercentage(proposal);

            if (Number.isNaN(percent)) {
                return (
                    <SidebarBlock ref={ref} {...props}>
                        <Container>
                            <Results>
                                <Title>No votes yet</Title>
                            </Results>
                        </Container>
                    </SidebarBlock>
                );
            }

            const roundedPercent = roundToPrecision(percent, 2);

            const isCanceled = !isQuorumReached(proposal);

            return (
                <SidebarBlock ref={ref} {...props}>
                    <Container>
                        <Results>
                            <Title>Result</Title>
                            <ProposalStatus status={getProposalStatus(proposal)} />
                            <EndDate>
                                {isCanceled ? 'Canceled' : 'Ended'} on{' '}
                                {getDateString(new Date(endDate).getTime())}
                            </EndDate>
                            <FinalResult>
                                {isCanceled
                                    ? 'Not enough votes'
                                    : `${roundedPercent}% votes - ${formatBalance(
                                          isVoteForWon ? voteForValue : voteAgainstValue,
                                          true,
                                      )} ${getVotingTokens(proposal)}`}
                            </FinalResult>
                        </Results>
                    </Container>
                </SidebarBlock>
            );
        }

        if (status === 'VOTING') {
            return (
                <SidebarBlock ref={ref} {...props}>
                    <Container>
                        <SidebarTitle>Cast your votes</SidebarTitle>
                        <ForButton
                            fullWidth
                            onClick={() =>
                                onVoteClick({
                                    option: VoteOptions.for,
                                    key: voteForKey,
                                    endDate,
                                    startDate,
                                })
                            }
                        >
                            <VoteIcon option={VoteOptions.for} size="medium" />
                            <BoldText>For</BoldText>
                        </ForButton>
                        <AbstainButton
                            fullWidth
                            onClick={() =>
                                onVoteClick({
                                    option: VoteOptions.abstain,
                                    key: voteAbstainKey,
                                    endDate,
                                    startDate,
                                })
                            }
                        >
                            <VoteIcon option={VoteOptions.abstain} size="medium" />
                            <BoldText>Abstain</BoldText>
                        </AbstainButton>
                        <AgainstButton
                            fullWidth
                            onClick={() =>
                                onVoteClick({
                                    option: VoteOptions.against,
                                    key: voteAgainstKey,
                                    endDate,
                                    startDate,
                                })
                            }
                        >
                            <VoteIcon option={VoteOptions.against} size="medium" />
                            <BoldText>Against</BoldText>
                        </AgainstButton>
                    </Container>
                </SidebarBlock>
            );
        }
        if (status === 'EXPIRED') {
            return (
                <SidebarBlock ref={ref} {...props}>
                    <Container>
                        <ProposalStatus status={PROPOSAL_STATUS.EXPIRED} />
                        <DiscussionDescription>
                            <span>
                                Proposal expired due to no publication within 30 days of creation or
                                last edit
                            </span>
                        </DiscussionDescription>
                    </Container>
                </SidebarBlock>
            );
        }

        if (status === 'DISCUSSION') {
            if (version) {
                const versionDate = proposal.history_proposal.find(
                    history => history.version === Number(version),
                ).created_at;
                return (
                    <SidebarBlock ref={ref} {...props}>
                        <Container>
                            <ProposalStatus status={PROPOSAL_STATUS.DEPRECATED} />
                            <DiscussionDescription>
                                <span>This is a deprecated version of this proposal</span>
                                <br />
                                <b>
                                    v{version}.0 on{' '}
                                    {getDateString(new Date(versionDate).getTime(), {
                                        withTime: true,
                                    })}
                                </b>
                            </DiscussionDescription>
                            <Link
                                to={AppRoutes.section.governance.to.proposal({
                                    id: String(proposal.id),
                                })}
                            >
                                <ExternalLink asDiv>Current version</ExternalLink>
                            </Link>
                        </Container>
                    </SidebarBlock>
                );
            }
            const lastUpdateTimestamp = new Date(proposal.last_updated_at).getTime();
            const day = 24 * 60 * 60 * 1000;
            const daysToDiscussion = 30 * day;
            const daysToExpired = Math.floor(
                (lastUpdateTimestamp + daysToDiscussion - Date.now()) / day,
            );

            const isPublishAvailable = (Date.now() - lastUpdateTimestamp) / day >= 7;

            const publishDate = getDateString(lastUpdateTimestamp + 7 * day, { withTime: true });

            return (
                <SidebarBlock ref={ref} {...props}>
                    <Container>
                        <ProposalStatus status={PROPOSAL_STATUS.DISCUSSION} />
                        {isLogged && account.accountId() === proposal.proposed_by ? (
                            <>
                                <DiscussionDescription>
                                    <span>
                                        This proposal is under discussion. You have{' '}
                                        <b>{daysToExpired} days</b> to make any changes or publish.
                                    </span>
                                    {!isPublishAvailable && (
                                        <span>
                                            <br />
                                            <br />
                                            <i>
                                                You can publish your proposal after{' '}
                                                <b>{publishDate}</b>
                                            </i>
                                        </span>
                                    )}
                                </DiscussionDescription>
                                <Button
                                    isBig
                                    fullWidth
                                    disabled={!isPublishAvailable}
                                    onClick={() => onPublishClick()}
                                >
                                    publish
                                </Button>
                            </>
                        ) : (
                            <>
                                <DiscussionDescription>
                                    <span>
                                        Before the voting starts, there will be <b>7 days</b> for
                                        discussion in the specified discord channel
                                    </span>
                                </DiscussionDescription>
                                <ExternalLink
                                    href={
                                        proposal.discord_channel_url ||
                                        'https://discord.gg/sgzFscHp4C'
                                    }
                                >
                                    Discussion details
                                </ExternalLink>
                            </>
                        )}
                    </Container>
                </SidebarBlock>
            );
        }

        return (
            <SidebarBlock ref={ref} {...props}>
                {status === null && (
                    <Container>
                        <Notice>&#9757;️</Notice>
                        <SidebarTemplateTitle>Check details</SidebarTemplateTitle>
                        <SidebarDescription>
                            Please check all provided details. Any edits needed after opening a
                            discussion will incur a {formatBalance(CREATE_DISCUSSION_COST)} AQUA
                            fee.
                        </SidebarDescription>

                        <ProposalStatus status={PROPOSAL_STATUS.DISCUSSION} />

                        <SidebarDescription>
                            There will be <b>7 days</b> of discussions in the specified discord
                            channel before you can move the proposal to a vote.
                            <br />
                            Discussions can last a maximum of <b>30 days</b> after creation or the
                            last edit.
                        </SidebarDescription>

                        <Button
                            isBig
                            fullWidth
                            onClick={() => {
                                onContinueClick();
                            }}
                        >
                            OPEN DISCUSSION
                        </Button>
                    </Container>
                )}
            </SidebarBlock>
        );
    },
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
