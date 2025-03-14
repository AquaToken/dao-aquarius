import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ModalProps } from 'types/modal';

import Button from 'basics/buttons/Button';
import Checkbox from 'basics/inputs/Checkbox';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

import { respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';

const Container = styled.div`
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const CheckboxBlock = styled.div`
    padding: 1.5rem 0 1.6rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const StyledButton = styled(Button)`
    margin-top: 3.3rem;
`;

export const SHOW_PURPOSE_ALIAS = 'show purpose';

const VotingPurposeModal = ({ close }: ModalProps<never>) => {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (checked) {
            localStorage.setItem(SHOW_PURPOSE_ALIAS, 'false');
        } else {
            localStorage.setItem(SHOW_PURPOSE_ALIAS, 'true');
        }
    }, [checked]);

    return (
        <Container>
            <ModalTitle>Liquidity voting with AQUA & ICE</ModalTitle>
            <ModalDescription>
                You can use AQUA or ICE tokens to vote for your favorite markets on Stellar, helping
                improve their liquidity. These votes define the size of the Aquarius liquidity
                rewards paid to AMM liquidity providers and SDEX traders. Choose the markets that
                are important to you, and support them through the on-chain voting.
            </ModalDescription>
            <CheckboxBlock>
                <Checkbox label="Don’t show again" checked={checked} onChange={setChecked} />
            </CheckboxBlock>

            <StyledButton fullWidth onClick={() => close()}>
                Let’s start
            </StyledButton>
        </Container>
    );
};

export default VotingPurposeModal;
