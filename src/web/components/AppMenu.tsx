import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { ICE_CODE, ICE_ISSUER } from 'constants/assets';
import { LockerRoutes } from 'constants/routes';

import { getIsTestnetEnv } from 'helpers/env';
import { formatBalance } from 'helpers/format-number';
import { createAsset } from 'helpers/token';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { AuthService, ModalService } from 'services/globalServices';

import Aqua from 'assets/aqua-logo-small.svg';
import Ice from 'assets/ice-logo.svg';
import IconCopy from 'assets/icon-copy.svg';
import External from 'assets/icon-external-link.svg';
import IconLogout from 'assets/icon-logout.svg';
import IconPlus from 'assets/icon-plus.svg';

import Button from 'basics/buttons/Button';
import CircleButton from 'basics/buttons/CircleButton';
import CopyButton from 'basics/buttons/CopyButton';
import Identicon from 'basics/Identicon';

import SocialLinks from 'components/SocialLinks';

import { cardBoxShadow, respondDown } from '../mixins';
import ChooseLoginMethodModal from '../modals/auth/ChooseLoginMethodModal';
import GetAquaModal from '../modals/GetAquaModal';
import { Breakpoints, COLORS, Z_INDEX } from '../styles';

const MenuBlock = styled.div`
    position: absolute;
    width: 100%;
    top: 100%;
    right: 0;
    min-width: 28rem;
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    cursor: auto;
    border-radius: 0 0 0.5rem 0.5rem;
    z-index: ${Z_INDEX.accountMenu};
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        position: fixed;
        top: 5.8rem;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: auto;
    `}
`;

const AccountBlock = styled.div`
    ${respondDown(Breakpoints.md)`
        margin: 2.4rem 1.6rem 0;
        background: ${COLORS.gray50};
        border-radius: 0.5rem;
        padding: 2.4rem 1.6rem;
    `}
`;

const ExternalLogo = styled(External)`
    margin-left: 0.8rem;
    path {
        fill: ${COLORS.white};
    }
`;

const CopyIcon = styled(IconCopy)`
    path {
        fill: ${COLORS.white};
    }
`;

const AccountBalanceBlock = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 2.4rem 0.8rem;
`;

const AccountBalance = styled.div`
    display: flex;
    flex-direction: column;
`;

const AccountBalanceLabel = styled.span`
    color: ${COLORS.textGray};
    margin-bottom: 0.4rem;
`;

const AccountBalanceValue = styled.span`
    color: ${COLORS.textPrimary};
    display: flex;
    align-items: center;
`;

const LogoutBlock = styled.div`
    display: flex;
    align-items: center;
    padding: 2.4rem 2.4rem 2.9rem;
    cursor: pointer;
    color: ${COLORS.textGray};
    border-top: 0.1rem dashed ${COLORS.gray100};

    &:hover {
        color: ${COLORS.textPrimary};
    }

    ${respondDown(Breakpoints.md)`
        justify-content: center;
        padding-bottom: 0;
    `}
`;

const Logout = styled.div`
    margin-left: 0.8rem;
    position: relative;
`;

const SignInButton = styled.div`
    padding: 3.2rem 1.6rem 1.6rem;
    border-top: 0.1rem dashed ${COLORS.gray100};
    display: flex;
    width: 100%;
`;

const NavLinks = styled.div`
    display: none;
    flex-direction: column;
    align-items: center;
    margin-top: 3.2rem;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}

    a {
        font-weight: bold;
        font-size: 1.6rem;
        line-height: 1.9rem;
        color: ${COLORS.textPrimary};
        text-decoration: none;
        margin-bottom: 2.4rem;
        margin-right: 0 !important;
    }
`;

const AccountInfo = styled.div`
    display: none;
    flex-direction: column;
    align-items: center;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const IconsBlock = styled.div`
    position: relative;
    height: 4.8rem;
    width: 4.8rem;
    margin-bottom: 1.6rem;
`;

const AppIcon = styled.img`
    height: 1.6rem;
    width: 1.6rem;
    border-radius: 50%;
    position: absolute;
    bottom: 0;
    right: 0;
