import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { ModalDescription, ModalTitle } from '../../../../../common/modals/atoms/ModalAtoms';
import useAuthStore from '../../../../../store/authStore/useAuthStore';
import Ice from '../../../../../common/assets/img/ice-logo.svg';
import Button from '../../../../../common/basics/Button';
import { StellarService, ToastService } from '../../../../../common/services/globalServices';
import { LoginTypes } from '../../../../../store/authStore/types';
import { BuildSignAndSubmitStatuses } from '../../../../../common/services/wallet-connect.service';
import { useState } from 'react';
import ErrorHandler from '../../../../../common/helpers/error-handler';
import { useIsMounted } from '../../../../../common/hooks/useIsMounted';
import { openCurrentWalletIfExist } from '../../../../../common/helpers/wallet-connect-helpers';

const ModalContainer = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
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
    color: ${COLORS.grayText};
`;

const Amount = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
`;

const AssetsBlock = styled.div`
    padding-bottom: 4rem;
    margin-bottom: 3.1rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const AddIceTrustlinesModal = ({ confirm }) => {
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

            const ops = unlistedAssets.map((asset) => {
                return StellarService.createAddTrustOperation(asset);
            });
            const tx = await StellarService.buildTx(account, ops);

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
        <ModalContainer>
            <ModalTitle>Add ICE trustlines</ModalTitle>
            <ModalDescription>
                Freezing AQUA requires you to add the {unlistedAssets.length} ICE trustlines. Each
                trustline will reserve 0.5 XLM of your wallet balance.
            </ModalDescription>
            <AssetsBlock>
                {unlistedAssets.map((asset) => (
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
        </ModalContainer>
    );
};

export default AddIceTrustlinesModal;
