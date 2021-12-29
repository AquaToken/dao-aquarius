import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import ExternalLink from '../../../../common/basics/ExternalLink';

const Container = styled.div`
    max-width: 36.6rem;
    display: flex;
    flex-direction: column;
    margin-right: 6rem;
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
                We have tried to answer the most common and popular questions. If you still do not
                understand something, please contact our community chats.
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
