import * as React from 'react';
import { ModalDescription, ModalProps, ModalTitle } from './atoms/ModalAtoms';
import styled from 'styled-components';
import { COLORS } from '../styles';
import ArrowRightIcon from '../assets/img/icon-arrow-right.svg';
import KeyIcon from '../assets/img/icon-key.svg';
import WalletConnectLogo from '../assets/img/wallet-connect-logo.svg';
import LobstrLogo from '../assets/img/lobstr-logo.svg';
import { LoginTypes } from '../store/authStore/types';
import LoginWithSecret from './LoginWithSecret';
import { ModalService, WalletConnectService } from '../services/globalServices';

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
`;

const LoginMethodName = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    margin-left: 3rem;
`;

const ArrowRight = styled(ArrowRightIcon)`
    margin-left: auto;
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

const ChooseLoginMethodModal = ({ close }: ModalProps<never>): JSX.Element => {
    const chooseMethod = (method: LoginTypes) => {
        if (method === LoginTypes.secret) {
            close();
            ModalService.openModal(LoginWithSecret, {});
        } else if (method === LoginTypes.walletConnect) {
            WalletConnectService.login();
        }
    };

    return (
        <>
            <ModalTitle>Log in with</ModalTitle>
            <ModalDescription>Choose the best login method</ModalDescription>

            <LoginMethod onClick={() => chooseMethod(LoginTypes.secret)}>
                <KeyIcon />
                <LoginMethodName>Secret key</LoginMethodName>
                <ArrowRight />
            </LoginMethod>

            <LoginMethod onClick={() => chooseMethod(LoginTypes.walletConnect)}>
                <WalletConnectLogoRelative>
                    <WalletConnectLogo />
                    <Tooltip>
                        <LobstrLogo />
                        <TooltipText>Available in LOBSTR wallet</TooltipText>
                    </Tooltip>
                </WalletConnectLogoRelative>

                <LoginMethodName>WalletConnect</LoginMethodName>
                <ArrowRight />
            </LoginMethod>
        </>
    );
};

export default ChooseLoginMethodModal;
