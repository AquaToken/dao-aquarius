import * as React from 'react';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Breakpoints, COLORS } from '../styles';
import { respondDown } from '../mixins';
import Button from '../basics/Button';
import { ModalDescription, ModalTitle } from './atoms/ModalAtoms';
import Checkbox from '../basics/Checkbox';

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

export const SHOW_PURPOSE_ALIAS_TESTNET = 'show purpose testnet';

const TestnetPurposeModal = ({ close }) => {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (checked) {
            localStorage.setItem(SHOW_PURPOSE_ALIAS_TESTNET, 'false');
        } else {
            localStorage.setItem(SHOW_PURPOSE_ALIAS_TESTNET, 'true');
        }
    }, [checked]);

    return (
        <Container>
            <ModalTitle>Aquarius AMM</ModalTitle>
            <ModalDescription>
                You are looking at preview version of new Aquarius AMM that were built with Soroban
                smart contracts. This version uses testnet, please use the wallet that allows you to
                connect to testnet Stellar network. Testnet tokens do not have any value. You can
                receive tokens for testing on the Balances page.
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

export default TestnetPurposeModal;
