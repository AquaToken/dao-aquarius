import * as React from 'react';
import { LoginTypes } from '../../../../store/authStore/types';
import styled from 'styled-components';
import { Breakpoints, COLORS, Z_INDEX } from '../../../styles';
import IconLogout from '../../../assets/img/icon-logout.svg';
import IconProfile from '../../../assets/img/icon-profile.svg';
import IconPlus from '../../../assets/img/icon-plus.svg';
import Aqua from '../../../assets/img/aqua-logo-small.svg';
import Ice from '../../../assets/img/ice-logo.svg';
import IconCopy from '../../../assets/img/icon-copy.svg';
import External from '../../../assets/img/icon-external-link.svg';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import {
    ModalService,
    StellarService,
    WalletConnectService,
} from '../../../services/globalServices';
import { formatBalance } from '../../../helpers/helpers';
import { respondDown } from '../../../mixins';
import CircleButton from '../../../basics/CircleButton';
import GetAquaModal from '../../../modals/GetAquaModal/GetAquaModal';
import Button from '../../../basics/Button';
import Identicon from '../../../basics/Identicon';
import ChooseLoginMethodModal from '../../../modals/ChooseLoginMethodModal';
import { ICE_CODE, ICE_ISSUER } from '../../../services/stellar.service';
import CopyButton from '../../../basics/CopyButton';
import SocialLinks from '../../SocialLinks/SocialLinks';
import { Link } from 'react-router-dom';
import { LockerRoutes, MainRoutes } from '../../../../routes';

const MenuBlock = styled.div`
    position: absolute;
    width: 100%;
    top: 100%;
    left: 0;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
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
        background: ${COLORS.lightGray};
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
    padding: 0.8rem 2.4rem 2.4rem;
`;

const AccountBalance = styled.div`
    display: flex;
    flex-direction: column;
`;

const AccountBalanceLabel = styled.span`
    color: ${COLORS.grayText};
    margin-bottom: 0.4rem;
`;

const AccountBalanceValue = styled.span`
    color: ${COLORS.titleText};
    display: flex;
    align-items: center;
`;

const ProfileBlock = styled(Link)`
    display: none;
    align-items: center;
    padding: 2.4rem 2.4rem 1.2rem;
    cursor: pointer;
    border-top: 0.1rem dashed ${COLORS.gray};
    text-decoration: none;
    color: ${COLORS.grayText};

    &:hover {
        color: ${COLORS.titleText};
    }

    ${respondDown(Breakpoints.lg)`
        display: flex;
    `}
    ${respondDown(Breakpoints.md)`
        justify-content: center;
    `}
`;

const LogoutBlock = styled.div`
    display: flex;
    align-items: center;
    padding: 2.4rem 2.4rem 2.9rem;
    cursor: pointer;
    color: ${COLORS.grayText};
    border-top: 0.1rem dashed ${COLORS.gray};

    &:hover {
        color: ${COLORS.titleText};
    }

    ${respondDown(Breakpoints.lg)`
        border-top: unset;
        padding-top: 1.2rem;
    `}

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
    border-top: 0.1rem dashed ${COLORS.gray};
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
        color: ${COLORS.titleText};
        text-decoration: none;
        margin-bottom: 2.4rem;

        &:not(:last-child) {
            margin-right: 0;
        }
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
    color: ${COLORS.titleText};
    margin-bottom: 0.2rem;
`;

const AccountPublic = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
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
    navLinks?: JSX.Element;
}): JSX.Element => {
    const { logout, loginType, account, isLogged, metadata, federationAddress, isLoginPending } =
        useAuthStore();
    const aquaBalance = account?.getAquaBalance();
    const ICE = StellarService.createAsset(ICE_CODE, ICE_ISSUER);
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
            onClick={(e) => {
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
                            href={`https://stellar.expert/explorer/public/account/${account.accountId()}`}
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
                        <CircleButton>
                            <Link to={LockerRoutes.main}>
                                <IconPlus />
                            </Link>
                        </CircleButton>
                    </AccountBalanceBlock>

                    <ProfileBlock
                        to={MainRoutes.account}
                        onClick={() => {
                            closeMenu();
                        }}
                    >
                        <IconProfile />
                        <Logout>My Aquarius</Logout>
                    </ProfileBlock>

                    <LogoutBlock
                        onClick={() => {
                            closeMenu();
                            logout();
                            if (loginType === LoginTypes.walletConnect) {
                                WalletConnectService.logout();
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
