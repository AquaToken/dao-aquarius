import * as React from 'react';
import { useRef, useState } from 'react';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import styled, { createGlobalStyle } from 'styled-components';
import { Breakpoints, COLORS } from '../../../../styles';
import Identicon from '../../../../basics/Identicon';
import ArrowDown from '../../../../assets/img/icon-arrow-down.svg';
import CloseIcon from '../../../../assets/img/icon-close-small.svg';
import useOnClickOutside from '../../../../hooks/useOutsideClick';
import { flexAllCenter, respondDown, textEllipsis } from '../../../../mixins';
import AppMenu from '../AppMenu/AppMenu';
import { LoginTypes } from '../../../../store/authStore/types';
import Button from '../../../../basics/Button';
import { ModalService } from '../../../../services/globalServices';
import ChooseLoginMethodModal from '../../../../modals/ChooseLoginMethodModal';
import MobileMenuIcon from '../../../../assets/img/icon-mobile-menu.svg';

const AccountBlockContainer = styled.div<{ isMenuOpen: boolean }>`
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    padding: 2.4rem;
    cursor: pointer;
    box-shadow: ${({ isMenuOpen }) => (isMenuOpen ? '0 2rem 3rem rgba(0, 6, 54, 0.06)' : 'none')};

    ${respondDown(Breakpoints.md)`
         box-shadow: unset;
         padding-right: 0;
    `}
`;

const IconsBlock = styled.div`
    position: relative;
    height: 4.8rem;
    width: 4.8rem;

    ${respondDown(Breakpoints.md)`
        height: 3.4rem;
        width: 3.4rem;
    `}
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

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const Arrow = styled.div<{ isMenuOpen: boolean }>`
    transform-origin: center;
    transform: ${({ isMenuOpen }) => (isMenuOpen ? 'rotate(180deg)' : 'none')};
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
    height: 3.4rem;
    width: 3.4rem;
`;

const CloseMenuButton = styled.div`
    ${flexAllCenter};
    height: 3.4rem;
    width: 3.4rem;
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

const HeaderMenuButton = ({ navLinks }: { navLinks?: JSX.Element }): JSX.Element => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { account, federationAddress, loginType, metadata, isLogged } = useAuthStore();
    const menuRef = useRef(null);
    useOnClickOutside(menuRef, () => setIsMenuOpen(false));

    const signIn = () => {
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    const toggleMenu = () => {
        setIsMenuOpen((prevState) => !prevState);
    };

    if (!isLogged) {
        return (
            <>
                <SignInButton onClick={() => signIn()}>sign in</SignInButton>
                <MobileMenu onClick={() => toggleMenu()}>
                    {isMenuOpen ? (
                        <CloseMenuButton>
                            <CloseIcon />
                            <BodyStyle />
                        </CloseMenuButton>
                    ) : (
                        <MobileMenuButton>
                            <MobileMenuIcon />
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
        <AccountBlockContainer onClick={() => toggleMenu()} isMenuOpen={isMenuOpen} ref={menuRef}>
            <IconsBlock>
                <Identicon pubKey={accountId} />
                {loginType === LoginTypes.walletConnect && (
                    <AppIcon src={metadata?.icons?.[0]} alt={metadata?.name} />
                )}
            </IconsBlock>

            <AccountAddresses>
                {federationAddress && <AccountFederation>{federationAddress}</AccountFederation>}
                <AccountPublic>{accountIdView}</AccountPublic>
            </AccountAddresses>

            <Arrow isMenuOpen={isMenuOpen}>
                <ArrowDown />
            </Arrow>
            {isMenuOpen && <AppMenu navLinks={navLinks} closeMenu={() => setIsMenuOpen(false)} />}
        </AccountBlockContainer>
    );
};

export default HeaderMenuButton;
