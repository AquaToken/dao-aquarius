import { xdr } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAquaAssetData, getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, SorobanService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';
import { Int128Parts } from 'types/stellar';
import { SorobanToken, TokenType } from 'types/token';

import { customScroll, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';
import { Checkbox } from 'basics/inputs';
import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import { ModalTitle } from 'basics/ModalAtoms';

import NoTrustline from 'components/NoTrustline';

import SuccessModal from '../SuccessModal/SuccessModal';

const Container = styled.div`
    width: 52.3rem;
    max-height: 95vh;
    overflow-y: auto;
    ${customScroll};

    ${respondDown(Breakpoints.md)`
        width: 100%;
        max-height: unset;
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

const Details = styled.div<{ $withBorder: boolean }>`
    display: flex;
    flex-direction: column;
    margin-top: 3.2rem;
    padding-bottom: ${({ $withBorder }) => ($withBorder ? '3.2rem' : '0')};
    border-bottom: ${({ $withBorder }) => ($withBorder ? `0.1rem dashed ${COLORS.gray}` : 'none')};
    margin-bottom: ${({ $withBorder }) => ($withBorder ? '3.2rem' : '0')};
`;

const DescriptionRow = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 1.6rem;
    color: ${COLORS.grayText};

    span:last-child {
        color: ${COLORS.paragraphText};
    }
`;

const WithdrawFromPool = ({ params, close }: ModalProps<{ pool: PoolExtended }>) => {
    const { pool } = params;
    const [accountShare, setAccountShare] = useState(null);
    const [percent, setPercent] = useState('100');
    const [pending, setPending] = useState(false);
    const [totalShares, setTotalShares] = useState(null);
    const [reserves, setReserves] = useState(null);
    const [rewards, setRewards] = useState(null);
    const [withClaim, setWithClaim] = useState(false);

    const { account } = useAuthStore();

    const { aquaStellarAsset } = getAquaAssetData();

    useEffect(() => {
        SorobanService.getTotalShares(pool.address).then(res => {
            setTotalShares(res);
        });
    }, []);

    useEffect(() => {
        SorobanService.getPoolReserves(pool.tokens, pool.address).then(res => {
            setReserves(res);
        });
    }, []);

    useEffect(() => {
        SorobanService.getPoolRewards(account.accountId(), pool.address).then(res => {
            setRewards(Number(res.to_claim));

            if (Number(res.to_claim)) {
                setWithClaim(true);
            }
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

    const withdraw = async () => {
        const noTrustAssets = pool.tokens.filter(
            asset => asset.type !== TokenType.soroban && account.getAssetBalance(asset) === null,
        );

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
            .toFixed(pool.share_token_decimals);

        try {
            const tx = withClaim
                ? await SorobanService.getWithdrawAndClaim(
                      account?.accountId(),
                      pool.address,
                      amount,
                      pool.tokens,
                      pool.share_token_address,
                  )
                : await SorobanService.getWithdrawTx(
                      account?.accountId(),
                      pool.address,
                      amount,
                      pool.tokens,
                      pool.share_token_address,
                  );

            const hash = tx.hash().toString('hex');
            const result: {
                value?: () =>
                    | { value: () => Int128Parts }[]
                    | { value: () => { value: () => Int128Parts }[] }[];
                status?: BuildSignAndSubmitStatuses;
            } = await account.signAndSubmitTx(tx, true);

            setPending(false);

            if (!result) {
                return;
            }

            close();

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }

            const resultValues: xdr.ScVal[] = withClaim
                ? (result.value()[0].value() as xdr.ScVal[])
                : (result.value() as xdr.ScVal[]);

            pool.tokens.forEach((token, index) => {
                if (token.type === TokenType.soroban) {
                    const resAmount = SorobanService.i128ToInt(resultValues[index], token.decimal);

                    ToastService.showSuccessToast(
                        `Payment received: ${formatBalance(Number(resAmount))} ${token.code}`,
                    );
                }
            });

            ModalService.openModal(SuccessModal, {
                assets: pool.tokens,
                amounts: resultValues.map((val, index) =>
                    SorobanService.i128ToInt(val, (pool.tokens[index] as SorobanToken).decimal),
                ),
                title: 'Withdraw Successful',
                hash,
            });
        } catch (e) {
            const errorMessage = e.message ?? e.toString() ?? 'Oops! Something went wrong';
            ToastService.showErrorToast(
                errorMessage === 'The amount is too small to deposit to this pool'
                    ? 'The amount is too small to withdraw from this pool'
                    : errorMessage,
            );
            setPending(false);
        }
    };

    return (
        <Container>
            {accountShare === null ? (
                <PageLoader />
            ) : (
                <>
                    <ModalTitle>Remove liquidity</ModalTitle>
                    <PairContainer>
                        <Market assets={pool.tokens} />
                    </PairContainer>
                    <InputStyled
                        label="Amount to remove"
                        postfix="%"
                        value={percent}
                        onChange={({ target }) => onInputChange(target.value)}
                        inputMode="decimal"
                    />
                    <RangeInput onChange={value => setPercent(value.toString())} value={+percent} />

                    <Details $withBorder={Boolean(rewards)}>
                        {pool.tokens.map(asset => (
                            <DescriptionRow key={getAssetString(asset)}>
                                <span>Will receive {asset.code}</span>
                                <span>
                                    {totalShares === null || reserves === null ? (
                                        <DotsLoader />
                                    ) : Number(totalShares) === 0 ? (
                                        '0'
                                    ) : (
                                        formatBalance(
                                            +(
                                                (((+percent / 100) * accountShare) / totalShares) *
                                                reserves.get(getAssetString(asset))
                                            ).toFixed((asset as SorobanToken).decimal ?? 7),
                                        )
                                    )}
                                </span>
                            </DescriptionRow>
                        ))}
                    </Details>

                    {Boolean(rewards) && (
                        <Checkbox
                            checked={withClaim}
                            onChange={setWithClaim}
                            label={`Claim rewards: ${formatBalance(rewards, true)} AQUA`}
                        />
                    )}

                    {withClaim && <NoTrustline asset={aquaStellarAsset} />}

                    <StyledButton isBig pending={pending} onClick={() => withdraw()}>
                        Remove
                    </StyledButton>
                </>
            )}
        </Container>
    );
};

export default WithdrawFromPool;
