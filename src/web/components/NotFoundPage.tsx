import * as React from 'react';
import { Link, Redirect, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import LinkArrowIcon from 'assets/icons/arrows/arrow-alt2-16.svg';

import { flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

const MainBlock = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.gray50};
    ${flexAllCenter};
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
    `}
`;

const Title = styled.h2`
    font-size: 5.6rem;
    line-height: 6.4rem;
    font-weight: bold;
    color: ${COLORS.textPrimary};
    margin-bottom: 1.2rem;
`;

const Description = styled.div`
    max-width: 79.2rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textSecondary};
    margin-bottom: 1.2rem;
    opacity: 0.7;
`;

const StyledLink = styled(Link)`
    display: flex;
    flex-direction: row;
    align-items: center;
    color: ${COLORS.purple500};
    font-size: 1.6rem;
    line-height: 2.8rem;
    cursor: pointer;
    text-decoration: none;
`;

const LinkArrow = styled(LinkArrowIcon)`
    margin-left: 1rem;

    path {
        fill: ${COLORS.purple500};
    }
`;

const NotFoundPage = (): React.ReactNode => {
    const { isLogged } = useAuthStore();

    const location = useLocation();

    if (isLogged && location.pathname.startsWith('/account')) {
        return <Redirect to={MainRoutes.account} />;
    }
    return (
        <MainBlock>
            <div>
                <Title>Page not found</Title>
                <Description>This page does not exist or was recently moved.</Description>
                <StyledLink to="/">
                    Go to Home Page <LinkArrow />
                </StyledLink>
            </div>
        </MainBlock>
    );
};

export default NotFoundPage;
