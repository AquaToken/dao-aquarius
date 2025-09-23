import * as React from 'react';
import { useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import useOnClickOutside from 'hooks/useOutsideClick';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import ArrowDown from 'assets/icon-arrow-down.svg';
import CloseIcon from 'assets/icon-close-small.svg';
import MobileMenuIcon from 'assets/icon-mobile-menu.svg';

import Button from 'basics/buttons/Button';
import Identicon from 'basics/Identicon';

import ChooseLoginMethodModal from 'modals/auth/ChooseLoginMethodModal';

import { flexAllCenter, respondDown, textEllipsis } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';
import AppMenu from '../AppMenu';

const Wrapper = styled.div`
    position: relative;
    height: 100%;
`;

const AccountBlockContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const AccountBlockWeb = styled(AccountBlockContainer)<{ $isMenuOpen: boolean }>`
    padding: 2.4rem;
    box-shadow: ${({ $isMenuOpen }) => ($isMenuOpen ? '0 2rem 3rem rgba(0, 6, 54, 0.06)' : 'none')};
    cursor: pointer;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const AccountBlockMobile = styled(AccountBlockContainer)`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const IconsBlock = styled.div`
    position: relative;
    height: 4.8rem;
    width: 4.8rem;
`;

const AppIcon = styled.img`
    height: 1.6rem;
    width: 1.6rem;
    border-radius: 50%;
    position: absolute;
    bottom: 0;
    right: 0;

    ${respondDown(Breakpoints.md)`
       height: 1.1rem;
       width: 1.1rem;   
    `}
`;

const AccountAddresses = styled.div`
    margin-left: 0.8rem;
    margin-right: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;

    ${respondDown(Breakpoints.lg)`
        display: none;
    `}
`;

const Arrow = styled.div<{ $isMenuOpen: boolean }>`
    transform-origin: center;
    transform: ${({ $isMenuOpen }) => ($isMenuOpen ? 'rotate(180deg)' : 'none')};
    transition: transform linear 200ms;
    height: 1.6rem;
    width: 1.6rem;

    ${respondDown(Breakpoints.md)`
          display: none;
      `}
`;

const AccountFederation = styled.div`
    color: ${COLORS.titleText};
    line-height: 2rem;
    margin-bottom: 0.2rem;
    max-width: 25rem;
    ${textEllipsis};
`;

const AccountPublic = styled.div`
    color: ${COLORS.grayText};
    line-height: 2rem;
`;

const SignInButton = styled(Button)`
    width: 12rem;
    margin-left: 1.6rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const MobileMenu = styled.div`
    display: none;
    cursor: pointer;
    padding: 1rem;
    box-sizing: border-box;
    margin-right: -1rem;

    ${respondDown(Breakpoints.md)`
        display: block;
    `}
`;

const MobileMenuButton = styled.div`
    ${flexAllCenter};
    height: 4.8rem;
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.titleText};
    background: ${COLORS.lightGray};
    border-radius: 0.6rem;
    padding: 0 1.6rem;

    &:hover {
        color: ${COLORS.purple};
    }

    svg {
        margin-right: 0.8rem;
    }
`;

const CloseMenuButton = styled.div`
    ${flexAllCenter};
    height: 4.8rem;
    width: 4.8rem;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
`;

const BodyStyle = createGlobalStyle`
    html {
        overflow: hidden;
    }
    body {
      overflow: hidden;
    }
`;

const AccountBlock = ({ navLinks }: { navLinks?: React.ReactNode }): React.ReactNode => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { account, federationAddress, loginType, metadata, isLogged, isLoginPending } =
        useAuthStore();
    const menuRef = useRef(null);
    useOnClickOutside(menuRef, () => setIsMenuOpen(false));

    const signIn = () => {
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    };

    if (!isLogged) {
        return (
            <>
                <SignInButton onClick={() => signIn()} pending={isLoginPending}>
                    sign in
                </SignInButton>
                <MobileMenu onClick={() => toggleMenu()}>
                    {isMenuOpen ? (
                        <CloseMenuButton>
                            <CloseIcon />
                            <BodyStyle />
                        </CloseMenuButton>
                    ) : (
                        <MobileMenuButton>
                            <MobileMenuIcon />
                            Menu
                        </MobileMenuButton>
                    )}
                </MobileMenu>
                {isMenuOpen && (
                    <AppMenu navLinks={navLinks} closeMenu={() => setIsMenuOpen(false)} />
                )}
            </>
        );
    }

    const accountId = account.accountId();
    const accountIdView = `${accountId.slice(0, 8)}...${accountId.slice(-8)}`;

    return (
        <Wrapper ref={menuRef}>
            <AccountBlockWeb onClick={() => toggleMenu()} $isMenuOpen={isMenuOpen}>
                <IconsBlock>
                    <Identicon pubKey={accountId} />
                    {loginType === LoginTypes.walletConnect && (
                        <AppIcon src={metadata?.icons?.[0]} alt={metadata?.name} />
                    )}
                </IconsBlock>

                <AccountAddresses>
                    {federationAddress && (
                        <AccountFederation>{federationAddress}</AccountFederation>
                    )}
                    <AccountPublic>{accountIdView}</AccountPublic>
                </AccountAddresses>

                <Arrow $isMenuOpen={isMenuOpen}>
                    <ArrowDown />
                </Arrow>
            </AccountBlockWeb>

            <AccountBlockMobile>
                <MobileMenu onClick={() => toggleMenu()}>
                    {isMenuOpen ? (
                        <CloseMenuButton>
                            <CloseIcon />
                            <BodyStyle />
                        </CloseMenuButton>
                    ) : (
                        <MobileMenuButton>
                            <MobileMenuIcon />
                            Menu
                        </MobileMenuButton>
                    )}
                </MobileMenu>
            </AccountBlockMobile>
            {isMenuOpen && <AppMenu navLinks={navLinks} closeMenu={() => setIsMenuOpen(false)} />}
        </Wrapper>
    );
};

export default AccountBlock;
