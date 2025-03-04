import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService, ToastService } from 'services/globalServices';
import { D_ICE_CODE, DELEGATE_MARKER_KEY, ICE_ISSUER, UP_ICE_CODE } from 'services/stellar.service';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { cardBoxShadow, commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import { Button } from 'basics/buttons';
import { Input } from 'basics/inputs';
import PublicKeyWithIcon from 'basics/PublicKeyWithIcon';
import Table, { CellAlign } from 'basics/Table';

import NoTrustline from 'components/NoTrustline';

import { Balance } from 'pages/swap/components/SwapForm/SwapFormRow/SwapFormRow';

import ChooseLoginMethodModal from '../../web/modals/auth/ChooseLoginMethodModal';

const MainBlock = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.lightGray};
`;

const MainSection = styled.div`
    ${commonMaxWidth};
    width: 100%;
`;

const Title = styled.h2`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    font-weight: 400;

    ${respondDown(Breakpoints.md)`
        font-size: 2rem;
   `}
`;

const Form = styled.form`
    margin: 5rem auto;
    padding: 4.8rem;
    display: flex;
    flex-direction: column;
    ${cardBoxShadow};
    border-radius: 0.5rem;
    background-color: ${COLORS.white};
    width: 82rem;
    gap: 5rem;
`;

const AmountBlock = styled.div`
    position: relative;
`;

const UP_ICE = StellarService.createAsset(UP_ICE_CODE, ICE_ISSUER);
const D_ICE = StellarService.createAsset(D_ICE_CODE, ICE_ISSUER);

const Delegate = () => {
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [pending, setPending] = useState(false);
    const [locks, setLocks] = useState(null);
    const [pendingId, setPendingId] = useState(null);

    const { account, isLogged } = useAuthStore();

    const updateIndex = useUpdateIndex(5000);

    useEffect(() => {
        if (!account) {
            setLocks(null);
            return;
        }
        setLocks(StellarService.getDelegateLocks(account.accountId()));
    }, [account, updateIndex]);

    const onAmountChange = (value: string) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        const [integerPart, fractionalPart] = value.split('.');
        const roundedValue =
            fractionalPart && fractionalPart.length > 7
                ? `${integerPart}.${fractionalPart.slice(0, 7)}`
                : value;

        setAmount(roundedValue);
    };

    const onSubmit = async () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }
        if (+amount > +account.getAssetBalance(UP_ICE)) {
            ToastService.showErrorToast('Insufficient upvoteIce balance');
            return;
        }

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        try {
            setPending(true);
            const tx = await StellarService.createDelegateTx(account, destination, amount);
            const processedTx = await StellarService.processIceTx(tx, UP_ICE);
            const result = await account.signAndSubmitTx(processedTx);

            setPending(false);

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Your tokens delegated successfully');
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setPending(false);
        }
    };

    const claim = async (id: string) => {
        try {
            setPendingId(id);
            if (account.authType === LoginTypes.walletConnect) {
                openCurrentWalletIfExist();
            }

            const op = StellarService.createClaimOperations(id);
            const tx = await StellarService.buildTx(account, op);
            const processedTx = await StellarService.processIceTx(tx, UP_ICE);
            const result = await account.signAndSubmitTx(processedTx);

            setPendingId(null);

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Your tokens claimed successfully');
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setPendingId(null);
        }
    };

    return (
        <MainBlock>
            <MainSection>
                <Form>
                    <Title>Delegate upvoteICE</Title>
                    <Input
                        label="Destination"
                        value={destination}
                        onChange={({ target }) => setDestination(target.value)}
                        placeholder="G..."
                    />

                    <AmountBlock>
                        {account && account.getAssetBalance(UP_ICE) !== null && (
                            <Balance>
                                Available:{' '}
                                {formatBalance(account.getAvailableForSwapBalance(UP_ICE))}{' '}
                                {UP_ICE_CODE}
                            </Balance>
                        )}
                        <Input
                            label="Amount"
                            value={amount}
                            onChange={({ target }) => onAmountChange(target.value)}
                            placeholder="0.0"
                            inputMode="decimal"
                        />
                    </AmountBlock>
                    <Button
                        isBig
                        fullWidth
                        disabled={!destination || !amount}
                        onClick={() => onSubmit()}
                        pending={pending}
                    >
                        delegate
                    </Button>
                </Form>
                <Form>
                    <Title>My delegations</Title>
                    {locks && Boolean(locks.length) ? (
                        <Table
                            head={[
                                { children: 'Destination' },
                                { children: 'Amount', align: CellAlign.Right },
                                { children: 'Created at', align: CellAlign.Right },
                                { children: 'Unlocked at', align: CellAlign.Right },
                                { children: 'Action', align: CellAlign.Right },
                            ]}
                            body={locks.map(lock => {
                                const destination = lock.claimants.find(
                                    claimant =>
                                        claimant.destination !== account.accountId() &&
                                        claimant.destination !== DELEGATE_MARKER_KEY,
                                );
                                const unlockTime = lock.claimants.find(
                                    claimant => claimant.destination === account.accountId(),
                                ).predicate.not.abs_before;
                                return {
                                    key: lock.id,
                                    rowItems: [
                                        {
                                            children: (
                                                <PublicKeyWithIcon
                                                    pubKey={destination.destination}
                                                    lettersCount={3}
                                                />
                                            ),
                                        },
                                        {
                                            children: `${formatBalance(+lock.amount)} upvoteICE`,
                                            align: CellAlign.Right,
                                        },
                                        {
                                            children: getDateString(
                                                new Date(lock.last_modified_time).getTime(),
                                                { withTime: true, withoutYear: true },
                                            ),
                                            align: CellAlign.Right,
                                        },
                                        {
                                            children: getDateString(
                                                new Date(unlockTime).getTime(),
                                                { withTime: true, withoutYear: true },
                                            ),
                                            align: CellAlign.Right,
                                        },
                                        {
                                            children: (
                                                <Button
                                                    isSmall
                                                    disabled={
                                                        Date.now() <
                                                            new Date(unlockTime).getTime() ||
                                                        (pendingId && pendingId !== lock.id)
                                                    }
                                                    pending={pendingId === lock.id}
                                                    onClick={() => claim(lock.id)}
                                                >
                                                    claim
                                                </Button>
                                            ),
                                            align: CellAlign.Right,
                                        },
                                    ],
                                };
                            })}
                        />
                    ) : (
                        <div>You currently have no delegated upvoteICE</div>
                    )}
                </Form>
                {account && account.getAssetBalance(D_ICE) === null && (
                    <Form>
                        <NoTrustline asset={D_ICE} />
                    </Form>
                )}
            </MainSection>
        </MainBlock>
    );
};

export default Delegate;
