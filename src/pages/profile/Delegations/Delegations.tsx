import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getDelegatees, getMyDelegatees } from 'api/delegate';

import { ICE_TO_DELEGATE } from 'constants/assets';
import { DELEGATE_MARKER_KEY } from 'constants/stellar-accounts';

import { formatBalance } from 'helpers/format-number';
import { truncateString } from 'helpers/truncate-string';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar/events/events';

import { Delegatee as DelegateeType } from 'types/delegate';
import { ClaimableBalance } from 'types/stellar';

import ChooseLoginMethodModal from 'modals/auth/ChooseLoginMethodModal';
import DelegateClaimModal from 'modals/DelegateClaimModal';
import DelegateModal from 'modals/DelegateModal';

import PlusIcon from 'assets/icons/nav/icon-plus-16.svg';
import Ice from 'assets/tokens/ice-logo.svg';

import BlankButton from 'basics/buttons/BlankButton';
import Identicon from 'basics/Identicon';
import { PageLoader } from 'basics/loaders';

import { flexAllCenter, respondDown, textEllipsis } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

const Container = styled.section`
    width: 100%;
`;

const Title = styled.h2`
    font-weight: 400;
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 2.4rem;

    ${respondDown(Breakpoints.md)`
        font-size: 2.8rem;
        line-height: 3.6rem;
    `}
`;

const Card = styled.div`
    background-color: ${COLORS.white};
    border-radius: 1rem;
    padding: 2.4rem;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        padding: 1.6rem;
    `}
`;

const TableGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(20rem, 35.5rem) minmax(32rem, 1fr) 27.6rem;
    column-gap: 2.4rem;
    width: 100%;

    ${respondDown(Breakpoints.lg)`
        grid-template-columns: minmax(19rem, 1fr) minmax(30rem, 1fr) 27.6rem;
    `}

    ${respondDown(Breakpoints.md)`
        grid-template-columns: 1fr;
        row-gap: 1.6rem;
    `}
`;

const Head = styled(TableGrid)`
    min-height: 2rem;
    align-items: center;
    color: ${COLORS.textGray};
    font-size: 1.4rem;
    line-height: 2rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const Row = styled(TableGrid)`
    min-height: 7.2rem;
    padding: 1.2rem 0;
    align-items: center;

    ${respondDown(Breakpoints.md)`
        background-color: ${COLORS.gray50};
        border-radius: 0.6rem;
        padding: 1.6rem;
    `}
`;

const DelegateCell = styled.div`
    display: flex;
    align-items: center;
    min-width: 0;
`;

const Avatar = styled.img`
    width: 4.8rem;
    height: 4.8rem;
    border-radius: 50%;
    object-fit: cover;
    flex: 0 0 4.8rem;
    margin-right: 0.8rem;
`;

const IdenticonStyled = styled(Identicon)`
    width: 4.8rem;
    height: 4.8rem;
    flex: 0 0 4.8rem;
    margin-right: 0.8rem;
`;

const DelegateName = styled.span`
    min-width: 0;
    font-weight: 700;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
    ${textEllipsis};
`;

const Amounts = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;
    min-width: 0;

    ${respondDown(Breakpoints.md)`
        align-items: flex-start;
        flex-direction: column;
        gap: 0.8rem;
    `}
`;

const AmountItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 15rem;
    min-width: 0;
    color: ${COLORS.textPrimary};
    font-size: 1.4rem;
    line-height: 1.6rem;
    white-space: nowrap;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const IceIcon = styled(Ice)`
    width: 2rem;
    height: 2rem;
    flex: 0 0 2rem;
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;

    ${respondDown(Breakpoints.md)`
        justify-content: stretch;
    `}

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
    `}
