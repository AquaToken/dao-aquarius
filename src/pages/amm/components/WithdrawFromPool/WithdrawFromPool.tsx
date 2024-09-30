import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';
import { Int128Parts } from 'types/stellar';

import { ModalService, SorobanService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';
import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import { ModalTitle } from 'basics/ModalAtoms';

import Market from '../../../vote/components/common/Market';
import SuccessModal from '../SuccessModal/SuccessModal';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const PairContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.lightGray};
    border-radius: 0.6rem;
    padding: 2.4rem;
    margin: 4rem 0 1.6rem;
`;

const StyledButton = styled(Button)`
    margin-top: 5rem;
    margin-left: auto;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        margin-top: 2rem;
    `}
`;

const InputStyled = styled(Input)`
    margin-bottom: 3.2rem;
    margin-top: 5rem;
`;

const Details = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 3.2rem;
`;

const DescriptionRow = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 1.6rem;
    color: ${COLORS.grayText};

    span:last-child {
        color: ${COLORS.paragraphText};
    }
`;

const WithdrawFromPool = ({ params }: ModalProps<{ pool: PoolExtended }>) => {
    const { pool } = params;
    const [accountShare, setAccountShare] = useState(null);
    const [percent, setPercent] = useState('100');
    const [pending, setPending] = useState(false);
    const [totalShares, setTotalShares] = useState(null);
    const [reserves, setReserves] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        SorobanService.getTotalShares(pool.address).then(res => {
            setTotalShares(res);
        });
    }, []);

    useEffect(() => {
        SorobanService.getPoolReserves(pool.assets, pool.address).then(res => {
            setReserves(res);
        });
    }, []);

    useEffect(() => {
        if (!account) {
            setAccountShare(null);
            return;
        }
        SorobanService.getTokenBalance(pool.share_token_address, account.accountId()).then(res => {
            setAccountShare(res);
        });
    }, [account]);

    const onInputChange = (value: string) => {
        if (Number.isNaN(Number(value)) || Number(value) > 100) {
            return;
        }
        const [integerPart, fractionalPart] = value.split('.');

        const roundedValue =
            fractionalPart && fractionalPart.length > 1
                ? `${integerPart}.${fractionalPart.slice(0, 1)}`
                : value;

        setPercent(roundedValue);
    };

    const withdraw = () => {
        const noTrustAssets = pool.assets.filter(asset => account.getAssetBalance(asset) === null);

        if (noTrustAssets.length) {
            ToastService.showErrorToast(
                `${noTrustAssets.map(({ code }) => code).join(', ')} trustline${
                    noTrustAssets.length > 1 ? 's' : ''
                } missing. Please provide it in your wallet.`,
            );
            return;
        }
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);

        const amount = new BigNumber(accountShare.toString())
            .times(new BigNumber(percent))
            .div(100)
            .toFixed(7);
        let hash: string;

        SorobanService.getWithdrawTx(account?.accountId(), pool.index, amount, pool.assets)
            .then(tx => {
                hash = tx.hash().toString('hex');
                return account.signAndSubmitTx(tx, true);
            })
            .then(
                (res: {
                    value?: () => { value: () => Int128Parts }[];
                    status?: BuildSignAndSubmitStatuses;
                }) => {
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

                    ModalService.openModal(SuccessModal, {
                        assets: pool.assets,
                        amounts: res.value().map(val => SorobanService.i128ToInt(val.value())),
                        title: 'Withdraw Successful',
                        hash,
                    });
                    setPending(false);
                },
            )
            .catch(e => {
                const errorMessage = e.message ?? e.toString() ?? 'Oops! Something went wrong';
                ToastService.showErrorToast(
                    errorMessage === 'The amount is too small to deposit to this pool'
                        ? 'The amount is too small to withdraw from this pool'
                        : errorMessage,
                );
                setPending(false);
            });
    };

    return (
        <Container>
            {accountShare === null ? (
                <PageLoader />
            ) : (
                <>
                    <ModalTitle>Remove liquidity</ModalTitle>
                    <PairContainer>
                        <Market assets={pool.assets} />
                    </PairContainer>
                    <InputStyled
                        label="Amount to remove"
                        postfix="%"
                        value={percent}
                        onChange={({ target }) => onInputChange(target.value)}
                    />
                    <RangeInput onChange={value => setPercent(value.toString())} value={+percent} />

                    <Details>
                        {pool.assets.map(asset => (
                            <DescriptionRow key={getAssetString(asset)}>
                                <span>Will receive {asset.code}</span>
                                <span>
                                    {totalShares === null || reserves === null ? (
                                        <DotsLoader />
                                    ) : Number(totalShares) === 0 ? (
                                        '0'
                                    ) : (
                                        formatBalance(
                                            (((+percent / 100) * accountShare) / totalShares) *
                                                reserves.get(getAssetString(asset)),
                                        )
                                    )}
                                </span>
                            </DescriptionRow>
                        ))}
                    </Details>

                    <StyledButton isBig pending={pending} onClick={() => withdraw()}>
                        Remove
                    </StyledButton>
                </>
            )}
        </Container>
    );
};

export default WithdrawFromPool;
