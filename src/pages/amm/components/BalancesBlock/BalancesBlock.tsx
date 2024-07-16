import * as React from 'react';
import styled from 'styled-components';
import { useState } from 'react';
import { Header, Title } from '../../../profile/AmmRewards/AmmRewards';
import PageLoader from '../../../../common/basics/PageLoader';
import Asset from '../../../vote/components/AssetDropdown/Asset';
import { formatBalance } from '../../../../common/helpers/helpers';
import Button from '../../../../common/basics/Button';
import { Breakpoints } from '../../../../common/styles';
import { IconFail, IconSuccess, IconPending } from '../../../../common/basics/Icons';
import { CONTRACT_STATUS } from '../../../../common/services/soroban.service';
import {
    ModalService,
    SorobanService,
    ToastService,
} from '../../../../common/services/globalServices';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import { commonMaxWidth, flexAllCenter, respondDown } from '../../../../common/mixins';
import { Empty } from '../../../profile/YourVotes/YourVotes';
import ChooseLoginMethodModal from '../../../../common/modals/ChooseLoginMethodModal';
import Table from '../../../../common/basics/Table';
import { BuildSignAndSubmitStatuses } from '../../../../common/services/wallet-connect.service';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 6.3rem 4rem;
    flex: 1 0 auto;

    ${respondDown(Breakpoints.sm)`
        padding: 2rem 1.6rem 0;
    `}
`;

const Section = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
`;

const LoginButton = styled(Button)`
    margin-top: 1rem;
`;

const Status = styled.div`
    display: flex;
    align-items: center;

    div {
        flex: unset;
        margin-right: 0.5rem;
    }
`;

const BalancesBlock = ({ balances }) => {
    const { account } = useAuthStore();

    const [pendingId, setPendingId] = useState(null);

    const deploy = ({ asset, contractId }) => {
        setPendingId(contractId);
        return SorobanService.deployAssetContractTx(account.accountId(), asset)
            .then((tx) => account.signAndSubmitTx(tx))
            .then((res) => {
                setPendingId(null);
                if (
                    (res as { status: BuildSignAndSubmitStatuses })?.status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }
                account.getBalances();
                ToastService.showSuccessToast('Contract has been deployed!');
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setPendingId(null);
            });
    };

    const restore = ({ asset, contractId }) => {
        setPendingId(contractId);
        return SorobanService.restoreAssetContractTx(account.accountId(), asset)
            .then((tx) => {
                return account.signAndSubmitTx(tx);
            })
            .then((res) => {
                setPendingId(null);
                if (
                    (res as { status: BuildSignAndSubmitStatuses })?.status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }
                account.getBalances();
                ToastService.showSuccessToast('Contract has been restored!');
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setPendingId(null);
            });
    };

    const bump = ({ asset, contractId }) => {
        setPendingId(contractId);
        return SorobanService.bumpAssetContractTx(account.accountId(), asset)
            .then((tx) => {
                return account.signAndSubmitTx(tx);
            })
            .then((res) => {
                setPendingId(null);
                if (
                    (res as { status: BuildSignAndSubmitStatuses })?.status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }
                account.getBalances();
                ToastService.showSuccessToast('Contract has been bumped!');
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setPendingId(null);
            });
    };

    if (!account) {
        return (
            <Section>
                <Empty>
                    <h3>Log in required.</h3>
                    <span>To use the demo you need to log in.</span>

                    <LoginButton onClick={() => ModalService.openModal(ChooseLoginMethodModal, {})}>
                        Log in
                    </LoginButton>
                </Empty>
            </Section>
        );
    }

    return (
        <Container>
            <Content>
                <Header>
                    <Title>Balances</Title>
                </Header>
                {!balances ? (
                    <PageLoader />
                ) : (
                    <>
                        <Table
                            head={[
                                { children: 'Asset' },
                                { children: 'Balance' },
                                { children: 'Contract status' },
                                { children: 'Ledgers before expiration' },
                                { children: 'Action' },
                            ]}
                            body={balances.map(
                                ({ asset, balance, status, contractId, ledgersBeforeExpire }) => ({
                                    key: contractId,
                                    isNarrow: true,
                                    rowItems: [
                                        { children: <Asset asset={asset} />, label: 'Asset:' },
                                        { children: formatBalance(+balance), label: 'Balance:' },
                                        {
                                            children: (
                                                <Status>
                                                    {status === CONTRACT_STATUS.ACTIVE && (
                                                        <>
                                                            <IconSuccess /> Active
                                                        </>
                                                    )}
                                                    {status === CONTRACT_STATUS.EXPIRED && (
                                                        <>
                                                            <IconPending /> Expired
                                                        </>
                                                    )}
                                                    {status === CONTRACT_STATUS.NOT_FOUND && (
                                                        <>
                                                            <IconFail /> Not found
                                                        </>
                                                    )}
                                                </Status>
                                            ),
                                            label: 'Contract status:',
                                        },
                                        {
                                            children: ledgersBeforeExpire,
                                            label: 'Ledgers before expiration:',
                                        },
                                        {
                                            children: (
                                                <>
                                                    {status === CONTRACT_STATUS.EXPIRED &&
                                                        !asset.isNative() && (
                                                            <Button
                                                                isSmall
                                                                pending={pendingId === contractId}
                                                                disabled={
                                                                    pendingId !== contractId &&
                                                                    Boolean(pendingId)
                                                                }
                                                                onClick={() =>
                                                                    restore({ asset, contractId })
                                                                }
                                                            >
                                                                Restore
                                                            </Button>
                                                        )}
                                                    {status === CONTRACT_STATUS.NOT_FOUND &&
                                                        !asset.isNative() && (
                                                            <Button
                                                                isSmall
                                                                pending={pendingId === contractId}
                                                                disabled={
                                                                    pendingId !== contractId &&
                                                                    Boolean(pendingId)
                                                                }
                                                                onClick={() =>
                                                                    deploy({ asset, contractId })
                                                                }
                                                            >
                                                                Deploy
                                                            </Button>
                                                        )}
                                                    {status === CONTRACT_STATUS.ACTIVE &&
                                                        !asset.isNative() && (
                                                            <Button
                                                                isSmall
                                                                pending={pendingId === contractId}
                                                                disabled={
                                                                    pendingId !== contractId &&
                                                                    Boolean(pendingId)
                                                                }
                                                                onClick={() =>
                                                                    bump({ asset, contractId })
                                                                }
                                                            >
                                                                Bump
                                                            </Button>
                                                        )}
                                                </>
                                            ),
                                            label: 'Action:',
                                        },
                                    ],
                                }),
                            )}
                        />
                    </>
                )}
            </Content>
        </Container>
    );
};

export default BalancesBlock;
