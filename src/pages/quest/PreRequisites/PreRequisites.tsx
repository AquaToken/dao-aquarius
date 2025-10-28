import * as React from 'react';
import styled from 'styled-components';

import Icon from 'assets/icons/status/success.svg';

import { Button } from 'basics/buttons';

import { cardBoxShadow } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
    border-radius: 4.4rem;
    padding: 3.6rem;
    ${cardBoxShadow};
    background-color: ${COLORS.white};

    a {
        text-decoration: none;
    }
`;

const Success = styled(Icon)`
    height: 3.2rem;
    width: 3.2rem;
    rect {
        fill: ${COLORS.gray200};
    }
`;

const Title = styled.h2`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 2.4rem;
`;

const Item = styled.div`
    display: flex;
    gap: 1.6rem;
    align-items: center;
    color: ${COLORS.textTertiary};

    svg {
        min-width: 3.2rem;
    }

    a {
        text-decoration: underline;
        color: ${COLORS.textTertiary};
    }

    &:not(:last-child) {
        margin-bottom: 2.4rem;
    }
`;

const PreRequisites = () => (
    <Container>
        <Title>Pre-requisites</Title>
        <Item>
            <Success />
            <span>
                If you're new to Stellar, start by creating a wallet. We recommend{' '}
                <a href="https://lobstr.co/" target="_blank" rel="noreferrer">
                    Lobstr
                </a>
                , but other options like{' '}
                <a href="https://www.freighter.app/" target="_blank" rel="noreferrer">
                    Freighter
                </a>
                ,{' '}
                <a href="https://solarwallet.io/" target="_blank" rel="noreferrer">
                    Solar
                </a>
                , or{' '}
                <a href="https://hot-labs.org/wallet/" target="_blank" rel="noreferrer">
                    HOT Wallet
                </a>{' '}
                are also available.
            </span>
        </Item>
        <Item>
            <Success />
            If you already have a Stellar wallet, ensure it has not previously interacted with
            Aquarius.
        </Item>
        <Item>
            <Success />
            Fund your wallet with some XLM to participate in the quest.
        </Item>
        <Item>
            <Success />
            <span>
                Join the Aquarius community on{' '}
                <a href="https://t.me/aquarius_official_community" target="_blank" rel="noreferrer">
                    Telegram
                </a>{' '}
                and{' '}
                <a href="https://discord.com/invite/sgzFscHp4C" target="_blank" rel="noreferrer">
                    Discord
                </a>{' '}
                to stay updated and connect with others.
            </span>
        </Item>

        <a href="https://discord.com/invite/sgzFscHp4C" target="_blank" rel="noreferrer">
            <Button isBig isRounded secondary withGradient fullWidth>
                Contact support
            </Button>
        </a>
    </Container>
);

export default PreRequisites;
