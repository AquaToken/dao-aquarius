import * as React from 'react';
import styled from 'styled-components';

import Button from '../../../../common/basics/Button';
import ExternalLink from '../../../../common/basics/ExternalLink';
import { respondDown } from '../../../../common/mixins';
import { ModalDescription, ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import { Breakpoints } from '../../../../common/styles';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Links = styled.div`
    display: flex;
    margin-bottom: 6.4rem;

    a:first-child {
        margin-right: 3.8rem;
    }
`;

const TemporarilyNotWork = ({ close }) => {
    return (
        <Container>
            <ModalTitle>Maintenance in progress</ModalTitle>
            <ModalDescription>
                Proposal creation is temporarily disabled as we preparing to roll out a set of
                upgrades to the governance process. Please return shortly. In the meantime, we
                recommend sharing your ideas on our Discord to get the feedback from the community.
            </ModalDescription>
            <Links>
                <ExternalLink href="https://discord.com/invite/sgzFscHp4C">
                    Discord chat
                </ExternalLink>
                <ExternalLink href="https://t.me/aquarius_official_community">
                    Telegram chat
                </ExternalLink>
            </Links>
            <Button onClick={() => close()}>ok</Button>
        </Container>
    );
};

export default TemporarilyNotWork;
