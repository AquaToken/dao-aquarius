import * as React from 'react';
import styled from 'styled-components';

import { cardBoxShadow } from 'web/mixins';
import { COLORS } from 'web/styles';

import Icon from 'assets/icon-succes-gray.svg';

import { Button } from 'basics/buttons';

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

const Title = styled.h2`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-bottom: 2.4rem;
`;

const Item = styled.div`
    display: flex;
    gap: 1.6rem;
    align-items: center;
    color: ${COLORS.paragraphText};

    svg {
        min-width: 3.2rem;
    }

    a {
        text-decoration: underline;
        color: ${COLORS.paragraphText};
    }

    &:not(:last-child) {
        margin-bottom: 2.4rem;
    }
`;

const PreRequisites = () => (
    <Container>
        <Title>Pre-requisites</Title>
        <Item>
            <Icon />
            <span>
                Create a wallet if you are new to Stellar. We recommend{' '}
                <a href="https://lobstr.co/" target="_blank" rel="noreferrer">
                    Lobstr
                </a>
                , but there are also{' '}
                <a href="https://www.freighter.app/" target="_blank" rel="noreferrer">
                    Freighter
                </a>
                ,{' '}
                <a href="https://hot-labs.org/wallet/" target="_blank" rel="noreferrer">
                    HOT wallet
                </a>{' '}
                and many others.
            </span>
        </Item>
        <Item>
            <Icon />
            If you are already familiar with Stellar, make sure your wallet didn’t transact with
            Aquarius
        </Item>
        <Item>
            <Icon />
            Fund your wallet with some XLM to participate in the quest.
        </Item>
        <Item>
            <Icon />
            <span>
                Join Aquarius social media:{' '}
                <a href="https://t.me/aquarius_official_community" target="_blank" rel="noreferrer">
                    Telegram
                </a>{' '}
                and{' '}
                <a href="https://discord.com/invite/sgzFscHp4C" target="_blank" rel="noreferrer">
                    Discord
                </a>
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
