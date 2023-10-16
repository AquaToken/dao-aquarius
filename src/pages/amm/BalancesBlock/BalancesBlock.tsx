import * as React from 'react';
import styled from 'styled-components';
import { useState } from 'react';
import { Header, Title } from '../../profile/AmmRewards/AmmRewards';
import PageLoader from '../../../common/basics/PageLoader';
import Asset from '../../vote/components/AssetDropdown/Asset';
import { formatBalance } from '../../../common/helpers/helpers';
import Button from '../../../common/basics/Button';
import { COLORS } from '../../../common/styles';
import { IconFail, IconSuccess, IconPending } from '../../../common/basics/Icons';
import { CONTRACT_STATUS } from '../../../common/services/soroban.service';
import { SorobanService, ToastService } from '../../../common/services/globalServices';
import useAuthStore from '../../../store/authStore/useAuthStore';
import * as SorobanClient from 'soroban-client';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const BalanceLine = styled.div`
    display: flex;
    border-top: 0.1rem solid ${COLORS.gray};
    padding: 0.4rem 0;
    align-items: center;

    &:first-child {
        font-weight: 700;
        margin-bottom: 2rem;
        border-top: none;
    }

    &:last-child {
        margin-bottom: 5rem;
        border-bottom: 0.1rem solid ${COLORS.gray};
    }

    div {
        flex: 1;
    }
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
    const [showBalances, setShowBalances] = useState(false);
    const { account } = useAuthStore();

    const [pendingId, setPendingId] = useState(null);

    const deploy = ({ asset, contractId }) => {
        setPendingId(contractId);
        return SorobanService.deployAssetContractTx(account.accountId(), asset)
            .then((tx) => account.signAndSubmitTx(tx as SorobanClient.Transaction))
            .then((res) => {
                console.log(res);
                setPendingId(null);
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
                return account.signAndSubmitTx(tx as SorobanClient.Transaction);
            })
            .then((res) => {
                console.log(res);
                setPendingId(null);
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
                return account.signAndSubmitTx(tx as SorobanClient.Transaction);
            })
            .then((res) => {
                console.log(res);
                setPendingId(null);
                account.getBalances();
                ToastService.showSuccessToast('Contract has been restored!');
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setPendingId(null);
            });
    };

    return (
        <Container>
            <Header>
                <Title>Balances</Title>
                <Button isSmall onClick={() => setShowBalances((prevState) => !prevState)}>
                    {showBalances ? 'Hide balances' : 'Show balances'}
                </Button>
            </Header>
            {showBalances ? (
                !balances ? (
                    <PageLoader />
                ) : (
                    <div>
                        <BalanceLine>
                            <div>Asset</div>
                            <div>Balance</div>
                            <div>Contract status</div>
                            <div>Ledgers before expiration</div>
                            <div>Action</div>
                        </BalanceLine>
                        {balances.map(
                            ({ asset, balance, status, contractId, ledgersBeforeExpire }) => (
                                <BalanceLine key={contractId}>
                                    <div>
                                        <Asset asset={asset} />
                                    </div>
                                    <div>{formatBalance(+balance)}</div>
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
                                    <div>{ledgersBeforeExpire}</div>
                                    <div>
                                        {status === CONTRACT_STATUS.EXPIRED && (
                                            <Button
                                                isSmall
                                                pending={pendingId === contractId}
                                                disabled={
                                                    pendingId !== contractId && Boolean(pendingId)
                                                }
                                                onClick={() => restore({ asset, contractId })}
                                            >
                                                Restore
                                            </Button>
                                        )}
                                        {status === CONTRACT_STATUS.NOT_FOUND && (
                                            <Button
                                                isSmall
                                                pending={pendingId === contractId}
                                                disabled={
                                                    pendingId !== contractId && Boolean(pendingId)
                                                }
                                                onClick={() => deploy({ asset, contractId })}
                                            >
                                                Deploy
                                            </Button>
                                        )}
                                        {status === CONTRACT_STATUS.ACTIVE && (
                                            <Button
                                                isSmall
                                                pending={pendingId === contractId}
                                                disabled={
                                                    pendingId !== contractId && Boolean(pendingId)
                                                }
                                                onClick={() => bump({ asset, contractId })}
                                            >
                                                Bump
                                            </Button>
                                        )}
                                    </div>
                                </BalanceLine>
                            ),
                        )}
                    </div>
                )
            ) : null}
        </Container>
    );
};

export default BalancesBlock;