`;

const Federation = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 0.2rem;
`;

const AccountPublic = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
`;

const AquaLogo = styled(Aqua)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.8rem;
`;

const IceLogo = styled(Ice)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.8rem;
`;

const LinkButton = styled.a`
    width: 100%;
    margin-right: 1rem;
    text-decoration: none;
`;

const AppMenu = ({
    closeMenu,
    navLinks,
}: {
    closeMenu: () => void;
    navLinks?: React.ReactNode;
}): React.ReactNode => {
    const { logout, loginType, account, isLogged, metadata, federationAddress, isLoginPending } =
        useAuthStore();
    const aquaBalance = account?.getAquaBalance();
    const ICE = createAsset(ICE_CODE, ICE_ISSUER);
    const iceBalance = account?.getAssetBalance(ICE);
    const aquaBalanceView = aquaBalance === null ? '—' : formatBalance(aquaBalance, true);
    const iceBalanceView = aquaBalance === null ? '—' : formatBalance(iceBalance, true);
    const accountId = account?.accountId();
    const accountIdView = `${accountId?.slice(0, 8)}...${accountId?.slice(-8)}`;

    const signIn = () => {
        ModalService.openModal(ChooseLoginMethodModal, {});
        closeMenu();
    };

    return (
        <MenuBlock
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
            }}
        >
            {isLogged && (
                <AccountBlock>
                    <AccountInfo>
                        <IconsBlock>
                            <Identicon pubKey={account.accountId()} />
                            {loginType === LoginTypes.walletConnect && (
                                <AppIcon src={metadata?.icons?.[0]} alt={metadata?.name} />
                            )}
                        </IconsBlock>
                        {federationAddress && <Federation>{federationAddress}</Federation>}
                        <AccountPublic>{accountIdView}</AccountPublic>
                    </AccountInfo>
                    <AccountBalanceBlock>
                        <LinkButton
                            target="_blank"
                            href={`https://stellar.expert/explorer/${
                                getIsTestnetEnv() ? 'testnet' : 'public'
                            }/account/${account.accountId()}`}
                        >
                            <Button fullWidth>
                                EXPLORER
                                <ExternalLogo />
                            </Button>
                        </LinkButton>

                        <CopyButton text={account.accountId()} withoutLogo>
                            <Button isSquare>
                                <CopyIcon />
                            </Button>
                        </CopyButton>
                    </AccountBalanceBlock>

                    <AccountBalanceBlock>
                        <AccountBalance>
                            <AccountBalanceLabel>AQUA balance:</AccountBalanceLabel>
                            <AccountBalanceValue>
                                <AquaLogo />
                                {aquaBalanceView}
                            </AccountBalanceValue>
                        </AccountBalance>
                        <CircleButton onClick={() => ModalService.openModal(GetAquaModal, {})}>
                            <IconPlus />
                        </CircleButton>
                    </AccountBalanceBlock>
                    <AccountBalanceBlock>
                        <AccountBalance>
                            <AccountBalanceLabel>ICE balance:</AccountBalanceLabel>
                            <AccountBalanceValue>
                                <IceLogo />
                                {iceBalanceView}
                            </AccountBalanceValue>
                        </AccountBalance>
                        <Link to={LockerRoutes.main}>
                            <CircleButton>
                                <IconPlus />
                            </CircleButton>
                        </Link>
                    </AccountBalanceBlock>

                    <LogoutBlock
                        onClick={() => {
                            closeMenu();
                            logout();
                            if (loginType === LoginTypes.walletConnect) {
                                AuthService.walletConnect.logout();
                            }
                        }}
                    >
                        <IconLogout />
                        <Logout>Log out</Logout>
                    </LogoutBlock>
                </AccountBlock>
            )}
            <NavLinks onClick={() => closeMenu()}>{navLinks}</NavLinks>

            <SocialLinks isHorizontal />

            {!isLogged && (
                <SignInButton>
                    <Button isBig fullWidth onClick={() => signIn()} pending={isLoginPending}>
                        sign in
                    </Button>
                </SignInButton>
            )}
        </MenuBlock>
    );
};

export default AppMenu;
