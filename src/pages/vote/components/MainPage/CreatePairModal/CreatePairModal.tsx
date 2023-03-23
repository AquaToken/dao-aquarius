import * as React from 'react';
import { useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import useAuthStore from '../../../../../store/authStore/useAuthStore';
import Button from '../../../../../common/basics/Button';
import Pair from '../../common/Pair';
import * as StellarSdk from 'stellar-sdk';
import { StellarService, ToastService } from '../../../../../common/services/globalServices';
import { useIsMounted } from '../../../../../common/hooks/useIsMounted';
import {
    BuildSignAndSubmitStatuses,
    openApp,
} from '../../../../../common/services/wallet-connect.service';
import Info from '../../../../../common/assets/img/icon-info.svg';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../common/basics/Tooltip';
import ErrorHandler from '../../../../../common/helpers/error-handler';
import { LoginTypes } from '../../../../../store/authStore/types';

const ContentRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 52.8rem;
    margin-top: 3rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    padding-bottom: 2.6rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};

    ${respondDown(Breakpoints.md)`
         width: 100%;
    `}
`;

const Description = styled(ModalDescription)`
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
           width: 100%;
      `}
`;

const Cost = styled.div`
    margin-left: auto;
    line-height: 1.8rem;
    font-size: 1.6rem;
    margin-right: 1.2rem;
    color: ${COLORS.grayText};
`;

const InfoIconWrap = styled.div`
    margin-left: auto;
    height: 1.8rem;
    width: 1.6rem;
    cursor: help;
    ${flexAllCenter};
`;

const AssetsInfo = styled.div`
    ${flexAllCenter};
    padding: 3.5rem 0;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
`;

const Label = styled.span`
    ${flexAllCenter};
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 1.4rem;
    padding: 0.5rem;
`;

const TooltipRow = styled.div`
    ${flexRowSpaceBetween};

    &:not(:last-child) {
        margin-bottom: 1rem;
    }
`;

const TooltipLabel = styled.div`
    margin-right: 5rem;
    color: ${COLORS.white};
    opacity: 0.5;
`;

const PairWithLumenCost = 4;
const PairWithoutLumenCost = 5;

const StyledButton = styled(Button)`
    margin-top: 3.2rem;
`;

const CreatePairModal = ({
    params,
    close,
}: ModalProps<{ base: any; counter: any }>): JSX.Element => {
    const isMounted = useIsMounted();

    const { account } = useAuthStore();
    const { base, counter } = params;

    const [pending, setPending] = useState(false);

    const baseInstance = new StellarSdk.Asset(base.code, base.issuer);
    const isBaseNative = baseInstance.isNative();

    const counterInstance = new StellarSdk.Asset(counter.code, counter.issuer);
    const isCounterNative = counterInstance.isNative();

    const pairHasNative = isBaseNative || isCounterNative;
    const createCost = pairHasNative ? PairWithLumenCost : PairWithoutLumenCost;

    const onSubmit = async () => {
        if (account.getAvailableNativeBalance() < createCost) {
            ToastService.showErrorToast("You don't have enough xlm");
            return;
        }
        if (account.authType === LoginTypes.walletConnect) {
            openApp();
        }
        setPending(true);

        try {
            const tx = await StellarService.createMarketKeyTx(
                account.accountId(),
                baseInstance,
                counterInstance,
                createCost,
            );
            const result = await account.signAndSubmitTx(tx);

            if (isMounted.current) {
                setPending(false);
                close();
            }

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast(
                'Pair has been created! You will be able to see your pair in the list within 10 minutes',
                20000,
            );
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPending(false);
            }
        }
    };

    return (
        <>
            <ModalTitle>Create pair</ModalTitle>
            <Description>
                To create a pair, you first need to pay for the trustlines for transactions. Once
                it’s done, please allow up to 10 minutes for our systems to correctly add the new
                market pair and make it available for anyone to vote.
            </Description>
            <div>
                <AssetsInfo>
                    <Pair
                        verticalDirections
                        base={{
                            code: base.code,
                            issuer: base.issuer,
                        }}
                        counter={{
                            code: counter.code,
                            issuer: counter.issuer,
                        }}
                    />
                </AssetsInfo>
                <ContentRow>
                    <Label>Pair creating:</Label>
                    <Cost>{createCost} XLM</Cost>
                    <Tooltip
                        content={
                            <TooltipInner>
                                <TooltipRow>
                                    <TooltipLabel>Base account reserve (x2)</TooltipLabel>
                                    <span>2 XLM</span>
                                </TooltipRow>
                                {!isBaseNative && (
                                    <TooltipRow>
                                        <TooltipLabel>{base.code} trustline (x2)</TooltipLabel>
                                        <span>1 XLM</span>
                                    </TooltipRow>
                                )}
                                {!isCounterNative && (
                                    <TooltipRow>
                                        <TooltipLabel>{counter.code} trustline (x2)</TooltipLabel>
                                        <span>1 XLM</span>
                                    </TooltipRow>
                                )}
                                <TooltipRow>
                                    <TooltipLabel>Marker Key signer (x2)</TooltipLabel>
                                    <span>1 XLM</span>
                                </TooltipRow>
                                <TooltipRow>
                                    <div>Total</div>
                                    <span>{createCost} XLM</span>
                                </TooltipRow>
                            </TooltipInner>
                        }
                        position={TOOLTIP_POSITION.left}
                        showOnHover
                    >
                        <InfoIconWrap>
                            <Info />
                        </InfoIconWrap>
                    </Tooltip>
                </ContentRow>
                <StyledButton fullWidth onClick={() => onSubmit()} pending={pending}>
                    Create pair
                </StyledButton>
            </div>
        </>
    );
};

export default CreatePairModal;
