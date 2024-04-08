import * as React from 'react';
import { ModalProps, ModalTitle } from './atoms/ModalAtoms';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../styles';
import ArrowRightIcon from '../assets/img/icon-arrow-right.svg';
import KeyIcon from '../assets/img/icon-key.svg';
import WalletConnectLogo from '../assets/img/wallet-connect-logo.svg';
import LobstrLogo from '../assets/img/lobstr-logo-black.svg';
import Stellar from '../assets/img/xlm-logo.svg';
import Ledger from '../assets/img/ledger-logo.svg';
import { LoginTypes } from '../../store/authStore/types';
import LoginWithSecret from './LoginWithSecret';
import {
    LedgerService,
    LobstrExtensionService,
    ModalService,
    ToastService,
    WalletConnectService,
} from '../services/globalServices';
import { respondDown } from '../mixins';
import LoginWithPublic from './LoginWithPublic';
import LedgerLogin from './LedgerModals/LedgerLogin';
import isUaWebview from 'is-ua-webview';
import { useEffect } from 'react';
import useAuthStore from '../../store/authStore/useAuthStore';
import { isChrome, isMobile } from '../helpers/browser';
import GetLobstrExtensionModal from './GetLobstrExtensionModal';

const LoginMethod = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 9rem;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
    padding: 0 2.4rem 0 3.4rem;
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

const LoginMethodWithDescription = styled.div`
    display: flex;
    flex-direction: column;
`;

const LoginMethodName = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    margin-left: 3rem;
`;

const LoginMethodDescription = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    margin-left: 3rem;
`;

const ArrowRight = styled(ArrowRightIcon)`
    margin-left: auto;
    min-width: 1.6rem;
`;

const StellarLogo = styled(Stellar)`
    width: 3.7rem;
    min-width: 3.7rem;
`;

const WalletConnectLogoRelative = styled.div`
    position: relative;
`;

const Tooltip = styled.div`
    display: flex;
    align-items: center;
    position: absolute;
    top: calc(100% + 1.2rem);
    background-color: ${COLORS.tooltip};
    white-space: nowrap;
    padding: 0.4rem 0.7rem;
    border-radius: 0.5rem;

    &::after {
        content: '';
        position: absolute;
        top: -0.3rem;
        left: 1.7rem;
        border-bottom: 0.3rem solid ${COLORS.tooltip};
        border-left: 0.3rem solid ${COLORS.transparent};
        border-right: 0.3rem solid ${COLORS.transparent};
    }
`;

const TooltipText = styled.div`
    margin-left: 0.5rem;
    font-size: 1.2rem;
    line-height: 1.4rem;
    font-weight: bold;
    color: ${COLORS.white};
`;

const ChooseLoginMethodModal = ({
    close,
    params,
}: ModalProps<{ redirectURL?: string; callback?: () => void }>): JSX.Element => {
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
        switch (method) {
            case LoginTypes.walletConnect:
                // We make the assumption that if the application is open via WebView,
                // then wallet knows how to process the custom postMessage
                if (isUaWebview(window?.navigator?.userAgent)) {
                    close();
                    WalletConnectService.autoLogin();
                } else {
                    WalletConnectService.login();
                }
                break;
            case LoginTypes.public:
                close();
                ModalService.openModal(LoginWithPublic, {});
                break;
            case LoginTypes.ledger:
                LedgerService.isSupported.then((res) => {
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
            case LoginTypes.secret:
                close();
                ModalService.openModal(LoginWithSecret, {});
                break;
            case LoginTypes.lobstr:
                if (!isChrome()) {
                    ToastService.showErrorToast(
                        'LOBSTR | Signer extension is not supported by your browser. Use Google Chrome.',
                    );
                    return;
                }
                LobstrExtensionService.isConnected.then((res) => {
                    if (res) {
                        LobstrExtensionService.login().then(() => {
                            close();
                        });
                    } else {
                        close();
                        ModalService.openModal(GetLobstrExtensionModal, {});
                    }
                });
                break;
        }
    };

    return (
        <>
            <ModalTitle>Sign in</ModalTitle>

            {!isMobile() && (
                <LoginMethod onClick={() => chooseMethod(LoginTypes.lobstr)}>
                    <LobstrLogo />
                    <LoginMethodName>LOBSTR | Signer extension</LoginMethodName>
                    <ArrowRight />
                </LoginMethod>
            )}

            <LoginMethod onClick={() => chooseMethod(LoginTypes.walletConnect)}>
                <WalletConnectLogo />

                <LoginMethodName>WalletConnect</LoginMethodName>
                <ArrowRight />
            </LoginMethod>

            <LoginMethod onClick={() => chooseMethod(LoginTypes.public)}>
                <StellarLogo />
                <LoginMethodWithDescription>
                    <LoginMethodName>Stellar Laboratory</LoginMethodName>
                    <LoginMethodDescription>
                        Sign with Freighter, Trezor, Albedo or others tools.
                    </LoginMethodDescription>
                </LoginMethodWithDescription>

                <ArrowRight />
            </LoginMethod>

            <LoginMethod onClick={() => chooseMethod(LoginTypes.ledger)}>
                <Ledger />
                <LoginMethodWithDescription>
                    <LoginMethodName>Ledger</LoginMethodName>
                </LoginMethodWithDescription>

                <ArrowRight />
            </LoginMethod>

            <LoginMethod onClick={() => chooseMethod(LoginTypes.secret)}>
                <KeyIcon />
                <LoginMethodName>Secret key</LoginMethodName>
                <ArrowRight />
            </LoginMethod>
        </>
    );
};

export default ChooseLoginMethodModal;
