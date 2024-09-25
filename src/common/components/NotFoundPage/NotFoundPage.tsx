import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../styles';
import { flexAllCenter, respondDown } from '../../mixins';
import LinkArrowIcon from 'assets/icon-link-arrow.svg';
import { Link } from 'react-router-dom';

const MainBlock = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.lightGray};
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
    color: ${COLORS.titleText};
    margin-bottom: 1.2rem;
`;

const Description = styled.div`
    max-width: 79.2rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    margin-bottom: 1.2rem;
    opacity: 0.7;
`;

const StyledLink = styled(Link)`
    display: flex;
    flex-direction: row;
    align-items: center;
    color: ${COLORS.purple};
    font-size: 1.6rem;
    line-height: 2.8rem;
    cursor: pointer;
    text-decoration: none;
`;

const LinkArrow = styled(LinkArrowIcon)`
    margin-left: 1rem;
`;

const NotFoundPage = (): JSX.Element => {
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
