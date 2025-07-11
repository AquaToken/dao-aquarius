import * as React from 'react';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { flexColumn, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Logo from 'assets/delegate-promo-small.svg';

import ExternalLink from 'basics/ExternalLink';

const Container = styled.div`
    margin-top: 4rem;
    display: flex;
    background-color: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 3.2rem 3.2rem 4.2rem;
    gap: 2.4rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
        flex-direction: column;
        
        & > svg {
            margin: 0 auto;
        }
    `}

    svg {
        min-width: 12rem;
    }
`;

const Content = styled.div`
    ${flexColumn};
    gap: 1.7rem;
`;

const Title = styled.span`
    font-size: 2rem;
    line-height: 2.8rem;
    font-weight: bold;
    color: ${COLORS.titleText};
`;

const Description = styled.p`
    padding: 0;
    margin: 0;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.grayText};
`;

const DelegateBlock = () => (
    <Container>
        <Logo />
        <Content>
            <Title>Delegate your ICE</Title>
            <Description>
                ICE tokens can be delegated to a trusted community members so they vote for markets
                on your behalf
            </Description>
            <ExternalLink to={MainRoutes.delegate}>Learn more</ExternalLink>
        </Content>
    </Container>
);

export default DelegateBlock;
