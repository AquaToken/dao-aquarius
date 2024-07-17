import * as React from 'react';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Breakpoints, COLORS } from '../styles';
import { respondDown } from '../mixins';
import Button from '../basics/Button';
import { ModalDescription, ModalTitle } from './atoms/ModalAtoms';
import Checkbox from '../basics/Checkbox';
import Alert from '../basics/Alert';

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

export const SHOW_PURPOSE_ALIAS_MAIN_NET = 'show purpose main net';

const MainNetPurposeModal = ({ close }) => {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (checked) {
            localStorage.setItem(SHOW_PURPOSE_ALIAS_MAIN_NET, 'false');
        } else {
            localStorage.setItem(SHOW_PURPOSE_ALIAS_MAIN_NET, 'true');
        }
    }, [checked]);

    return (
        <Container>
            <ModalTitle>Aquarius AMM</ModalTitle>
            <ModalDescription>
                <p></p>
            </ModalDescription>

            <Alert
                title="Warning: experimental functionality"
                text="You are about to start using new functionality written on Soroban with real money on Pubnet. Although the Aquarius team has done its best to address risks the funds are still at risk as the contract audit is still in progress. Use at your own risk."
            />

            <CheckboxBlock>
                <Checkbox label="Don’t show again" checked={checked} onChange={setChecked} />
            </CheckboxBlock>

            <StyledButton fullWidth onClick={() => close()}>
                I understand
            </StyledButton>
        </Container>
    );
};

export default MainNetPurposeModal;