`;

const ActionButton = styled(BlankButton)<{ $secondary?: boolean }>`
    ${flexAllCenter};
    height: 4.8rem;
    min-width: ${({ $secondary }) => ($secondary ? '13.3rem' : '13.5rem')};
    padding: 0 1.6rem;
    border-radius: 0.6rem;
    border: 0.2rem solid ${COLORS.transparent};
    background-color: ${({ $secondary }) => ($secondary ? COLORS.gray100 : COLORS.purple950)};
    color: ${({ $secondary }) => ($secondary ? COLORS.textPrimary : COLORS.white)};
    font-weight: 700;
    font-size: 1.4rem;
    line-height: 1.6rem;
    letter-spacing: 0.14rem;
    text-transform: uppercase;
    transition:
        background-color 0.2s ease,
        transform 0.2s ease,
        opacity 0.2s ease;

    svg {
        width: 1.6rem;
        height: 1.6rem;
        margin-right: 0.8rem;
        flex: 0 0 1.6rem;
    }

    &:hover {
        background-color: ${({ $secondary }) => ($secondary ? COLORS.gray50 : COLORS.purple500)};
    }

    &:active {
        transform: scale(0.96);
    }

    &:focus {
        border-color: ${COLORS.cyan500};
    }

    ${respondDown(Breakpoints.md)`
        flex: 1 1 0;
        min-width: 0;
        padding: 0 1.2rem;
    `}

    ${respondDown(Breakpoints.xs)`
        width: 100%;
    `}
`;

const LoaderWrap = styled.div`
    min-height: 35.6rem;
    ${flexAllCenter};
`;

const EmptyState = styled.div`
    min-height: 35.6rem;
    ${flexAllCenter};
    flex-direction: column;
    text-align: center;
    background-color: ${COLORS.white};
    border-radius: 1rem;
    padding: 2.4rem;

    h3 {
        font-size: 2rem;
        line-height: 2.8rem;
        color: ${COLORS.textPrimary};
        margin-bottom: 0.8rem;
    }

    span {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.textGray};
        margin-bottom: 2.4rem;
    }
