import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';

import { respondDown } from '../../mixins';
import { LedgerService } from '../../services/globalServices';
import { Breakpoints } from '../../styles';
import { ModalDescription, ModalTitle } from '../atoms/ModalAtoms';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Prefix = styled.div`
    font-size: 1.6rem;
`;

const StyledButton = styled(Button)`
    margin-top: 3.1rem;
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
            width: 100%;
        `}
`;

const LedgerLogin = ({ close }) => {
    const [path, setPath] = useState('');
    const [pending, setPending] = useState(false);
    const onSubmit = () => {
        setPending(true);
        LedgerService.login(Number(path))
            .then(() => {
                setPending(false);
                close();
            })
            .catch(() => {
                setPending(false);
            });
    };

    return (
        <Container>
            <ModalTitle>Log in with Ledger</ModalTitle>
            <ModalDescription>
                Make sure your Ledger Wallet is connected with the Stellar application open on it.
                <br />
                Enter the Ledger account number you want to log in to. Or use the default account
                44'/148'/0'.
            </ModalDescription>

            <form
                onSubmit={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    onSubmit();
                }}
            >
                <Input
                    value={path}
                    onChange={e => setPath(e.target.value)}
                    prefixCustom={<Prefix>Path: 44'/148'/</Prefix>}
                    style={{ padding: '0rem 12.8rem' }}
                    placeholder="0"
                    type="number"
                    min="0"
                    max="2147483647"
                    onInvalid={e =>
                        (e.target as HTMLInputElement).setCustomValidity(
                            'Only integer less or equal 2147483647',
                        )
                    }
                    onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
                />

                <StyledButton isBig type="submit" pending={pending}>
                    connect
                </StyledButton>
            </form>
        </Container>
    );
};

export default LedgerLogin;
