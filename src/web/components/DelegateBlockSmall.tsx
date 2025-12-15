import * as React from 'react';
import styled from 'styled-components';

import { AppRoutes } from 'constants/routes';

import Logo from 'assets/delegate/delegate-promo-small.svg?url';

import { ExternalLink } from 'basics/links';

import { flexColumn, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

const Container = styled.div`
    display: flex;
    background-color: ${COLORS.gray50};
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
        align-items: center;
        
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
    color: ${COLORS.textPrimary};
`;

const Description = styled.p`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textGray};
    padding: 0;
    margin: 0;
`;

const DelegateBlockSmall = () => (
    <Container>
        <img src={Logo} alt="Delegate Logo" width="118" />
        <Content>
            <Title>Delegate your ICE</Title>
            <Description>
                Delegate your ICE to trusted community members. They vote on your behalf, and 100%
                of the rewards they earn are passed back to you.
            </Description>
        </Content>
        <ExternalLink to={AppRoutes.section.delegate.link.index}>Learn more</ExternalLink>
    </Container>
);

export default DelegateBlockSmall;
