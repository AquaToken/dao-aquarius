import * as React from 'react';
import { useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import { flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import Button from '../../../../common/basics/Button';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import { StellarService, ToastService } from '../../../../common/services/globalServices';
import {
    BuildSignAndSubmitStatuses,
    openApp,
} from '../../../../common/services/wallet-connect.service';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import { LoginTypes } from '../../../../common/store/authStore/types';
import ErrorHandler from '../../../../common/helpers/error-handler';
import Aqua from '../../../../common/assets/img/aqua-logo-small.svg';
import Ice from '../../../../common/assets/img/ice-logo.svg';
import ArrowDown from '../../../../common/assets/img/icon-arrow-down-purple.svg';

const ModalContainer = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Row = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.6rem;
    line-height: 1.8rem;
    padding-bottom: 3rem;
`;

const Label = styled.span`
    color: ${COLORS.grayText};
`;

const Value = styled.span`
    color: ${COLORS.paragraphText};
    display: flex;
    align-items: center;
`;

const ButtonContainer = styled.div`
    padding-top: 3.2rem;
    border-top: 0.1rem dashed ${COLORS.gray};
    display: flex;
`;

const AquaLogo = styled(Aqua)`
    height: 2.4rem;
    width: 2.4rem;
    margin-right: 0.8rem;
`;

const IceLogo = styled(Ice)`
    height: 2.4rem;
    width: 2.4rem;
    margin-right: 0.8rem;
`;

const AddTrustBlock = styled.div`
    background: ${COLORS.lightGray};
    border-radius: 0.5rem;
    padding: 3.5rem 3.2rem 2.2rem;
    margin-bottom: 4.7rem;
`;

const AddTrustDescription = styled.div`
    display: flex;
    gap: 2.6rem;
    margin-bottom: 1.4rem;
`;

const AddTrustEmoji = styled.span`
    font-size: 1.8rem;
    line-height: 3.2rem;
`;

const AddTrustDescriptionText = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
`;

const ShowMoreBlock = styled.div`
    display: flex;
    gap: 2.3rem;
    align-items: center;
`;

const Divider = styled.div`
    border-bottom: 0.1rem dashed ${COLORS.gray};
    width: 100%;
`;

const ShowMoreButton = styled.div`
    display: flex;
    align-items: center;
    width: min-content;
    white-space: nowrap;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.purple};
    cursor: pointer;
`;

const ShowMoreButtonArrow = styled(ArrowDown)<{ $showMore: boolean }>`
    margin-left: 0.9rem;
    transform: ${({ $showMore }) => ($showMore ? 'rotate(180deg)' : '')};
    transition: transform linear 200ms;
`;

const AssetsBlock = styled.div`
    margin-top: 2.8rem;
`;

const AssetLine = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:not(:last-child) {
        margin-bottom: 2.4rem;
    }
`;

const AssetName = styled.div`
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.grayText};
`;

const Amount = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
`;

const LockAquaModal = ({
    confirm,
    params,
}: ModalProps<{ amount: string; period: number; iceAmount: number }>) => {
    const [showMore, setShowMore] = useState(false);
    const { amount, period, iceAmount } = params;
    const { account } = useAuthStore();
    const [pending, setPending] = useState(false);
    const isMounted = useIsMounted();

    const unlistedIceAssets = account.getUntrustedIceAssets();

    const toggleShowMore = () => {
        setShowMore((prevState) => !prevState);
    };

    const onSubmit = async () => {
        if (account.authType === LoginTypes.walletConnect) {
            openApp();
        }
        try {
            setPending(true);

            const ops = [StellarService.createLockOperation(account.accountId(), amount, period)];

            if (unlistedIceAssets.length) {
                unlistedIceAssets.forEach((asset) => {
                    ops.push(StellarService.createAddTrustOperation(asset));
                });
            }

            const tx = await StellarService.buildTx(account, ops);

            const result = await account.signAndSubmitTx(tx);

            if (isMounted.current) {
                setPending(false);
                confirm({});
            }

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Your lock has been created!');
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPending(false);
            }
        }
    };
    return (
        <ModalContainer>
            <ModalTitle>Lock AQUA</ModalTitle>
            <ModalDescription>Please verify the details of your AQUA tokens lock</ModalDescription>
            <Row>
                <Label>Amount</Label>
                <Value>
                    <AquaLogo />
                    {formatBalance(+amount)} AQUA
                </Value>
            </Row>
            <Row>
                <Label>Unlock date</Label>
                <Value>{getDateString(+period)}</Value>
            </Row>
            <Row>
                <Label>ICE reward amount</Label>
                <Value>
                    <IceLogo />
                    {formatBalance(iceAmount)}
                </Value>
            </Row>
            {Boolean(unlistedIceAssets.length) && (
                <AddTrustBlock>
                    <AddTrustDescription>
                        <AddTrustEmoji>☝️</AddTrustEmoji>
                        <AddTrustDescriptionText>
                            Need to add {unlistedIceAssets.length} new trustlines for the ICE
                            tokens. For each trustline added to your account 0.5 XLM will be blocked
                        </AddTrustDescriptionText>
                    </AddTrustDescription>
                    <ShowMoreBlock>
                        <Divider />

                        <ShowMoreButton onClick={() => toggleShowMore()}>
                            <span>Show {showMore ? 'less' : 'more'}</span>
                            <ShowMoreButtonArrow $showMore={showMore} />
                        </ShowMoreButton>
                        <Divider />
                    </ShowMoreBlock>
                    {showMore && (
                        <AssetsBlock>
                            {unlistedIceAssets.map((asset) => (
                                <AssetLine key={asset.code}>
                                    <AssetName>
                                        <IceLogo />
                                        <span>{asset.code}</span>
                                    </AssetName>
                                    <Amount>0.5 XLM</Amount>
                                </AssetLine>
                            ))}
                            <AssetLine>
                                <AssetName>Total:</AssetName>
                                <Amount>{unlistedIceAssets.length * 0.5} XLM</Amount>
                            </AssetLine>
                        </AssetsBlock>
                    )}
                </AddTrustBlock>
            )}
            <ButtonContainer>
                <Button isBig fullWidth pending={pending} onClick={() => onSubmit()}>
                    Confirm
                </Button>
            </ButtonContainer>
        </ModalContainer>
    );
};

export default LockAquaModal;
