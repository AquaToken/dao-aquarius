import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { getChallenge, sendSignedChallenge } from 'api/quest';

import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, ToastService } from 'services/globalServices';

import { cardBoxShadow, flexAllCenter } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { COLORS } from 'web/styles';

import Success from 'assets/icon-success-gradient.svg';

import { Button } from 'basics/buttons';

const Container = styled.div`
    ${flexAllCenter};
    ${cardBoxShadow};
    border-radius: 4.4rem;
    padding: 3.6rem;
    background-color: ${COLORS.white};
    z-index: 100;
`;

const Content = styled.div`
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 1.6rem;
    line-height: 100%;
    letter-spacing: 0.2em;
    color: ${COLORS.paragraphText};
    gap: 1.6rem;
    text-transform: uppercase;
    background-color: ${COLORS.white};
`;

interface Props {
    isStarted: boolean;
}

const StartQuest = ({ isStarted }: Props) => {
    const [pending, setPending] = useState(false);
    const { isLogged, account } = useAuthStore();

    const start = async () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);

        try {
            const tx = await getChallenge(account.accountId());

            const signed = await account.signTx(tx);

            await sendSignedChallenge(signed);

            ToastService.showSuccessToast('You have successfully registered for the quest!');

            setPending(false);
        } catch (e) {
            setPending(false);
            ToastService.showErrorToast(e.message);
        }
    };
    return (
        <Container>
            {isStarted ? (
                <Content>
                    <Success />
                    You are in quest
                </Content>
            ) : (
                <Button
                    isBig
                    fullWidth
                    withGradient
                    isRounded
                    pending={pending}
                    onClick={() => start()}
                >
                    Start QUEST
                </Button>
            )}
        </Container>
    );
};

export default StartQuest;
