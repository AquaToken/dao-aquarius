import * as React from 'react';
import { useEffect, useState } from 'react';
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
import ConfirmCreateProposalModal from '../../ProposalCreationPage/ConfirmCreateProposalModal/ConfirmCreateProposalModal';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import { formatBalance, getDateString, roundToPrecision } from '../../../../common/helpers/helpers';

const SidebarBlock = styled.aside`
    position: sticky;
    top: 4rem;
    margin: 10rem 10% 0 0;
    float: right;
    width: 36.4rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;

    ${respondDown(Breakpoints.xl)`
        margin-right: 4rem;
    `};
`;

const Container = styled.div`
    padding: 3.2rem 4.8rem 4.8rem;
`;

export const SidebarTitle = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    margin-bottom: 3.4rem;
    color: ${COLORS.titleText};
`;
const SidebarTemplateTitle = styled(SidebarTitle)`
    margin-bottom: 0.8rem;
`;

const SidebarDescription = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: #000427;
    opacity: 0.7;
    margin-bottom: 4.2rem;
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

const Winner = styled.div<{ isVoteFor: boolean }>`
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

// const voteOptionsMockData = {
//     isForAgainst: false,
//     options: [
//         { name: 'No', account: 'GASDASDASD' },
//         { name: '100% per transaction', account: 'GASDASDASD' },
//         { name: '50% per transaction', account: 'GKJLLKNJLKJ' },
//         { name: '25% per transaction', account: 'GJLKJBKJNKJNN' },
//     ],
// };

const Sidebar = ({
    proposal,
    isTemplate,
}: {
    proposal: Proposal;
    isTemplate: boolean;
}): JSX.Element => {
    const [selectedOption, setSelectedOption] = useState(null);
    const { isLogged } = useAuthStore();

    const onVoteClick = (option) => {
        if (isLogged) {
            ModalService.openModal(ConfirmVoteModal, option);
            return;
        }
        setSelectedOption(option);
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    useEffect(() => {
        if (isLogged && selectedOption) {
            ModalService.openModal(ConfirmVoteModal, selectedOption).then(() => {
                setSelectedOption(null);
            });
        }
    }, [isLogged]);

    const {
        is_simple_proposal: isSimple,
        vote_for_issuer: voteForKey,
        vote_against_issuer: voteAgainstKey,
        vote_for_result: voteForResult,
        vote_against_result: voteAgainstResult,
        end_at: endDate,
    } = proposal;

    const isEnd = new Date() >= new Date(endDate);

    if (isEnd && isSimple && !isTemplate) {
        const voteForValue = Number(voteForResult);
        const voteAgainstValue = Number(voteAgainstResult);
        const isVoteForWon = voteForValue > voteAgainstValue;

        const percent =
            ((isVoteForWon ? voteForValue : voteAgainstValue) / (voteForValue + voteAgainstValue)) *
            100;
        const roundedPercent = roundToPrecision(percent, 2);

        return (
            <SidebarBlock>
                <Container>
                    <Results>
                        <Title>Winner:</Title>
                        <Winner isVoteFor={isVoteForWon}>
                            {isVoteForWon ? <SuccessIcon /> : <FailIcon />}
                            Vote <BoldText>{isVoteForWon ? 'For' : 'Against'}</BoldText>
                        </Winner>
                        <EndDate>Ended in {getDateString(new Date(endDate).getTime())}</EndDate>
                        <FinalResult>
                            {roundedPercent}% votes -{' '}
                            {formatBalance(isVoteForWon ? voteForValue : voteAgainstValue, true)}{' '}
                            AQUA
                        </FinalResult>
                    </Results>
                </Container>
            </SidebarBlock>
        );
    }

    return (
        <SidebarBlock>
            {isSimple && !isTemplate && (
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
                        <SuccessIcon /> Vote <BoldText>For</BoldText>
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
                        Vote <BoldText>Against</BoldText>
                    </VotingButton>
                </Container>
            )}
            {isTemplate && (
                <Container>
                    <Notice>&#9757;️</Notice>
                    <SidebarTemplateTitle>Check details</SidebarTemplateTitle>
                    <SidebarDescription>
                        Please check all details, after publish you will not be able to delete or
                        change your proposal!
                    </SidebarDescription>
                    <Button
                        isBig
                        fullWidth
                        onClick={() => {
                            ModalService.openModal(ConfirmCreateProposalModal, proposal);
                        }}
                    >
                        Continue
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
};

export default Sidebar;
