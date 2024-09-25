import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import Alert from 'basics/Alert';
import Button from 'basics/buttons/Button';
import Checkbox from 'basics/inputs/Checkbox';

import { ModalTitle } from './atoms/ModalAtoms';

import { respondDown } from '../mixins';
import { Breakpoints, COLORS } from '../styles';

const Container = styled.div`
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        padding-top: 4rem;
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

const MainNetWarningModal = ({ confirm }) => {
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
            <ModalTitle>Warning: experimental functionality</ModalTitle>
            <Alert
                text={
                    <p>
                        Please be informed that you can lose all your deposited funds.
                        <br />
                        <br />
                        The protocol team has done its best to ensure the safety of the funds and is
                        already working on the Soroban smart contract audits. The last audit took
                        place in March 2024 addressing only basic functionality that was
                        significantly improved since then.
                        <br />
                        <br />
                        Clicking "I understand" you waive any claim to the protocol and the Aquarius
                        team related to possible loss.
                    </p>
                }
            />

            <CheckboxBlock>
                <Checkbox label="Don’t show again" checked={checked} onChange={setChecked} />
            </CheckboxBlock>

            <StyledButton fullWidth onClick={() => confirm()}>
                I understand
            </StyledButton>
        </Container>
    );
};

export default MainNetWarningModal;
