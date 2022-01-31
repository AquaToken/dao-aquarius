import * as React from 'react';
import { useState } from 'react';
import {
    ModalService,
    StellarService,
    ToastService,
} from '../../../../common/services/globalServices';
import { SELECTED_PAIRS_ALIAS } from '../MainPage';
import { BuildSignAndSubmitStatuses } from '../../../../common/services/wallet-connect.service';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import Select, { Option } from '../../../../common/basics/Select';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import { ModalDescription, ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import { getDateString } from '../../../../common/helpers/helpers';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import VotesAmountModal, { ContentRow, Label } from './VotesAmountModal';
import Button from '../../../../common/basics/Button';
import { respondDown } from '../../../../common/mixins';

const ClaimBack = styled.div`
    margin: 2rem 0 3.2rem;
    color: ${COLORS.grayText};
`;

const VotePeriodSelect = styled(Select)`
    margin-top: 1.2rem;
`;

const ClaimBackDate = styled.span`
    color: ${COLORS.paragraphText};
`;

const ButtonContainer = styled.div`
    display: flex;
    padding-top: 3.2rem;
    border-top: 0.1rem dashed ${COLORS.gray};

    Button:first-child {
        margin-right: 1.6rem;
    }

    ${respondDown(Breakpoints.md)`
         flex-direction: column;
         
         Button:first-child {
             margin-bottom: 1.6rem;
         }
    `}
`;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

const PeriodOptions: Option<number>[] = [
    { label: '5 minutes', value: 5 * MINUTE },
    { label: '1 Week', value: 7 * DAY },
    { label: '2 Weeks', value: 14 * DAY },
    { label: '3 Weeks', value: 21 * DAY },
    { label: '1 Month', value: MONTH },
    { label: '2 Month', value: 2 * MONTH },
    { label: '3 Month', value: 3 * MONTH },
    { label: '4 Month', value: 4 * MONTH },
    { label: '5 Month', value: 5 * MONTH },
    { label: '6 Month', value: 6 * MONTH },
];

const VotesDurationModal = ({ params, close }) => {
    const [votePeriod, setVotePeriod] = useState(MONTH);
    const [pending, setPending] = useState(false);
    const { pairsAmounts, updatePairs, isDownVoteModal, pairs } = params;

    const isMounted = useIsMounted();

    const { account } = useAuthStore();

    const back = () => {
        close();
        ModalService.openModal(VotesAmountModal, {
            pairs,
            updatePairs,
            pairsAmounts,
            isDownVoteModal,
        });
    };

    const onSubmit = async () => {
        try {
            setPending(true);

            const voteOps = Object.entries(pairsAmounts).map(([marketKey, voteAmount]) =>
                StellarService.createVoteOperation(
                    account.accountId(),
                    marketKey,
                    voteAmount,
                    new Date(Date.now() + votePeriod).getTime(),
                ),
            );

            const tx = await StellarService.buildTx(account, voteOps);

            const result = await account.signAndSubmitTx(tx);
            if (isMounted.current) {
                setPending(false);
                close();
            }

            localStorage.setItem(SELECTED_PAIRS_ALIAS, JSON.stringify([]));
            updatePairs();

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast(
                'Your vote has been cast! You will be able to see your vote in the list within 10 minutes',
            );
            StellarService.getClaimableBalances(account.accountId());
        } catch (e) {
            console.log(e);
            ToastService.showErrorToast('Oops. Something went wrong.');
            if (isMounted.current) {
                setPending(false);
            }
        }
    };

    return (
        <>
            <ModalTitle>{isDownVoteModal ? 'Select Downvote Period' : 'Selected Pairs'}</ModalTitle>
            <ModalDescription>
                {isDownVoteModal
                    ? 'Enter the period for which your AQUA will be locked to voting'
                    : 'Lock your AQUA in the network to complete your vote'}
            </ModalDescription>

            <ContentRow>
                <Label>Vote Period</Label>
            </ContentRow>

            <VotePeriodSelect options={PeriodOptions} value={votePeriod} onChange={setVotePeriod} />
            <ClaimBack>
                You can retrieve your AQUA on{' '}
                <ClaimBackDate>
                    {getDateString(Date.now() + votePeriod, { withTime: true })}
                </ClaimBackDate>
            </ClaimBack>

            <ButtonContainer>
                <Button fullWidth likeDisabled onClick={() => back()}>
                    Back
                </Button>
                <Button fullWidth onClick={() => onSubmit()} pending={pending}>
                    confirm
                </Button>
            </ButtonContainer>
        </>
    );
};

export default VotesDurationModal;
