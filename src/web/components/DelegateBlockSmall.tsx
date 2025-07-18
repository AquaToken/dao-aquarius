import * as React from 'react';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import Logo from 'assets/delegate-promo-small.svg';

import ExternalLink from 'basics/ExternalLink';

import { flexColumn, respondDown } from '../mixins';
import { Breakpoints, COLORS } from '../styles';

const Container = styled.div`
    display: flex;
    background-color: ${COLORS.lightGray};
    padding: 2.4rem;
    border-radius: 0.5rem;
    margin-top: 4.2rem;
    gap: 2.4rem;

    & > svg {
        min-width: 12rem;
    }

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        background-color: ${COLORS.white};
        margin-top: 1.6rem;
        
        & > svg {
            margin: 0 auto;
        }
    `}
`;

const Content = styled.div`
    ${flexColumn};
    gap: 1.7rem;
    justify-content: center;
    margin-right: auto;
`;

const Title = styled.h5`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;

const Description = styled.p`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.grayText};
    padding: 0;
    margin: 0;
`;

const DelegateBlockSmall = () => (
    <Container>
        <Logo />
        <Content>
            <Title>Delegate your ICE</Title>
            <Description>
                Delegate your ICE to trusted community members. They vote on your behalf, and 100%
                of the rewards they earn are passed back to you.
            </Description>
        </Content>
        <ExternalLink to={MainRoutes.delegate}>Learn more</ExternalLink>
    </Container>
);

export default DelegateBlockSmall;
