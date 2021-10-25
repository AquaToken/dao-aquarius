import * as React from 'react';
import { useRef, useState } from 'react';
import useAuthStore from '../../../store/authStore/useAuthStore';
import styled from 'styled-components';
import { COLORS } from '../../../styles';
import Identicon from '../../../basics/Identicon';
import ArrowDown from '../../../assets/img/icon-arrow-down.svg';
import useOnClickOutside from '../../../hooks/useOutsideClick';
import { textEllipsis } from '../../../mixins';
import AccountMenu from './AccountMenu';
import { LoginTypes } from '../../../store/authStore/types';

const AccountBlockContainer = styled.div<{ isMenuOpen: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    padding: 2.4rem;
    cursor: pointer;
    box-shadow: ${({ isMenuOpen }) => (isMenuOpen ? '0 2rem 3rem rgba(0, 6, 54, 0.06)' : 'none')}; ;
`;

const IconsBlock = styled.div`
    position: relative;
`;

const AppIcon = styled.img`
    height: 1.6rem;
    width: 1.6rem;
    border-radius: 50%;
    position: absolute;
    bottom: 0;
    right: 0;
`;

const AccountAddresses = styled.div`
    margin-left: 0.8rem;
    margin-right: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const Arrow = styled.div<{ isMenuOpen: boolean }>`
    transform-origin: center;
    transform: ${({ isMenuOpen }) => (isMenuOpen ? 'rotate(180deg)' : 'none')};
    transition: transform linear 200ms;
    height: 1.6rem;
    width: 1.6rem;
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

const AccountBlock = (): JSX.Element => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { account, federationAddress, loginType, metadata } = useAuthStore();
    const menuRef = useRef(null);
    const accountId = account.accountId();
    const accountIdView = `${accountId.slice(0, 8)}...${accountId.slice(-8)}`;

    useOnClickOutside(menuRef, () => setIsMenuOpen(false));

    const toggleMenu = () => {
        setIsMenuOpen((prevState) => !prevState);
    };

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
            {isMenuOpen && <AccountMenu closeMenu={() => setIsMenuOpen(false)} />}
        </AccountBlockContainer>
    );
};

export default AccountBlock;
