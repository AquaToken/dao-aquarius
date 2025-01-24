import * as React from 'react';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { LS_FREIGHTER_ACCOUNT_CHANGE_IMMEDIATELY } from 'constants/local-storage';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { FreighterService } from 'services/globalServices';

import { ModalProps } from 'types/modal';

import Arrow from 'assets/icon-arrow-right-long.svg';

import AccountBlock from 'basics/AccountBlock';
import { Button } from 'basics/buttons';
import { Checkbox } from 'basics/inputs';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { respondDown } from '../mixins';
import { Breakpoints } from '../styles';

interface Props {
    publicKey: string;
}

const Accounts = styled.div`
    display: flex;
    gap: 2.4rem;
    align-items: center;
    margin: 2.4rem 0;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const Buttons = styled.div`
    display: flex;
    gap: 2.4rem;
    margin-top: 3.2rem;
`;

const ArrowStyled = styled(Arrow)`
    ${respondDown(Breakpoints.md)`
        transform: rotate(90deg);
    `}
`;

const FreighterAccountChangedModal = ({ params, close }: ModalProps<Props>) => {
    const [saveChoice, setSaveChoice] = useState(false);
    const { publicKey } = params;

    const location = useLocation();

    const { account, logout, login, enableRedirect } = useAuthStore();

    const selectNo = () => {
        if (saveChoice) {
            localStorage.setItem(LS_FREIGHTER_ACCOUNT_CHANGE_IMMEDIATELY, JSON.stringify(false));
        }
        close();
    };

    const selectYes = () => {
        if (saveChoice) {
            localStorage.setItem(LS_FREIGHTER_ACCOUNT_CHANGE_IMMEDIATELY, JSON.stringify(true));
        }
        close();
        const path = `${location.pathname}${location.search}`;

        flushSync(() => {
            logout();
        });

        enableRedirect(path);
        login(publicKey, LoginTypes.freighter);
        FreighterService.startWatching(publicKey);
    };

    return (
        <ModalWrapper>
            <ModalTitle>Account changed</ModalTitle>
            <ModalDescription>
                Account was switched in the Freighter extension. Do you want to change the address
                connected to Aquarius?
            </ModalDescription>

            <Accounts>
                {account && <AccountBlock accountId={account.accountId()} />}
                <ArrowStyled />
                <AccountBlock accountId={publicKey} />
            </Accounts>

            <Checkbox checked={saveChoice} onChange={setSaveChoice} label="Remember my choice" />
            <Buttons>
                <Button fullWidth onClick={() => selectYes()}>
                    Yes
                </Button>
                <Button fullWidth onClick={() => selectNo()}>
                    No
                </Button>
            </Buttons>
        </ModalWrapper>
    );
};

export default FreighterAccountChangedModal;
