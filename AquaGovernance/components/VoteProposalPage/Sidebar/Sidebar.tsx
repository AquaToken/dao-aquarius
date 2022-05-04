import * as React from 'react';
import { forwardRef, RefObject, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import NativeVotingButton from './VotingButton/VotingButton';
import Success from '../../../../common/assets/img/icon-success.svg';
import Fail from '../../../../common/assets/img/icon-fail.svg';
import { ModalService } from '../../../../common/services/globalServices';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import ChooseLoginMethodModal from '../../../../common/modals/ChooseLoginMethodModal';
import ConfirmVoteModal from '../ConfirmVoteModal/ConfirmVoteModal';
// import CheckedIcon from '../../../../common/assets/img/icon-checked.svg';
import { SimpleProposalOptions } from '../VoteProposalPage';
import { Proposal } from '../../../api/types';
import Button from '../../../../common/basics/Button';
import CreateDiscussionModal from '../../ProposalCreationPage/CreateDiscussionModal/CreateDiscussionModal';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import { formatBalance, getDateString, roundToPrecision } from '../../../../common/helpers/helpers';
import NotEnoughAquaModal from '../../MainPage/NotEnoughAquaModal/NotEnoughAquaModal';
import {
    CREATE_DISCUSSION_COST,
    CREATE_PROPOSAL_COST,
    MINIMUM_APPROVAL_PERCENT,
} from '../../MainPage/MainPage';
import ProposalStatus, { PROPOSAL_STATUS } from '../../MainPage/ProposalStatus/ProposalStatus';
import ExternalLink from '../../../../common/basics/ExternalLink';
import { Link, useParams } from 'react-router-dom';
import { MainRoutes } from '../../../routes';
import PublishProposalModal from '../../ProposalCreationPage/PublishProposalModal/PublishProposalModal';

const SidebarBlock = styled.aside`
    top: 2rem;
    right: 10%;
    margin: 10rem 0 0;
    width: 36.4rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    position: sticky;
    float: right;

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
    color: ${COLORS.titleText};
`;
const SidebarTemplateTitle = styled(SidebarTitle)`
    margin-bottom: 0;
`;

const SidebarDescription = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: #000427;
    opacity: 0.7;
    margin-bottom: 4rem;
    margin-top: 1rem;
`;

const Notice = styled.div`
    margin-bottom: 2rem;
`;

const VotingButton = styled(NativeVotingButton)`
    & > svg {
        margin-right: 1.3rem;
    }

    &:not(:last-child) {
        margin-bottom: 0.8rem;
    }
`;

const BoldText = styled.span`
    font-weight: bold;
    margin-left: 0.8rem;
`;

const iconStyles = css`
    height: 2.4rem;
    width: 2.4rem;
`;

const FailIcon = styled(Fail)`
    ${iconStyles}
`;
const SuccessIcon = styled(Success)`
    ${iconStyles}
`;

// const VoteOption = styled.label`
//     display: flex;
//     align-items: center;
//     position: relative;
//     padding: 2.2rem;
//     width: 100%;
//     margin-bottom: 1.2rem;
//     background: ${COLORS.lightGray};
//     border-radius: 0.5rem;
//
//     font-size: 1.6rem;
//     line-height: 1.8rem;
//
//     transition: all ease 200ms;
//
//     ${({ isChecked }: { isChecked: boolean }) =>
//         isChecked
//             ? `color: ${COLORS.white};
//                background: ${COLORS.purple};
//             `
//             : `color: ${COLORS.paragraphText};
//                background: ${COLORS.lightGray};
//             `};
//     &:hover {
//         ${({ isChecked }: { isChecked: boolean }) =>
//             !isChecked &&
//             `cursor: pointer;
//              background: ${COLORS.white};
//              box-shadow: 0px 20px 30px rgba(0, 6, 54, 0.06);
//              & > span {
//                 border-color: ${COLORS.purple};
//              }
//              `};
//     }
// `;
//
// const Divider = styled.div`
//     height: 0;
//     width: 100%;
//     border-bottom: 0.1rem dashed #e8e8ed; ;
// `;
//
// const InputItem = styled.input`
//     position: absolute;
//     top: 0;
//     left: 0;
//     opacity: 0;
// `;
//
// const NonSelectedIcon = styled.span`
//     width: 2.2rem;
//     height: 2.2rem;
//     margin-right: 1.4rem;
//
//     background: ${COLORS.white};
//     border: 0.1rem solid ${COLORS.gray};
//     border-radius: 50%;
//     transition: all ease 200ms;
// `;
//
// const Checked = styled(CheckedIcon)`
//     margin-right: 1.4rem;
// `;

const Results = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Title = styled.span`
    font-size: 1.6rem;
    font-weight: 400;
    color: ${COLORS.descriptionText};
    margin-top: 2.2rem;
`;

const Winner = styled.div<{ isVoteFor?: boolean }>`
    height: 3.5rem;
    padding: 0 1.5rem;
    ${flexAllCenter};
    width: min-content;
    white-space: nowrap;
    border-radius: 1.75rem;
    background-color: ${({ isVoteFor }) => (isVoteFor ? COLORS.purple : COLORS.pinkRed)};
    color: ${COLORS.white};
    font-weight: 400;
    margin-top: 1rem;
    margin-bottom: 6rem;
`;

const Canceled = styled(Winner)`
    background-color: ${COLORS.gray};
    color: ${COLORS.darkGrayText};
`;

const FailIconGray = styled(Fail)`
    height: 1.4rem;
    width: 1.4rem;
    margin-right: 0.6rem;

    rect {
        fill: ${COLORS.white};
    }
    path {
        stroke: ${COLORS.grayText};
    }
`;

const EndDate = styled.span`
    font-size: 2rem;
    font-weight: bold;
    color: ${COLORS.titleText};
`;

const FinalResult = styled.span`
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    margin-top: 1rem;
`;

const DiscussionDescription = styled.div`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.darkGrayText};
    margin-top: 1.6rem;
    margin-bottom: 2.5rem;
`;

// const voteOptionsMockData = {
//     isForAgainst: false,
//     options: [
//         { name: 'No', account: 'GASDASDASD' },
//         { name: '100% per transaction', account: 'GASDASDASD' },
//         { name: '50% per transaction', account: 'GKJLLKNJLKJ' },
//         { name: '25% per transaction', account: 'GJLKJBKJNKJNN' },
//     ],
// };

const Sidebar = forwardRef(
    ({ proposal, ...props }: { proposal: Proposal }, ref: RefObject<HTMLDivElement>) => {
        const [selectedOption, setSelectedOption] = useState(null);
        const { isLogged, account } = useAuthStore();
        const { version } = useParams<{ version?: string }>();

        const onVoteClick = (option) => {
            if (isLogged) {
                ModalService.openModal(ConfirmVoteModal, option);
                return;
            }
            setSelectedOption(option);
            ModalService.openModal(ChooseLoginMethodModal, {});
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
            vote_for_result: voteForResult,
            vote_against_result: voteAgainstResult,
            end_at: endDate,
            aqua_circulating_supply: aquaCirculatingSupply,
            proposal_status: status,
        } = proposal;

        if (status === 'VOTED') {
            const voteForValue = Number(voteForResult);
            const voteAgainstValue = Number(voteAgainstResult);
            const isVoteForWon = voteForValue > voteAgainstValue;

            const percent =
                ((isVoteForWon ? voteForValue : voteAgainstValue) /
                    (voteForValue + voteAgainstValue)) *
                100;

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

            const isCanceled =
                ((voteForValue + voteAgainstValue) / Number(aquaCirculatingSupply)) * 100 <
                MINIMUM_APPROVAL_PERCENT;

            return (
                <SidebarBlock ref={ref} {...props}>
                    <Container>
                        <Results>
                            <Title>Result</Title>
                            {isCanceled ? (
                                <Canceled>
                                    <FailIconGray />
                                    Canceled
                                </Canceled>
                            ) : (
                                <Winner isVoteFor={isVoteForWon}>
                                    {isVoteForWon ? <SuccessIcon /> : <FailIcon />}
                                    <BoldText>{isVoteForWon ? 'For' : 'Against'}</BoldText>
                                </Winner>
                            )}
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
                                      )} AQUA`}
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
                        <VotingButton
                            onClick={() =>
                                onVoteClick({
                                    option: SimpleProposalOptions.voteFor,
                                    key: voteForKey,
                                    endDate,
                                })
                            }
                        >
                            <SuccessIcon />
                            <BoldText>For</BoldText>
                        </VotingButton>
                        <VotingButton
                            isVoteFor
                            onClick={() =>
                                onVoteClick({
                                    option: SimpleProposalOptions.voteAgainst,
                                    key: voteAgainstKey,
                                    endDate,
                                })
                            }
                        >
                            <FailIcon />
                            <BoldText>Against</BoldText>
                        </VotingButton>
                    </Container>
                </SidebarBlock>
            );
        }

        if (status === 'DISCUSSION') {
            if (version) {
                const versionDate = proposal.history_proposal.find(
                    (history) => history.version === Number(version),
                ).created_at;
                return (
                    <SidebarBlock ref={ref} {...props}>
                        <Container>
                            <ProposalStatus status={PROPOSAL_STATUS.DEPRECATED} />
                            <DiscussionDescription>
                                <span>This is depricated version of proposal</span>
                                <br />
                                <b>
                                    v{version}.0 on{' '}
                                    {getDateString(new Date(versionDate).getTime(), {
                                        withTime: true,
                                    })}
                                </b>
                            </DiscussionDescription>
                            <Link to={`${MainRoutes.proposal}/${proposal.id}/`}>
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

            const isPublishAvailable = (lastUpdateTimestamp - Date.now()) / day >= 7;

            const publishDate = getDateString(lastUpdateTimestamp + 7 * day, { withTime: true });

            return (
                <SidebarBlock ref={ref} {...props}>
                    <Container>
                        <ProposalStatus status={PROPOSAL_STATUS.DISCUSSION} />
                        {isLogged && account.accountId() === proposal.proposed_by ? (
                            <>
                                <DiscussionDescription>
                                    <span>
                                        Proposal is under discussion, you have{' '}
                                        <b>{daysToExpired} days</b> to make changes and publish
                                    </span>
                                    {!isPublishAvailable && (
                                        <span>
                                            <br />
                                            <br />
                                            <i>
                                                You can submit your offer only after{' '}
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
                            Please check all the details, Editing will be <b>paid separately</b> and
                            will be <b>available only during the discussion</b> period
                        </SidebarDescription>

                        <ProposalStatus status={PROPOSAL_STATUS.DISCUSSION} />

                        <SidebarDescription>
                            Before the voting starts, there will be <b>7 days</b> for discussion in
                            the specified discord channel
                            <br />
                            The discussion can take a maximum of <b>30 days</b> after the last
                            creation or editing
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
                {/*(*/}
                {/*    <>*/}
                {/*        <Container>*/}
                {/*            <SidebarTitle>Cast your votes</SidebarTitle>*/}
                {/*            {voteOptionsMockData?.options.map((item) => {*/}
                {/*                const { name } = item;*/}
                {/*                const isSelected = selectedOption?.name === name;*/}
                {/*                return (*/}
                {/*                    <VoteOption key={name} isChecked={isSelected}>*/}
                {/*                        <InputItem*/}
                {/*                            type="checkbox"*/}
                {/*                            checked={isSelected}*/}
                {/*                            onChange={() => {*/}
                {/*                                setSelectedOption({ ...item });*/}
                {/*                            }}*/}
                {/*                        />*/}
                {/*                        {isSelected ? <Checked /> : <NonSelectedIcon />}*/}
                {/*                        {name}*/}
                {/*                    </VoteOption>*/}
                {/*                );*/}
                {/*            })}*/}
                {/*        </Container>*/}
                {/*        <Divider />*/}
                {/*        <Container>*/}
                {/*            <Button fullWidth isBig onClick={() => onVoteClick(selectedOption)}>*/}
                {/*                Cast vote*/}
                {/*            </Button>*/}
                {/*        </Container>*/}
                {/*    </>*/}
                {/*)}*/}
            </SidebarBlock>
        );
    },
);

export default Sidebar;
