import * as React from 'react';
import Button from '../../../../common/basics/Button';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import { useState } from 'react';
import { SorobanService, ToastService } from '../../../../common/services/globalServices';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import ErrorHandler from '../../../../common/helpers/error-handler';
import { LoginTypes } from '../../../../store/authStore/types';
import { openCurrentWalletIfExist } from '../../../../common/helpers/wallet-connect-helpers';

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
            .then((tx) => account.signAndSubmitTx(tx))
            .then(() => {
                onSuccess();
            })
            .catch((e) => {
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
