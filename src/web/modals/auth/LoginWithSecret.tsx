import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalProps } from 'types/modal';

import { SorobanService, ToastService } from 'services/globalServices';

import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

import { respondDown } from '../../mixins';
import { Breakpoints } from '../../styles';

const LoginWithSecretBody = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Description = styled(ModalDescription)`
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const InputWrapped = styled(Input)`
    margin-bottom: 3.1rem;
`;

const StyledButton = styled(Button)`
    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const LoginWithSecret = ({ close }: ModalProps<never>): React.ReactNode => {
    const [secretKey, setSecretKey] = useState('');

    const { login, isLogged, isLoginPending } = useAuthStore();

    const onSubmit = () => {
        SorobanService.loginWithSecret(secretKey)
            .then(pubKey => {
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
            <Description>
                We recommend using WalletConnect login as it provides better security. Secret key
                login is not recommended and will be deprecated shortly. Check the URL and make sure
                you are on the correct website.
            </Description>
            <LoginWithSecretBody>
                <InputWrapped
                    placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    maxLength={56}
                    value={secretKey}
                    type="password"
                    onChange={({ target }) => setSecretKey(target.value)}
                />
                <StyledButton
                    isBig
                    disabled={!secretKey}
                    onClick={() => onSubmit()}
                    pending={isLoginPending ?? undefined}
                >
                    connect
                </StyledButton>
            </LoginWithSecretBody>
        </>
    );
};

export default LoginWithSecret;
