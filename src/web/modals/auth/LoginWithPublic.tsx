import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ToastService } from 'services/globalServices';
import { isValidPublicKey } from 'services/stellar/utils/validators';

import { ModalProps } from 'types/modal';

import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

const LoginWithSecretBody = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Description = styled(ModalDescription)`
    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const StyledButton = styled(Button)`
    ${respondDown(Breakpoints.md)`
            width: 100%;
        `}
`;

const InputWrapped = styled(Input)`
    margin-bottom: 3.1rem;
`;

const LoginWithPublic = ({ close }: ModalProps<never>): React.ReactNode => {
    const location = useLocation();
    const path = location.pathname.substring(1);
    const [publicKey, setPublicKey] = useState(isValidPublicKey(path) ? path : '');

    const { login, isLogged, isLoginPending } = useAuthStore();

    const onSubmit = () => {
        if (!isValidPublicKey(publicKey)) {
            ToastService.showErrorToast('Invalid public key');
            return;
        }

        login({
            pubKey: publicKey,
            loginType: LoginTypes.public,
        });
    };

    useEffect(() => {
        if (isLogged) {
            close();
        }
    }, [isLogged]);

    return (
        <ModalWrapper>
            <ModalTitle>Public key</ModalTitle>
            <Description>Enter your public key, started from “G”</Description>
            <LoginWithSecretBody>
                <InputWrapped
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    maxLength={56}
                    value={publicKey}
                    onChange={({ target }) => setPublicKey(target.value)}
                />
                <StyledButton
                    isBig
                    disabled={!publicKey}
                    onClick={() => onSubmit()}
                    pending={isLoginPending ?? undefined}
                >
                    connect
                </StyledButton>
            </LoginWithSecretBody>
        </ModalWrapper>
    );
};

export default LoginWithPublic;
