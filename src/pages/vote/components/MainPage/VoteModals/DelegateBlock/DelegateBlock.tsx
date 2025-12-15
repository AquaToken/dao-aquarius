import * as React from 'react';
import styled from 'styled-components';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Logo from 'assets/delegate/delegate-promo-small.svg?url';

import { ExternalLink } from 'basics/links';

import { flexColumn } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const Container = styled.div`
    width: 100%;
    border-radius: 0.5rem;
    background-color: ${COLORS.gray50};
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
        color: ${COLORS.textGray};
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
                Delegate your ICE to trusted community members. They vote on your behalf, and 100%
                of the rewards they earn are passed back to you.
            </p>
            <ExternalLink>Learn more</ExternalLink>
        </Content>
        <img src={Logo} alt="Delegate block logo" />
    </Container>
);

export default DelegateBlock;
