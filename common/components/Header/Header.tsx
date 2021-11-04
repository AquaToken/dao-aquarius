import * as React from 'react';
import { Link } from 'react-router-dom';
import AquaLogo from './../../assets/img/aqua-logo.svg';
import styled from 'styled-components';
import { COLORS } from '../../styles';
import Button from '../../basics/Button';
import ChooseLoginMethodModal from '../../modals/ChooseLoginMethodModal';
import useAuthStore from '../../store/authStore/useAuthStore';
import AccountBlock from './AccountBlock/AccountBlock';
import { ModalService } from '../../services/globalServices';
import { commonMaxWidth } from '../../mixins';

const HeaderBlock = styled.header`
    ${commonMaxWidth};
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 11.2rem;
    padding: 0 4rem;
`;

const NavLinksContainer = styled.div<{ isLogged: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: auto;
    margin-right: ${({ isLogged }) => (isLogged ? '0.8rem' : '3.2rem')};
`;

export const HeaderNavLink = styled(Link)`
    color: ${COLORS.titleText};
    text-decoration: none;

    &:not(:last-child) {
        margin-right: 2.4rem;
    }
`;

const Header = ({ children }: { children: JSX.Element }): JSX.Element => {
    const signIn = () => {
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    const { isLogged } = useAuthStore();

    return (
        <HeaderBlock>
            <Link to="/">
                <AquaLogo />
            </Link>

            <NavLinksContainer isLogged={isLogged}>{children}</NavLinksContainer>
            {isLogged ? <AccountBlock /> : <Button onClick={() => signIn()}>sign in</Button>}
        </HeaderBlock>
    );
};

export default Header;
