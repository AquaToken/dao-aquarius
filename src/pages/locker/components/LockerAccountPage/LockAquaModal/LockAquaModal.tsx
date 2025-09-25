import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { ModalProps } from 'types/modal';

import { flexRowSpaceBetween } from 'web/mixins';
import { COLORS } from 'web/styles';

import Aqua from 'assets/aqua-logo-small.svg';
import Ice from 'assets/ice-logo.svg';
import ArrowDown from 'assets/icon-arrow-down-purple.svg';

import Button from 'basics/buttons/Button';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const Row = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.6rem;
    line-height: 1.8rem;
    padding-bottom: 3rem;
`;

const Label = styled.span`
    color: ${COLORS.textGray};
`;

const Value = styled.span`
    color: ${COLORS.textTertiary};
    display: flex;
    align-items: center;
`;

const ButtonContainer = styled.div`
    padding-top: 3.2rem;
    border-top: 0.1rem dashed ${COLORS.gray100};
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
    background: ${COLORS.gray50};
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

const AddTrustTextDescription = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
`;

const ShowMoreBlock = styled.div`
    display: flex;
    gap: 2.3rem;
    align-items: center;
`;

const Divider = styled.div`
    border-bottom: 0.1rem dashed ${COLORS.gray100};
    width: 100%;
`;

const ShowMoreButton = styled.div`
    display: flex;
    align-items: center;
    width: min-content;
    white-space: nowrap;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.purple500};
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
    color: ${COLORS.textGray};
`;

const Amount = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textTertiary};
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
        setShowMore(prevState => !prevState);
    };

    const onSubmit = async () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        try {
            setPending(true);

            const ops = [StellarService.createLockOperation(account.accountId(), amount, period)];

            if (unlistedIceAssets.length) {
                unlistedIceAssets.forEach(asset => {
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
        <ModalWrapper>
            <ModalTitle>Lock AQUA</ModalTitle>
            <ModalDescription>Please verify the details below before confirming</ModalDescription>
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
                    {formatBalance(iceAmount)} ICE
                </Value>
            </Row>
            {Boolean(unlistedIceAssets.length) && (
                <AddTrustBlock>
                    <AddTrustDescription>
                        <AddTrustEmoji>☝️</AddTrustEmoji>
                        <AddTrustTextDescription>
                            Freezing AQUA requires you to add the {unlistedIceAssets.length} ICE
                            trustlines. Each trustline will reserve 0.5 XLM of your wallet balance.
                        </AddTrustTextDescription>
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
                            {unlistedIceAssets.map(asset => (
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
        </ModalWrapper>
    );
};

export default LockAquaModal;
