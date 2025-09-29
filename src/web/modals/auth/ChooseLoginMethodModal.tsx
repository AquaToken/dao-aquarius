import isUaWebview from 'is-ua-webview';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { isChrome, isMobile } from 'helpers/browser';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { AuthService, ModalService, ToastService } from 'services/globalServices';

import { ModalProps } from 'types/modal';

import ArrowRightIcon from 'assets/icons/arrows/arrow-right-16.svg';
import KeyIcon from 'assets/icons/objects/icon-key-40.svg';
import Stellar from 'assets/tokens/xlm-logo.svg';
import Ledger from 'assets/wallets/ledger-logo.svg';
import BG from 'assets/wallets/lobstr/get-extension-bg.svg';
import LobstrLogo from 'assets/wallets/lobstr/lobstr-logo-black.svg';
import WalletConnectLogo from 'assets/wallets/wallet-connect-logo.svg';

import Label from 'basics/Label';
import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import LoginWithPublic from './LoginWithPublic';
import LoginWithSecret from './LoginWithSecret';

import { respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';
import GetLobstrExtensionModal from '../GetLobstrExtensionModal';
import LedgerLogin from '../ledger/LedgerLogin';

const BgStyled = styled(BG)`
    ${respondDown(Breakpoints.md)`
        width: 100vw;
        height: 30vh;
    `}
`;

export const LoginMethod = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 9rem;
    background-color: ${COLORS.gray50};
    border-radius: 0.5rem;
    padding: 0 2.4rem 0 2.4rem;
    box-sizing: border-box;
    transition: all ease-in 150ms;
    cursor: pointer;

    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }

    &:hover {
        padding-right: 1.9rem;
    }

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const LoginMethodWithDescription = styled.div`
    display: flex;
    flex-direction: column;
`;

export const LoginMethodName = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
    margin-left: 2.4rem;
    display: flex;
    gap: 0.8rem;
    align-items: center;

    div {
        height: fit-content;
    }
`;

export const LoginMethodDescription = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
    margin-left: 2.4rem;
`;

const ArrowRight = styled(ArrowRightIcon)`
    margin-left: auto;
    min-width: 1.6rem;
`;

const StellarLogo = styled(Stellar)`
    width: 3.7rem;
    min-width: 3.7rem;
`;

const ChooseLoginMethodModal = ({
    close,
    params,
}: ModalProps<{ redirectURL?: string; callback?: () => void }>): React.ReactNode => {
    const [pending, setPending] = useState(false);
    const { enableRedirect, disableRedirect, addAuthCallback, removeAuthCallback } = useAuthStore();

    useEffect(() => {
        if (params.redirectURL) {
            enableRedirect(params.redirectURL);
        } else {
            disableRedirect();
        }
    }, []);

    useEffect(() => {
        if (params.callback) {
            addAuthCallback(params.callback);
        } else {
            removeAuthCallback();
        }
    }, []);

    const chooseMethod = (method: LoginTypes) => {
        if (pending) {
            return;
        }
        switch (method) {
            case LoginTypes.walletConnect:
                // We make the assumption that if the application is open via WebView,
                // then wallet knows how to process the custom postMessage
                if (isUaWebview(window?.navigator?.userAgent)) {
                    close();
                    AuthService.walletConnect.autoLogin();
                } else {
                    AuthService.walletConnect.login();
                }
                break;

            case LoginTypes.ledger:
                AuthService.ledger.isSupported.then(res => {
                    if (res) {
                        close();
                        ModalService.openModal(LedgerLogin, {});
                    } else {
                        ToastService.showErrorToast(
                            'Ledger Wallet is not supported by your browser.',
                        );
                    }
                });
                break;

            case LoginTypes.walletKit:
                AuthService.walletKit.showWalletKitModal();
                break;
            case LoginTypes.public:
                close();
                ModalService.openModal(LoginWithPublic, {});
                break;
            case LoginTypes.secret:
                close();
                ModalService.openModal(LoginWithSecret, {});
                break;
            case LoginTypes.lobstr:
                if (!isChrome()) {
                    ToastService.showErrorToast('LOBSTR wallet is not supported by your browser.');
                    return;
                }
                setPending(true);
                AuthService.lobstrExtension.isConnected.then(res => {
                    if (res) {
                        setPending(false);
                        AuthService.lobstrExtension.login().then(() => {
                            close();
                        });
                    } else {
                        setPending(false);
                        close();
                        ModalService.openModal(GetLobstrExtensionModal, {}, false, <BgStyled />);
                    }
                });
                break;
        }
    };

    return (
        <ModalWrapper>
            <ModalTitle>Sign in</ModalTitle>

            {!isMobile() && (
                <LoginMethod onClick={() => chooseMethod(LoginTypes.lobstr)}>
                    <LobstrLogo />
                    <LoginMethodName>LOBSTR wallet</LoginMethodName>
                    <ArrowRight />
                </LoginMethod>
            )}

            <LoginMethod onClick={() => chooseMethod(LoginTypes.walletKit)}>
                <StellarLogo />

                <LoginMethodWithDescription>
                    <LoginMethodName>
                        Stellar Wallet Kit <Label labelText="NEW!" />
                    </LoginMethodName>
                    <LoginMethodDescription>
                        Freighter, HOT Wallet, xBull, Albedo, Hana Wallet, Rabet
                    </LoginMethodDescription>
                </LoginMethodWithDescription>
                <ArrowRight />
            </LoginMethod>

            <LoginMethod onClick={() => chooseMethod(LoginTypes.walletConnect)}>
                <WalletConnectLogo />

                <LoginMethodName>WalletConnect</LoginMethodName>
                <ArrowRight />
            </LoginMethod>

            <LoginMethod onClick={() => chooseMethod(LoginTypes.ledger)}>
                <Ledger />
                <LoginMethodWithDescription>
                    <LoginMethodName>Ledger</LoginMethodName>
                </LoginMethodWithDescription>

                <ArrowRight />
            </LoginMethod>

            <LoginMethod onClick={() => chooseMethod(LoginTypes.public)}>
                <StellarLogo />
                <LoginMethodWithDescription>
                    <LoginMethodName>Stellar Laboratory</LoginMethodName>
                    <LoginMethodDescription>Sign with Stellar Laboratory.</LoginMethodDescription>
                </LoginMethodWithDescription>

                <ArrowRight />
            </LoginMethod>

            <LoginMethod onClick={() => chooseMethod(LoginTypes.secret)}>
                <KeyIcon />
                <LoginMethodName>Secret key</LoginMethodName>
                <ArrowRight />
            </LoginMethod>
        </ModalWrapper>
    );
};

export default ChooseLoginMethodModal;
