import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import ErrorHandler from 'helpers/error-handler';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { StellarService, ToastService } from 'services/globalServices';

import { ModalProps } from 'types/modal';

import Ice from 'assets/tokens/ice-logo.svg';

import Button from 'basics/buttons/Button';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { COLORS } from '../../../../web/styles';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const IceLogo = styled(Ice)`
    height: 2.4rem;
    width: 2.4rem;
    margin-right: 0.8rem;
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

const AssetsBlock = styled.div`
    padding-bottom: 4rem;
    margin-bottom: 3.1rem;
    border-bottom: 0.1rem dashed ${COLORS.gray100};
`;

const AddIceTrustlinesModal = ({ confirm }: ModalProps<never>) => {
    const [pending, setPending] = useState(false);
    const { account } = useAuthStore();
    const isMounted = useIsMounted();

    const unlistedAssets = account.getUntrustedIceAssets();

    const addTrustlines = async () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        try {
            setPending(true);

            const ops = unlistedAssets.map(asset =>
                StellarService.op.createAddTrustOperation(asset),
            );
            const tx = await StellarService.tx.buildTx(account, ops);

            const result = await account.signAndSubmitTx(tx);

            if (isMounted.current) {
                setPending(false);
                confirm();
            }

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Trustlines has been added!');
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
            <Wrapper>
                <ModalTitle>Add ICE trustlines</ModalTitle>
                <ModalDescription>
                    Freezing AQUA requires you to add the {unlistedAssets.length} ICE trustlines.
                    Each trustline will reserve 0.5 XLM of your wallet balance.
                </ModalDescription>
                <AssetsBlock>
                    {unlistedAssets.map(asset => (
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
                        <Amount>{unlistedAssets.length * 0.5} XLM</Amount>
                    </AssetLine>
                </AssetsBlock>
                <Button isBig onClick={() => addTrustlines()} pending={pending}>
                    Confirm
                </Button>
            </Wrapper>
        </ModalWrapper>
    );
};

export default AddIceTrustlinesModal;
