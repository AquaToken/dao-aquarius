import * as React from 'react';
import { ModalDescription, ModalProps, ModalTitle } from './atoms/ModalAtoms';
import Input from '../basics/Input';
import Button from '../basics/Button';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore/useAuthStore';
import { LoginTypes } from '../../store/authStore/types';
import { StellarService, ToastService } from '../services/globalServices';
import { Breakpoints } from '../styles';
import { respondDown } from '../mixins';

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

const LoginWithSecret = ({ close }: ModalProps<never>): JSX.Element => {
    const [secretKey, setSecretKey] = useState('');

    const { login, isLogged, isLoginPending } = useAuthStore();

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
