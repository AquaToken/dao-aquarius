import * as React from 'react';
import { Link } from 'react-router-dom';
import AquaLogo from './../../assets/img/aqua-logo.svg';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../styles';
import { commonMaxWidth, respondDown } from '../../mixins';
import Menu from './HeaderMenuBlock/HeaderMenuBlock';

const HeaderBlock = styled.header`
    ${commonMaxWidth};
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 11.2rem;
    padding: 0 4rem;

    ${respondDown(Breakpoints.md)`
        height: 5.8rem;
        padding: 0 1.6rem;
    `}
`;

const Aqua = styled(AquaLogo)`
    height: 4.4rem;

    ${respondDown(Breakpoints.md)`
    height: 3.4rem;
  `}
`;

export const HeaderNavLink = styled(Link)`
    color: ${COLORS.titleText};
    text-decoration: none;

    &:not(:last-child) {
        margin-right: 2.4rem;
    }
`;

const Header = ({ children }: { children?: JSX.Element }): JSX.Element => {
    return (
        <HeaderBlock>
            <a href="https://aqua.network" target="_blank" rel="noreferrer noopener">
                <Aqua />
            </a>

            <Menu navLinks={children} />
        </HeaderBlock>
    );
};

export default Header;
