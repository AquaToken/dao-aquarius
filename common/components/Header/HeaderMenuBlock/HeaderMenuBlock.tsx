import * as React from 'react';
import AccountBlock from './HeaderMenuButton/HeaderMenuButton';
import useAuthStore from '../../../store/authStore/useAuthStore';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../styles';
import { respondDown } from '../../../mixins';

const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: auto;
`;

const HeaderNavLinks = styled.div<{ isLogged: boolean }>`
    margin-right: ${({ isLogged }) => (isLogged ? '0.8rem' : '3.2rem')};
    display: flex;

    a {
        color: ${COLORS.titleText};
        text-decoration: none;

        &:not(:last-child) {
            margin-right: 2.4rem;
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

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const HeaderMenuBlock = ({ navLinks }: { navLinks?: JSX.Element }) => {
    const { isLogged } = useAuthStore();

    return (
        <Container>
            <HeaderNavLinks isLogged={isLogged}>{navLinks}</HeaderNavLinks>
            <AccountBlock navLinks={navLinks} />
        </Container>
    );
};

export default HeaderMenuBlock;