`;

type DelegationRow = {
    destination: string;
    delegatee: Partial<DelegateeType> & { account: string };
    amounts: Record<string, number>;
};

type DelegatePredicate = {
    not?: {
        unconditional?: boolean;
    };
};

const getDelegateDestination = (lock: ClaimableBalance): string | null =>
    lock.claimants.find(
        ({ predicate, destination }) =>
            Boolean((predicate as DelegatePredicate)?.not?.unconditional) &&
            destination !== DELEGATE_MARKER_KEY,
    )?.destination ?? null;

const getTokenCode = (asset: string): string => asset.split(':')[0];

const formatTokenAmount = (amount: number, asset: string): string =>
    `${formatBalance(amount, true)} ${getTokenCode(asset)}`;

const Delegations = (): React.ReactNode => {
    const [locks, setLocks] = useState<ClaimableBalance[] | null>(null);
    const [delegatees, setDelegatees] = useState<DelegateeType[] | null>(null);
    const [customDelegatees, setCustomDelegatees] = useState<Partial<DelegateeType>[] | null>(null);

    const { isLogged, account } = useAuthStore();
    const updateIndex = useUpdateIndex(10000);

    useEffect(() => {
        if (!account) {
            return;
        }

        const updateLocks = () => setLocks(StellarService.cb.getDelegateLocks(account.accountId()));

        updateLocks();

        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                updateLocks();
            }
        });

        return () => unsub();
    }, [account]);

    useEffect(() => {
        getDelegatees().then(setDelegatees);
    }, [updateIndex]);

    useEffect(() => {
        if (!account || !delegatees) {
            return;
        }

        let isCancelled = false;

        getMyDelegatees(account.accountId())
            .then(res =>
                res.filter(
                    ({ account: delegateeAccount }) =>
                        !delegatees.find(({ account }) => account === delegateeAccount),
                ),
            )
            .then(res => {
                if (!isCancelled) {
                    setCustomDelegatees(res);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [account, delegatees]);

    const locksSummary = useMemo(() => {
        if (!locks) {
            return null;
        }

        return locks.reduce((acc, lock) => {
            const destination = getDelegateDestination(lock);

            if (!destination) {
                return acc;
            }

            const result = acc.get(destination) ?? {};
            result[lock.asset] = (result[lock.asset] ?? 0) + Number(lock.amount);
            acc.set(destination, result);

            return acc;
        }, new Map<string, Record<string, number>>());
    }, [locks]);

    const rows = useMemo<DelegationRow[] | null>(() => {
        if (!locksSummary || !delegatees || !customDelegatees) {
            return null;
        }

        return [...locksSummary.entries()]
            .sort((a, b) => {
                const total = (amounts: Record<string, number>) =>
                    Object.values(amounts).reduce((acc, value) => acc + value, 0);

                return total(b[1]) - total(a[1]);
            })
            .map(([destination, amounts]) => {
                const delegatee =
                    delegatees.find(({ account }) => account === destination) ??
                    customDelegatees.find(({ account }) => account === destination) ??
                    {};

                return {
                    destination,
                    amounts,
                    delegatee: {
                        ...delegatee,
                        account: destination,
                    },
                };
            });
    }, [customDelegatees, delegatees, locksSummary]);

    const openDelegateModal = (delegatee?: Partial<DelegateeType>) => {
        if (!delegatees) {
            return;
        }

        const params = { delegatee, delegatees };

        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                callback: () => ModalService.openModal(DelegateModal, params),
            });
            return;
        }

        ModalService.openModal(DelegateModal, params);
    };

    const openUndelegateModal = (delegatee: Partial<DelegateeType>) => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                callback: () => ModalService.openModal(DelegateClaimModal, { delegatee }),
            });
            return;
        }

        ModalService.openModal(DelegateClaimModal, { delegatee });
    };

    if (!rows) {
        return (
            <Container>
                <Title>ICE Delegations</Title>
                <Card>
                    <LoaderWrap>
                        <PageLoader />
                    </LoaderWrap>
                </Card>
            </Container>
        );
    }

    if (!rows.length) {
        return (
            <Container>
                <Title>ICE Delegations</Title>
                <EmptyState>
                    <h3>There&apos;s nothing here.</h3>
                    <span>You don&apos;t have any active ICE delegations yet.</span>
                    <ActionButton onClick={() => openDelegateModal()}>
                        <PlusIcon />
                        Delegate
                    </ActionButton>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container>
            <Title>ICE Delegations</Title>
            <Card>
                <Head>
                    <span>Delegate</span>
                    <span>Amount</span>
                    <span />
                </Head>

                {rows.map(({ destination, delegatee, amounts }) => {
                    const visibleAmounts = ICE_TO_DELEGATE.filter(asset => Number(amounts[asset]));

                    return (
                        <Row key={destination}>
                            <DelegateCell>
                                {delegatee.image ? (
                                    <Avatar src={delegatee.image} alt={delegatee.name} />
                                ) : (
                                    <IdenticonStyled pubKey={destination} />
                                )}
                                <DelegateName>
                                    {delegatee.name || truncateString(destination, 4)}
                                </DelegateName>
                            </DelegateCell>

                            <Amounts>
                                {visibleAmounts.map(asset => (
                                    <AmountItem key={asset}>
                                        <IceIcon />
                                        {formatTokenAmount(amounts[asset], asset)}
                                    </AmountItem>
                                ))}
                            </Amounts>

                            <Actions>
                                <ActionButton onClick={() => openDelegateModal(delegatee)}>
                                    <PlusIcon />
                                    Delegate
                                </ActionButton>
                                <ActionButton
                                    $secondary
                                    onClick={() => openUndelegateModal(delegatee)}
                                >
                                    Undelegate
                                </ActionButton>
                            </Actions>
                        </Row>
                    );
                })}
            </Card>
        </Container>
    );
};

export default Delegations;
