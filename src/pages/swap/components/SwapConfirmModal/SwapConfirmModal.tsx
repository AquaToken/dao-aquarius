import * as StellarSdk from '@stellar/stellar-sdk';
import { xdr } from '@stellar/stellar-sdk';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getPathPoolsFee } from 'api/amm';

import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { ModalService, SorobanService, ToastService } from 'services/globalServices';

import { ModalProps } from 'types/modal';
import { SorobanToken, Token, TokenType } from 'types/token';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import { ModalDescription, ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import SwapTokenDirection from 'components/SwapTokenDirection';

import SwapSuccessModal from 'pages/swap/components/SwapSuccessModal/SwapSuccessModal';

import PathPool from './PathPool/PathPool';

import { SWAP_SLIPPAGE_ALIAS } from '../SwapSettingsModal/SwapSettingsModal';

const DescriptionRow = styled.div`
    ${flexRowSpaceBetween};
    color: ${COLORS.textGray};
    font-size: 1.6rem;
    padding: 1.5rem 0;

    span:last-child {
        color: ${COLORS.textTertiary};
        text-align: right;
    }
`;

const Pools = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        width: 100%;
    `}
`;

const STROOP = 0.0000001;

interface SwapConfirmModalParams {
    base: Token;
    counter: Token;
    baseAmount: string;
    counterAmount: string;
    bestPathXDR: string;
    bestPath: string[];
    bestPools: string[];
    isSend: boolean;
}

const SwapConfirmModal = ({
    params,
    confirm,
}: ModalProps<SwapConfirmModalParams>): React.ReactNode => {
    const { base, counter, baseAmount, counterAmount, bestPathXDR, bestPath, bestPools, isSend } =
        params;
    const [fees, setFees] = useState(null);
    const [swapPending, setSwapPending] = useState(false);
    const [txFee, setTxFee] = useState(null);
    const [pathTokens, setPathTokens] = useState<Token[]>(null);

    const { account } = useAuthStore();

    useEffect(() => {
        Promise.all(bestPath.map(str => SorobanService.token.parseTokenContractId(str))).then(
            res => {
                setPathTokens(res);
            },
        );
    }, []);

    useEffect(() => {
        getPathPoolsFee(bestPools)
            .then(res => {
                setFees(res);
            })
            .catch(() => {
                setFees(0);
            });
    }, []);

    useEffect(() => {
        const SLIPPAGE = localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || '1'; // 1%
        const minAmount = isSend
            ? ((1 - Number(SLIPPAGE) / 100) * Number(counterAmount)).toFixed(
                  (counter as SorobanToken).decimal ?? 7,
              )
            : ((1 + Number(SLIPPAGE) / 100) * Number(baseAmount)).toFixed(
                  (base as SorobanToken).decimal ?? 7,
              );
        SorobanService.amm
            .getSwapChainedTx(
                account?.accountId(),
                base,
                counter,
                bestPathXDR,
                isSend ? baseAmount : counterAmount,
                minAmount,
                isSend,
            )
            .then(res => {
                SorobanService.connection
                    .simulateTx(res)
                    .then(
                        ({
                            minResourceFee,
                        }: StellarSdk.rpc.Api.SimulateTransactionSuccessResponse) => {
                            setTxFee(minResourceFee);
                        },
                    );
            });
    }, []);

    const swap = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setSwapPending(true);
        const SLIPPAGE = localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || '1'; // 1%

        const minAmount = isSend
            ? ((1 - Number(SLIPPAGE) / 100) * Number(counterAmount)).toFixed(
                  (counter as SorobanToken).decimal ?? 7,
              )
            : ((1 + Number(SLIPPAGE) / 100) * Number(baseAmount)).toFixed(
                  (base as SorobanToken).decimal ?? 7,
              );

        let hash: string;

        SorobanService.amm
            .getSwapChainedTx(
                account?.accountId(),
                base,
                counter,
                bestPathXDR,
                isSend ? baseAmount : counterAmount,
                minAmount,
                isSend,
            )
            .then(tx => {
                hash = tx.hash().toString('hex');
                return account.signAndSubmitTx(tx, true);
            })
            .then((res: { status?: BuildSignAndSubmitStatuses }) => {
                confirm();

                if (!res) {
                    return;
                }

                if (
                    (res as { status: BuildSignAndSubmitStatuses }).status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }

                const sentAmount = isSend
                    ? baseAmount
                    : SorobanService.scVal.i128ToInt(
                          res as xdr.ScVal,
                          (base as SorobanToken).decimal,
                      );
                const receivedAmount = isSend
                    ? SorobanService.scVal.i128ToInt(
                          res as xdr.ScVal,
                          (counter as SorobanToken).decimal,
                      )
                    : counterAmount;

                ModalService.openModal(SwapSuccessModal, {
                    source: base,
                    destination: counter,
                    sourceAmount: sentAmount,
                    destinationAmount: receivedAmount,
                    txHash: hash,
                });

                if (base.type === TokenType.soroban) {
                    ToastService.showSuccessToast(
                        `Payment sent: ${formatBalance(Number(sentAmount))} ${base.code}`,
                    );
                }

                if (counter.type === TokenType.soroban) {
                    ToastService.showSuccessToast(
                        `Payment received: ${formatBalance(Number(receivedAmount))} ${
                            counter.code
                        }`,
                    );
                }
                setSwapPending(false);
            })
            .catch(e => {
                const errorMessage = e.message ?? e.toString() ?? 'Oops! Something went wrong';

                ToastService.showErrorToast(
                    errorMessage === 'The amount is too small to deposit to this pool'
                        ? 'Price expired, please submit a swap again'
                        : errorMessage,
                );
                setSwapPending(false);
            });
    };

    return (
        <ModalWrapper>
            <ModalTitle>Confirm Swap</ModalTitle>
            <ModalDescription>Review amounts, rate, and fees before confirming</ModalDescription>
            <SwapTokenDirection assets={[base, counter]} />
            <DescriptionRow>
                <span>You give</span>
                <span>
                    {formatBalance(Number(baseAmount))} {base.code}
                </span>
            </DescriptionRow>
            <DescriptionRow>
                <span>You get (estimate)</span>
                <span>
                    {formatBalance(Number(counterAmount))} {counter.code}
                </span>
            </DescriptionRow>
            <DescriptionRow>
                <span>Exchange rate</span>
                <span>
                    1 {base.code} ={' '}
                    {formatBalance(
                        +(+counterAmount / +baseAmount).toFixed(
                            counter.type === TokenType.soroban ? counter.decimal : 7,
                        ),
                    )}{' '}
                    {counter.code}
                </span>
            </DescriptionRow>

            <DescriptionRow>
                <span>Maximum transaction fee:</span>
                <span>
                    {txFee !== null ? (
                        `${formatBalance(
                            +(STROOP * (Number(txFee) + Number(StellarSdk.BASE_FEE))).toFixed(7),
                        )} XLM`
                    ) : (
                        <DotsLoader />
                    )}
                </span>
            </DescriptionRow>

            <DescriptionRow>
                <span>Pools:</span>
                <span />
            </DescriptionRow>

            {!fees || !pathTokens ? (
                <PageLoader />
            ) : (
                <Pools>
                    {bestPools.map((pool, index) => {
                        const base = pathTokens[index];
                        const counter = pathTokens[index + 1];
                        return (
                            <PathPool
                                key={pool}
                                baseIcon={<AssetLogo asset={base} />}
                                counterIcon={<AssetLogo asset={counter} />}
                                fee={fees.get(pool)}
                                address={pool}
                                isLastPool={index === bestPools.length - 1}
                            />
                        );
                    })}
                </Pools>
            )}
            <StickyButtonWrapper>
                <Button fullWidth isBig pending={swapPending} isRounded onClick={() => swap()}>
                    Confirm Swap
                </Button>
            </StickyButtonWrapper>
        </ModalWrapper>
    );
};

export default SwapConfirmModal;
