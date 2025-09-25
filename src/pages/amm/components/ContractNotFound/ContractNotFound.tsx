import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import ErrorHandler from 'helpers/error-handler';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService, ToastService } from 'services/globalServices';

import { Asset } from 'types/stellar';

import { COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';

const Container = styled.div`
    color: ${COLORS.red500};
    margin-top: 0.8rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

interface ContractNotFoundProps {
    asset: Asset;
    onSuccess?: () => void;
}

const ContractNotFound = ({ asset, onSuccess }: ContractNotFoundProps): React.ReactNode => {
    const [pending, setPending] = useState(false);

    const { account } = useAuthStore();

    const deploy = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setPending(true);

        SorobanService.token
            .deployAssetContractTx(account.accountId(), asset)
            .then(tx => account.signAndSubmitTx(tx))
            .then(() => {
                onSuccess();
            })
            .catch(e => {
                const errorText = ErrorHandler(e);
                ToastService.showErrorToast(errorText);
                setPending(false);
            });
    };
    return (
        <Container>
            This asset has no contract on the Soroban network. You can deploy it{' '}
            <Button isSmall pending={pending} onClick={() => deploy()}>
                deploy
            </Button>
        </Container>
    );
};

export default ContractNotFound;
