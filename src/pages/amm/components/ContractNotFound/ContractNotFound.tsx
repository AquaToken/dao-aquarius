import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import Button from '../../../../common/basics/Button';
import ErrorHandler from '../../../../common/helpers/error-handler';
import { openCurrentWalletIfExist } from '../../../../common/helpers/wallet-connect-helpers';
import { SorobanService, ToastService } from '../../../../common/services/globalServices';
import { COLORS } from '../../../../common/styles';
import { LoginTypes } from '../../../../store/authStore/types';
import useAuthStore from '../../../../store/authStore/useAuthStore';

const Container = styled.div`
    color: ${COLORS.pinkRed};
    margin-top: 0.8rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const ContractNotFound = ({ asset, onSuccess }) => {
    const [pending, setPending] = useState(false);

    const { account } = useAuthStore();

    const deploy = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setPending(true);

        SorobanService.deployAssetContractTx(account.accountId(), asset)
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
