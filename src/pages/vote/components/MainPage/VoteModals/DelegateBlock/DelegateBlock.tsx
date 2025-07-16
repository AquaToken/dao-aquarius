import * as React from 'react';
import styled from 'styled-components';

import { flexColumn } from 'web/mixins';
import { COLORS } from 'web/styles';

import Logo from 'assets/delegate-promo-small.svg';

import ExternalLink from 'basics/ExternalLink';

const Container = styled.div`
    width: 100%;
    border-radius: 0.5rem;
    background-color: ${COLORS.lightGray};
    padding: 2.4rem;
    gap: 2.4rem;
    display: flex;
    margin-top: 3.2rem;

    & > svg {
        min-width: 12rem;
    }
`;

const Content = styled.div`
    ${flexColumn};
    gap: 0.8rem;

    p {
        color: ${COLORS.grayText};
        margin: 0;
        font-weight: 400;
        font-size: 1.6rem;
        line-height: 180%;
    }
`;

const DelegateBlock = () => (
    <Container>
        <Content>
            <p>
                ICE tokens can be delegated to a trusted community members so they vote for markets
                on your behalf
            </p>
            <ExternalLink>Learn more</ExternalLink>
        </Content>
        <Logo />
    </Container>
);

export default DelegateBlock;
