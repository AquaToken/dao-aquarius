import * as React from 'react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { AmmRoutes, MainRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { commonMaxWidth, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS, Z_INDEX } from 'web/styles';

import AquaLogo from 'assets/aqua/aqua-logo-text.svg';
import IconProfile from 'assets/icon-profile.svg';

import { ActiveProposals } from 'components/Header/ActiveProposals/ActiveProposals';
import ExpandedMenu from 'components/Header/ExpandedMenu/ExpandedMenu';

import { getActiveProposalsCount } from 'pages/governance/api/api';

import AccountBlock from '../AccountBlock';

const Container = styled.header`
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

export const linkStyles = css`
    text-decoration: none;
    font-size: 1.6rem;
    line-height: 2.4rem;
    white-space: nowrap;

    &:hover {
        color: ${COLORS.purple}!important;
    }
`;

const NavLinkStyled = styled(NavLink)<{ $disabled?: boolean }>`
    color: ${({ $disabled }) => ($disabled ? COLORS.grayText : COLORS.titleText)}!important;
    font-weight: ${({ $disabled }) => ($disabled ? '400!important' : 'unset')};
    ${linkStyles};

    &:not(:last-child) {
        margin-right: 2.4rem;
    }

    ${respondDown(Breakpoints.lg)`
        margin-right: 1rem;
    `}
`;

const NavLinkWithCount = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.2rem;

    a {
        margin: 0 !important;
    }

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2.4rem;
    `}
`;

const Divider = styled.div`
    height: 2.4rem;
    width: 0;
    border-left: 0.1rem solid ${COLORS.gray};
    margin: 0 2.4rem;

    ${respondDown(Breakpoints.lg)`
        margin-right: 1rem;
        height: 2rem;
    `} ${respondDown(Breakpoints.md)`
         border-left: none;
         margin-right: 0;
         height: 0;
         width: 20rem;
         margin: 2.4rem 0;
         border-top: 0.1rem solid ${COLORS.gray};
    `};
`;

const MainLink = styled(NavLink)`
    height: 4.4rem;

    ${respondDown(Breakpoints.md)`
        height: 3.4rem;
    `}
`;

const NavLinks = styled.div`
    display: flex;
    padding: 1.6rem;
    align-items: center;

    a {
        color: ${COLORS.titleText};
        text-decoration: none;

        &:hover {
            color: ${COLORS.purple};
        }

        &::before {
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
        height: 1.6rem;
        width: 1.6rem;
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

const Links = () => {
    const [proposalsCounts, setProposalsCounts] = useState({ active: 0, discussion: 0 });

    useEffect(() => {
        getActiveProposalsCount().then(res => {
            setProposalsCounts(res);
        });
    }, []);
    return (
        <>
            <NavLinkStyled
                to={AmmRoutes.analytics}
                activeStyle={{
                    fontWeight: 700,
                }}
                title="Pools"
            >
                Pools
            </NavLinkStyled>
            <NavLinkStyled
                to={MainRoutes.swap}
                activeStyle={{
                    fontWeight: 700,
                }}
                title="Swap"
            >
                Swap
            </NavLinkStyled>

            <Divider />

            <ExpandedMenu
                title="Voting & DAO"
                counts={proposalsCounts}
                links={
                    <>
                        <NavLinkStyled
                            to={MainRoutes.vote}
                            exact
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="Liquidity Voting"
                        >
                            Liquidity Voting
                        </NavLinkStyled>
                        <NavLinkStyled
                            to={MainRoutes.rewards}
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="LP Rewards"
                        >
                            LP Rewards
                        </NavLinkStyled>
                        <NavLinkStyled
                            to={MainRoutes.bribes}
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="Bribes for Voters"
                        >
                            Bribes for Voters
                        </NavLinkStyled>
                        <NavLinkWithCount>
                            <NavLinkStyled
                                to={MainRoutes.governance}
                                activeStyle={{
                                    fontWeight: 700,
                                }}
                                title="DAO Proposals"
                            >
                                DAO Proposals
                            </NavLinkStyled>
                            <ActiveProposals
                                discussionCount={proposalsCounts.discussion}
                                activeCount={proposalsCounts.active}
                            />
                        </NavLinkWithCount>
                        <NavLinkStyled
                            to={MainRoutes.delegate}
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="ICE delegation"
                        >
                            ICE Delegation
                        </NavLinkStyled>
                    </>
                }
            />

            <ExpandedMenu
                title="AQUA token"
                links={
                    <>
                        <NavLinkStyled
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="Token Info"
                            to={MainRoutes.token}
                        >
                            Token Info
                        </NavLinkStyled>

                        <NavLinkStyled
                            to={MainRoutes.locker}
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="Lock AQUA"
                        >
                            Lock AQUA
                        </NavLinkStyled>
                    </>
                }
            />
        </>
    );
};

const Header = (): React.ReactNode => {
    const { isLogged } = useAuthStore();

    const onMyAquariusClick = (e: React.MouseEvent) => {
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
        <Container>
            <MainLink to={MainRoutes.main}>
                <Aqua />
            </MainLink>

            <NavLinks>
                <Links />
            </NavLinks>

            <RightBlock>
                <MyAquarius onClick={onMyAquariusClick} to={MainRoutes.account}>
                    <IconProfile />
                    <div>My Aquarius</div>
                </MyAquarius>
                <AccountBlock navLinks={<Links />} />
            </RightBlock>
        </Container>
    );
};

export default Header;
