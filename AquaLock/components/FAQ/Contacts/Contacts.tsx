import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import ExternalLink from '../../../../common/basics/ExternalLink';
import { respondDown } from '../../../../common/mixins';

const Container = styled.div`
    max-width: 36.6rem;
    display: flex;
    flex-direction: column;
    margin-right: 6rem;

    ${respondDown(Breakpoints.md)`
        max-width: unset;
        margin-right: 0;
    `}
`;

const Title = styled.span`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.titleText};
`;

const Description = styled.p`
    font-size: 1.8rem;
    line-height: 180%;
    color: ${COLORS.darkGrayText};
`;

const Links = styled.div`
    display: flex;

    a:first-child {
        margin-right: 3.8rem;
    }
`;

const Contacts = () => {
    return (
        <Container>
            <Title>Questions?</Title>
            <Description>
                We have tried to answer the most common questions. If you need to find out more
                information, please join our community chats.
            </Description>
            <Links>
                <ExternalLink href="https://discord.com/invite/sgzFscHp4C">
                    Discord chat
                </ExternalLink>
                <ExternalLink href="https://t.me/aquarius_HOME">Telegram chat</ExternalLink>
            </Links>
        </Container>
    );
};

export default Contacts;
