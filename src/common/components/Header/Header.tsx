import * as React from 'react';
import { NavLink } from 'react-router-dom';
import AquaLogo from '../../assets/img/aqua-logo.svg';
import styled from 'styled-components';
import { Breakpoints, COLORS, Z_INDEX } from '../../styles';
import { commonMaxWidth, respondDown } from '../../mixins';
import { MainRoutes } from '../../../routes';
import AccountBlock from './AccountBlock/AccountBlock';
import useAuthStore from '../../../store/authStore/useAuthStore';
import IconProfile from '../../assets/img/icon-profile.svg';
import { ModalService } from '../../services/globalServices';
import ChooseLoginMethodModal from '../../modals/ChooseLoginMethodModal';
import Tooltip, { TOOLTIP_POSITION } from '../../basics/Tooltip';

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

const MainLink = styled(NavLink)`
    height: 4.4rem;

    ${respondDown(Breakpoints.md)`
        height: 3.4rem;
    `}
`;

const HeaderNavLinks = styled.div`
    display: flex;
    padding: 1.6rem;
    border: 0.1rem solid ${COLORS.tooltip};
    border-radius: 0.6rem;

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

    ${respondDown(Breakpoints.lg)`
        width: 4.8rem;
        div {
            display: none;
        }
        svg {
            margin-right: 0;
        }
    `}
`;

const TooltipStyled = styled(Tooltip)`
    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const Header = ({ children }: { children?: JSX.Element }): JSX.Element => {
    const { isLogged } = useAuthStore();

    const onMyAquariusClick = (e) => {
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

            <TooltipStyled content={<div>NEW</div>} position={TOOLTIP_POSITION.right} isShow>
                <HeaderNavLinks>{children}</HeaderNavLinks>
            </TooltipStyled>

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
