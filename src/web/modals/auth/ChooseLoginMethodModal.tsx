import isUaWebview from 'is-ua-webview';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { isChrome, isMobile } from 'helpers/browser';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalProps } from 'types/modal';

import {
    FreighterService,
    LedgerService,
    LobstrExtensionService,
    ModalService,
    ToastService,
    WalletConnectService,
} from 'services/globalServices';

import Freighter from 'assets/freighter-logo.svg';
import BG from 'assets/get-extension-bg.svg';
import ArrowRightIcon from 'assets/icon-arrow-right.svg';
import KeyIcon from 'assets/icon-key.svg';
import Ledger from 'assets/ledger-logo.svg';
import LobstrLogo from 'assets/lobstr-logo-black.svg';
import WalletConnectLogo from 'assets/wallet-connect-logo.svg';
import Stellar from 'assets/xlm-logo.svg';

import { ModalTitle } from 'basics/ModalAtoms';

import LoginWithPublic from './LoginWithPublic';
import LoginWithSecret from './LoginWithSecret';

import { respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';
import GetFreighterModal from '../GetFreighterModal';
import GetLobstrExtensionModal from '../GetLobstrExtensionModal';
import LedgerLogin from '../ledger/LedgerLogin';

const BgStyled = styled(BG)`
    ${respondDown(Breakpoints.md)`
        width: 100vw;
        height: 30vh;
    `}
`;

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
                LedgerService.isSupported.then(res => {
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
                    ToastService.showErrorToast('LOBSTR wallet is not supported by your browser.');
                    return;
                }
                setPending(true);
                LobstrExtensionService.isConnected.then(res => {
                    if (res) {
                        setPending(false);
                        LobstrExtensionService.login().then(() => {
                            close();
                        });
                    } else {
                        setPending(false);
                        close();
                        ModalService.openModal(GetLobstrExtensionModal, {}, false, <BgStyled />);
                    }
                });
                break;

            case LoginTypes.freighter:
                FreighterService.isConnected.then(res => {
                    if (res) {
                        FreighterService.login().then(() => {
                            close();
                        });
                    } else {
                        close();
                        ModalService.openModal(GetFreighterModal, {});
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
                    <LoginMethodName>LOBSTR wallet</LoginMethodName>
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
                        Sign with Trezor, Albedo or others tools.
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

            {!isMobile() && (
                <LoginMethod onClick={() => chooseMethod(LoginTypes.freighter)}>
                    <Freighter />
                    <LoginMethodWithDescription>
                        <LoginMethodName>Freighter</LoginMethodName>
                    </LoginMethodWithDescription>

                    <ArrowRight />
                </LoginMethod>
            )}

            <LoginMethod onClick={() => chooseMethod(LoginTypes.secret)}>
                <KeyIcon />
                <LoginMethodName>Secret key</LoginMethodName>
                <ArrowRight />
            </LoginMethod>
        </>
    );
};

export default ChooseLoginMethodModal;
