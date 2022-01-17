import * as React from 'react';
import { ModalDescription, ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import Checkbox from '../../../../common/basics/Checkbox';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import Button from '../../../../common/basics/Button';
import { useState } from 'react';
import ExternalLink from '../../../../common/basics/ExternalLink';

const Container = styled.div`
    width: 52.8rem;
`;

const LinksBlock = styled.div`
    display: flex;

    a {
        margin-right: 3.2rem;
    }
`;

const CheckboxBlock = styled.div`
    padding: 5.5rem 0 1.6rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const StyledButton = styled(Button)`
    margin-top: 3.3rem;
`;

const SnapshotPassedModal = ({ close }) => {
    const [checked, setChecked] = useState(false);

    return (
        <Container>
            <ModalTitle>Airdrop 2 snapshot is complete</ModalTitle>
            <ModalDescription>
                Airdrop #2 snapshot was taken on January 15th, 00:00 UTC. You can still lock your
                AQUA, however this will no longer affect or boost Airdrop 2.
                <br />
                <br />
                Going forward, locking AQUA will bring additional benefits, stay tuned for the
                updates!
            </ModalDescription>
            <LinksBlock>
                <ExternalLink href="https://discord.com/invite/sgzFscHp4C">
                    Discord chat
                </ExternalLink>
                <ExternalLink href="https://t.me/aquarius_HOME">Telegram chat</ExternalLink>
            </LinksBlock>
            <CheckboxBlock>
                <Checkbox
                    label="I understand that Airdrop 2 snapshot was taken and locking AQUA no longer changes the boost."
                    checked={checked}
                    onChange={setChecked}
                />
            </CheckboxBlock>
            <StyledButton fullWidth isBig onClick={() => close()} disabled={!checked}>
                Continue
            </StyledButton>
        </Container>
    );
};

export default SnapshotPassedModal;
