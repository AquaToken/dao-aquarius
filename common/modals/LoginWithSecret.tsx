import * as React from 'react';
import { ModalDescription, ModalProps, ModalTitle } from './atoms/ModalAtoms';
import Input from '../basics/Input';
import Button from '../basics/Button';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore/useAuthStore';
import { LoginTypes } from '../store/authStore/types';
import { StellarService, ToastService } from '../services/globalServices';

const LoginWithSecretBody = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const InputWrapped = styled(Input)`
    margin-bottom: 3.1rem;
`;

const LoginWithSecret = ({ confirm, close }: ModalProps<never>): JSX.Element => {
    const [secretKey, setSecretKey] = useState('');

    const { login, isLogged, isLoginPending, loginErrorText } = useAuthStore();

    const onSubmit = () => {
        StellarService.loginWithSecret(secretKey)
            .then((pubKey) => {
                login(pubKey, LoginTypes.secret);
            })
            .catch(() => {
                ToastService.showErrorToast('Invalid secret key');
            });
    };

    useEffect(() => {
        if (isLogged) {
            close();
        }
    }, [isLogged]);

    return (
        <>
            <ModalTitle>Secret key</ModalTitle>
            <ModalDescription>Enter your secret key, started from “S”</ModalDescription>
            <LoginWithSecretBody>
                <InputWrapped
                    required
                    placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    maxLength={56}
                    value={secretKey}
                    onChange={({ target }) => setSecretKey(target.value)}
                />
                <Button
                    isBig
                    disabled={!secretKey}
                    onClick={() => onSubmit()}
                    pending={isLoginPending ?? undefined}
                >
                    connect
                </Button>
            </LoginWithSecretBody>
        </>
    );
};

export default LoginWithSecret;
