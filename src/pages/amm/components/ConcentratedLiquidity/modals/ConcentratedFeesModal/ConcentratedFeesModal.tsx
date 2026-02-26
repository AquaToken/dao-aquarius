import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { POOL_TYPE } from 'constants/amm';

import { normalizePositions } from 'helpers/amm-concentrated-positions';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { SorobanService, ToastService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';

import Alert from 'basics/Alert';
import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import PageLoader from 'basics/loaders/PageLoader';
import { ModalDescription, ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import {
    Container,
    PositionTokenRow,
    PositionTokenRows,
    Section,
} from '../../components/ConcentratedPositionsSection/ConcentratedPositionsSection.styled';

type ConcentratedFeesModalParams = {
    pool: PoolExtended;
};

const ConcentratedFeesModal = ({
    close,
    params,
}: ModalProps<ConcentratedFeesModalParams>): React.ReactNode => {
    const { pool } = params;
    const { account } = useAuthStore();

    const [allFees, setAllFees] = useState<string[] | null>(null);
    const [positionsCount, setPositionsCount] = useState(0);
    const [pending, setPending] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = 'Concentrated Fees';
    const hasAnyFees = (allFees || []).some(value => new BigNumber(value || '0').gt(0));

    const load = () => {
        if (!account || pool.pool_type !== POOL_TYPE.concentrated) {
            return;
        }

        setLoading(true);

        Promise.all([
            SorobanService.amm.getAllPositionFees(pool.address, account.accountId(), pool.tokens),
            SorobanService.amm.getUserPositionSnapshot(pool.address, account.accountId()),
        ])
            .then(async ([fees, snapshot]) => {
                setAllFees(fees);
                const positions = normalizePositions(snapshot);
                if (!positions.length) {
                    setPositionsCount(0);
                    return;
                }

                const feesByPosition = await Promise.all(
                    positions.map(async position => {
                        try {
                            return await SorobanService.amm.getPositionFees(
                                pool.address,
                                account.accountId(),
                                pool.tokens,
                                position.tickLower,
                                position.tickUpper,
                            );
                        } catch {
                            return ['0', '0'];
                        }
                    }),
                );

                const nonZeroFeesPositions = feesByPosition.filter(positionFees =>
                    positionFees.some(value => new BigNumber(value || '0').gt(0)),
                ).length;

                setPositionsCount(nonZeroFeesPositions);
            })
            .catch(e => {
                ToastService.showErrorToast(e?.message || 'Failed to load fees');
                setAllFees(null);
                setPositionsCount(0);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        load();
    }, [account, pool.address]);

    const ensureWalletOpened = () => {
        if (account?.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
    };

    const claimAllFees = () => {
        if (!account || pending) {
            return;
        }

        ensureWalletOpened();
        setPending(true);

        SorobanService.amm
            .getClaimAllPositionFeesTx(account.accountId(), pool.address)
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses }) => {
                if (!res) {
                    return;
                }

                if (res.status === BuildSignAndSubmitStatuses.pending) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }

                ToastService.showSuccessToast('All position fees claimed');
                load();
            })
            .catch(e => {
                ToastService.showErrorToast(e?.message || 'Claim all fees failed');
            })
            .finally(() => {
                setPending(false);
            });
    };

    return (
        <ModalWrapper>
            <ModalTitle>{title}</ModalTitle>
            <Container>
                {!account && <Alert title="Wallet required" text="Connect wallet to claim fees." />}

                {loading ? (
                    <PageLoader />
                ) : (
                    <Section>
                        {hasAnyFees ? (
                            <>
                                <ModalDescription>
                                    You have accumulated fees across {positionsCount} position
                                    {positionsCount === 1 ? '' : 's'}.
                                </ModalDescription>
                                <PositionTokenRows>
                                    {pool.tokens.map((asset, index) => (
                                        <PositionTokenRow key={asset.contract}>
                                            <span>{asset.code}</span>
                                            <span>
                                                {allFees
                                                    ? formatBalance(
                                                          Number(allFees[index] || 0),
                                                          true,
                                                      )
                                                    : '-'}
                                                <AssetLogo asset={asset} isSmall isCircle />
                                            </span>
                                        </PositionTokenRow>
                                    ))}
                                </PositionTokenRows>
                            </>
                        ) : (
                            <>
                                <ModalDescription>
                                    No claimable fees yet. Fees will appear here after swaps in your
                                    active ranges.
                                </ModalDescription>
                                <PositionTokenRows>
                                    {pool.tokens.map(asset => (
                                        <PositionTokenRow key={asset.contract}>
                                            <span>{asset.code}</span>
                                            <span>
                                                0
                                                <AssetLogo asset={asset} isSmall isCircle />
                                            </span>
                                        </PositionTokenRow>
                                    ))}
                                </PositionTokenRows>
                            </>
                        )}
                    </Section>
                )}

                <StickyButtonWrapper>
                    <Button
                        fullWidth
                        isBig
                        onClick={() => {
                            if (hasAnyFees) {
                                claimAllFees();
                                return;
                            }
                            close();
                        }}
                        pending={pending}
                        disabled={hasAnyFees ? !account : false}
                    >
                        {hasAnyFees ? 'Claim all fees' : 'Got it'}
                    </Button>
                </StickyButtonWrapper>
            </Container>
        </ModalWrapper>
    );
};

export default ConcentratedFeesModal;
