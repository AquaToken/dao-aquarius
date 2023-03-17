import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../../mixins';
import { Breakpoints } from '../../styles';
import { ModalDescription, ModalTitle } from '../atoms/ModalAtoms';
import Button from '../../basics/Button';
import { IconFail } from '../../basics/Icons';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Title = styled(ModalTitle)`
    margin-top: 2.4rem;
`;

const StyledButton = styled(Button)`
    margin-top: 3.1rem;
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
            width: 100%;
        `}
`;

const LedgerError = ({ close }) => {
    return (
        <Container>
            <IconFail />
            <Title>Ledger app is unavailable</Title>
            <ModalDescription>
                Could not access your Ledger account. Ensure your Ledger is not locked after the
                idle timeout, the Stellar app is opened, and the firmware version is updated. If it
                still does not work, make sure that your Ledger device is not used on another site.
            </ModalDescription>
            <StyledButton onClick={() => close()}>Close</StyledButton>
        </Container>
    );
};

export default LedgerError;
