import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import ErrorHandler from 'helpers/error-handler';
import { createAsset } from 'helpers/token';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { ModalProps } from 'types/modal';
import { ClassicToken } from 'types/token';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Info from 'assets/icon-info.svg';

import Button from 'basics/buttons/Button';
import Market from 'basics/Market';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

const ContentRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 52.8rem;
    margin-top: 3rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
    padding-bottom: 2.6rem;
    border-bottom: 0.1rem dashed ${COLORS.gray100};

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
    color: ${COLORS.textGray};
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
    background-color: ${COLORS.gray50};
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

interface CreatePairModalParams {
    base: ClassicToken;
    counter: ClassicToken;
}

const CreatePairModal = ({ params, close }: ModalProps<CreatePairModalParams>): React.ReactNode => {
    const isMounted = useIsMounted();

    const { account } = useAuthStore();
    const { base, counter } = params;

    const [pending, setPending] = useState(false);

    const baseInstance = createAsset(base.code, base.issuer);
    const isBaseNative = baseInstance.isNative();

    const counterInstance = createAsset(counter.code, counter.issuer);
    const isCounterNative = counterInstance.isNative();

    const pairHasNative = isBaseNative || isCounterNative;
    const createCost = pairHasNative ? PairWithLumenCost : PairWithoutLumenCost;

    const onSubmit = async () => {
        if (account.getAvailableNativeBalance() < createCost) {
            ToastService.showErrorToast("You don't have enough xlm");
            return;
        }
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
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
                'Market has been created! You will be able to see your market in the list within 10 minutes',
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
        <ModalWrapper>
            <ModalTitle>Create pair</ModalTitle>
            <Description>
                To create a pair, you first need to pay for the trustlines for transactions. Once
                it’s done, please allow up to 10 minutes for our systems to correctly add the new
                market and make it available for anyone to vote.
            </Description>
            <div>
                <AssetsInfo>
                    <Market verticalDirections assets={[base, counter]} />
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
                    Create market
                </StyledButton>
            </div>
        </ModalWrapper>
    );
};

export default CreatePairModal;
