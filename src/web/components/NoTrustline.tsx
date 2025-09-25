import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import ErrorHandler from 'helpers/error-handler';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { Token, TokenType } from 'types/token';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Plus from 'assets/icon-plus.svg';

import Asset from 'basics/Asset';
import { Button } from 'basics/buttons';
import { ButtonProps } from 'basics/buttons/Button';

const TrustlineBlock = styled.div<{ $isRounded?: boolean }>`
    display: flex;
    flex-direction: column;
    padding: 3.2rem;
    background-color: ${COLORS.gray50};
    margin-top: 1.6rem;
    border-radius: ${({ $isRounded }) => ($isRounded ? '4rem' : '0.6rem')};

    p {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.textGray};
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

interface NoTrustlineProps extends Omit<ButtonProps, 'children'> {
    asset: Token;
    onlyButton?: boolean;
    isRounded?: boolean;
    closeModalAfterSubmit?: boolean;
}

const NoTrustline = ({
    asset,
    onlyButton,
    isRounded,
    closeModalAfterSubmit,
    ...props
}: NoTrustlineProps): React.ReactNode => {
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
            ToastService.showSuccessToast('Trustline added successfully');
            if (closeModalAfterSubmit) {
                ModalService.closeAllModals();
            }
            setTrustlinePending(false);
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setTrustlinePending(false);
        }
    };

    if (asset.type === TokenType.soroban) {
        return null;
    }

    if (!account || account.getAssetBalance(asset) !== null) {
        return null;
    }

    if (onlyButton) {
        return (
            <Button onClick={() => addTrust()} pending={trustlinePending} {...props}>
                add {asset.code} trustline
            </Button>
        );
    }

    return (
        <TrustlineBlock {...props} $isRounded={isRounded}>
            <TrustlineBlockTitle>
                <Asset asset={asset} onlyLogo /> <span>{asset.code} trustline missing</span>
            </TrustlineBlockTitle>
            <p>
                You can't receive the {asset.code} asset because you haven't added this trustline.
                Please add the {asset.code} trustline to continue the transaction.
            </p>
            <TrustlineButton
                onClick={() => addTrust()}
                pending={trustlinePending}
                isRounded={isRounded}
            >
                add {asset.code} trustline <Plus />
            </TrustlineButton>
        </TrustlineBlock>
    );
};

export default NoTrustline;
