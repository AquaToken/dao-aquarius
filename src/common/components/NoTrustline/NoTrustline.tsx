import { Asset as AssetType } from '@stellar/stellar-sdk';
import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import ErrorHandler from 'helpers/error-handler';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Plus from 'assets/icon-plus.svg';

import Button from 'basics/buttons/Button';

import Asset from '../../../pages/vote/components/AssetDropdown/Asset';

const TrustlineBlock = styled.div`
    display: flex;
    flex-direction: column;
    padding: 3.2rem;
    background-color: ${COLORS.lightGray};
    margin-top: 1.6rem;
    border-radius: 0.6rem;

    p {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.grayText};
    }
`;

const TrustlineBlockTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 2.8rem;
`;

const TrustlineButton = styled(Button)`
    width: fit-content;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        margin-top: 2rem;
    `}
    svg {
        margin-left: 0.8rem;
    }
`;

const NoTrustline = ({ asset, onlyButton }: { asset: AssetType; onlyButton?: boolean }) => {
    const [trustlinePending, setTrustlinePending] = useState(false);

    const { account } = useAuthStore();

    const addTrust = async () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setTrustlinePending(true);
        try {
            const op = StellarService.createAddTrustOperation(asset);

            const tx = await StellarService.buildTx(account, op);

            const result = await account.signAndSubmitTx(tx);

            if (
                (result as { status: BuildSignAndSubmitStatuses })?.status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Trusline added successfully');
            setTrustlinePending(false);
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setTrustlinePending(false);
        }
    };

    if (!account || account.getAssetBalance(asset) !== null) {
        return null;
    }

    if (onlyButton) {
        return (
            <Button isBig likeDisabled onClick={() => addTrust()} pending={trustlinePending}>
                add trustline
            </Button>
        );
    }
    return (
        <TrustlineBlock>
            <TrustlineBlockTitle>
                <Asset asset={asset} onlyLogo /> <span>{asset.code} trustline missing</span>
            </TrustlineBlockTitle>
            <p>
                You can't receive the {asset.code} asset because you haven't added this trustline.
                Please add the {asset.code} trustline to continue the transaction.
            </p>
            <TrustlineButton onClick={() => addTrust()} pending={trustlinePending}>
                add {asset.code} trustline <Plus />
            </TrustlineButton>
        </TrustlineBlock>
    );
};

export default NoTrustline;
