import * as React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, Z_INDEX } from 'web/styles';

import AquaLogo from 'assets/aqua-logo.svg';
import IconProfile from 'assets/icon-profile.svg';

import AccountBlock from './AccountBlock/AccountBlock';

import { MainRoutes } from '../../../routes';
import ChooseLoginMethodModal from '../../modals/ChooseLoginMethodModal';
import { ModalService } from '../../services/globalServices';

const HeaderBlock = styled.header`
    ${commonMaxWidth};
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 11.2rem;
    padding: 0 4rem;
    z-index: ${Z_INDEX.header};
    background: ${COLORS.white};

    ${respondDown(Breakpoints.md)`
        height: 5.8rem;
        padding: 0 1.6rem;
        z-index: ${Z_INDEX.accountMenu}
    `}
`;

const Aqua = styled(AquaLogo)`
    height: 4.4rem;

    ${respondDown(Breakpoints.md)`
        height: 3.4rem;
    `}
`;

export const HeaderNewNavLinks = styled.div`
    display: flex;
    border: 0.1rem solid ${COLORS.transparent};
    padding: 0.8rem 1.6rem;
    border-radius: 2.1rem;
    background: linear-gradient(to top, white, white),
        linear-gradient(to top, ${COLORS.purple} 0%, ${COLORS.white} 50%);
    background-clip: padding-box, border-box;
    background-origin: padding-box, border-box;
    position: relative;

    a:last-child {
        margin-bottom: 0;
    }

    &::after {
        content: 'New';
        position: absolute;
        top: calc(100% - 1rem);
        left: 50%;
        transform: translate(-50%);
        color: ${COLORS.white};
        background-color: ${COLORS.purple};
        font-weight: 700;
        padding: 0.3rem 0.8rem;
        border-radius: 3.3rem;
    }

    ${respondDown(Breakpoints.md)`
        padding: 0.5rem 4rem;
        border-radius: 1rem;
        flex-direction: column;
        background: linear-gradient(to left, white, white), linear-gradient(to left, ${COLORS.purple} 0, ${COLORS.white} 10%);
        background-clip: padding-box, border-box;
        background-origin: padding-box, border-box;
        
         &::after {
            top: 50%;
            left: calc(100%);
            transform: translate(-50%, -50%);
        }
    `}
`;

export const HeaderNavLink = styled(NavLink)`
    color: ${COLORS.titleText};
    text-decoration: none;
    font-size: 1.6rem;
    line-height: 2.4rem;

    &:not(:last-child) {
        margin-right: 2.4rem;
    }
    &:hover {
        color: ${COLORS.purple};
    }

    ${respondDown(Breakpoints.lg)`
        font-size: 1.4rem;
        line-height: 2rem;
    `}
`;

export const HeaderNavLinkWithCount = styled(HeaderNavLink)<{ count: number }>`
    ${({ count }) =>
        Boolean(count) &&
        `
            position: relative;
            
            &::before {
                content: attr(count);
                position: absolute;
                left: 100%;
                bottom: 1.2rem;
                text-transform: uppercase;
                height: 1.5rem;
                padding: 0 0.5rem;
                border-radius: 0.4rem;
                background: ${COLORS.purple};
                color: ${COLORS.white};
                font-weight: 700;
                font-size: 0.8rem;
                line-height: 1.6rem;
                white-space: nowrap;
            }
    `}
`;

export const NavLinksDivider = styled.div`
    height: 2.4rem;
    width: 0;
    border-left: 0.1rem solid ${COLORS.gray};
    margin: 0 4rem;

    ${respondDown(Breakpoints.xl)`
        margin-right: 2.2rem;
    `}

    ${respondDown(Breakpoints.lg)`
        margin-right: 2rem;
        height: 2rem;
    `}

    ${respondDown(Breakpoints.md)`
         border-left: none;
         margin-right: 0;
         height: 0;
         width: 20rem;
         margin: 2.4rem 0;
         border-top: 0.1rem solid ${COLORS.gray};
    `}
`;

const MainLink = styled(NavLink)`
    height: 4.4rem;

    ${respondDown(Breakpoints.md)`
        height: 3.4rem;
    `}
`;

const HeaderNavLinks = styled.div`
    display: flex;
    padding: 1.6rem;
    align-items: center;

    a {
        color: ${COLORS.titleText};
        text-decoration: none;

        &:not(:last-child) {
            margin-right: 4rem;
        }

        &:hover {
            color: ${COLORS.purple};
        }

        &::after {
            content: attr(title);
            visibility: hidden;
            overflow: hidden;
            user-select: none;
            pointer-events: none;
            font-weight: 700;
            height: 0;
            display: block;
        }
    }

    ${respondDown(Breakpoints.xl)`
        a {
            &:not(:last-child) {
                margin-right: 2.2rem;
            }
        }
    `}

    ${respondDown(Breakpoints.lg)`
        a {
            &:not(:last-child) {
                margin-right: 2rem;
            }
        }
    `}

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const RightBlock = styled.div`
    display: flex;
    align-items: center;
`;

const MyAquarius = styled(NavLink)`
    display: flex;
    align-items: center;
    padding: 0 1.6rem;
    height: 4.8rem;
    background-color: ${COLORS.lightGray};
    border-radius: 0.6rem;
    cursor: pointer;
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.titleText};
    text-decoration: none;

    div::after {
        content: attr(title);
        visibility: hidden;
        overflow: hidden;
        user-select: none;
        pointer-events: none;
        font-weight: 700;
        height: 0;
        display: block;
    }

    svg {
        margin-right: 0.8rem;
    }

    &:hover {
        color: ${COLORS.purple};
    }

    ${respondDown(Breakpoints.xl)`
        width: 4.8rem;
        div {
            display: none;
        }
        svg {
            margin-right: 0;
        }
    `}
`;

const Header = ({ children }: { children?: JSX.Element }): JSX.Element => {
    const { isLogged } = useAuthStore();

    const onMyAquariusClick = e => {
        if (!isLogged) {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            return ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: MainRoutes.account,
            });
        }
    };

    return (
        <HeaderBlock>
            <MainLink to={MainRoutes.main}>
                <Aqua />
            </MainLink>

            <HeaderNavLinks>{children}</HeaderNavLinks>

            <RightBlock>
                <MyAquarius
                    onClick={onMyAquariusClick}
                    to={MainRoutes.account}
                    activeStyle={{ fontWeight: 700 }}
                >
                    <IconProfile />
                    <div title="My Aquarius">My Aquarius</div>
                </MyAquarius>
                <AccountBlock navLinks={children} />
            </RightBlock>
        </HeaderBlock>
    );
};

export default Header;
