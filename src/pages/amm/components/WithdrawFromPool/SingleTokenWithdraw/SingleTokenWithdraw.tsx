import { xdr } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { WITHDRAW_ONE_COIN_SLIPPAGE } from 'constants/withdraw';

import { getAquaAssetData, getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useDebounce } from 'hooks/useDebounce';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, SorobanService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { PoolExtended } from 'types/amm';
import { Int128Parts } from 'types/stellar';
import { SorobanToken, TokenType } from 'types/token';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Info from 'assets/icon-info.svg';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import { Checkbox } from 'basics/inputs';
import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';
import { DotsLoader } from 'basics/loaders';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import NoTrustline from 'components/NoTrustline';

import SuccessModal from 'pages/amm/components/SuccessModal/SuccessModal';

const Label = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    margin-bottom: 0.8rem;
`;

const FormRow = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 3.2rem;
    margin-top: 5rem;
    gap: 2.4rem;
    padding: 0 0.2rem;
`;

const InputStyled = styled(Input)`
    flex: 1;
`;

const RangeInputStyled = styled(RangeInput)`
    flex: 2.8;
`;

const TokenPicker = styled.div`
    display: flex;
    border: 0.1rem solid ${COLORS.gray};
    border-radius: 0.5rem;
`;

const Token = styled.div<{ $isSelected: boolean }>`
    flex: 1;
    ${flexAllCenter};
    height: 6.6rem;
    cursor: pointer;
    background-color: ${({ $isSelected }) => ($isSelected ? COLORS.gray : COLORS.transparent)};

    &:not(:last-child) {
        border-right: 0.1rem solid ${COLORS.gray};
    }
`;

const StyledButton = styled(Button)`
    margin-top: 5rem;
    margin-left: auto;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        margin-top: 2rem;
    `}
`;

const Divider = styled.div`
    border-top: 0.1rem dashed ${COLORS.gray};
    margin-top: 3.2rem;
    padding-top: 3.2rem;
`;

const Summary = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 3.2rem;

    span {
        display: flex;
        align-items: center;

        svg {
            margin: 0 0.4rem;
        }
    }
`;

const InputInner = styled.span`
    width: 20rem;
    white-space: normal;
    font-size: 1.2rem;
`;

interface Props {
    pool: PoolExtended;
    rewards: number;
    accountShare: string;
    close: () => void;
}

const SingleTokenWithdraw = ({ pool, rewards, accountShare, close }: Props) => {
    const [percent, setPercent] = useState('100');
    const [pending, setPending] = useState(false);
    const [withClaim, setWithClaim] = useState(false);
    const [selectedToken, setSelectedToken] = useState(pool.tokens[0]);
    const [estimateWithdraw, setEstimateWithdraw] = useState(null);

    const { aquaStellarAsset } = getAquaAssetData();

    const { account } = useAuthStore();

    const debouncedPercent = useDebounce(percent, 700, true);

    useEffect(() => {
        if (rewards) {
            setWithClaim(true);
        }
    }, [rewards]);

    useEffect(() => {
        setEstimateWithdraw(null);
        SorobanService.amm
            .getSingleTokenWithdrawEstimate(
                pool.address,
                pool.tokens,
                ((+accountShare * +debouncedPercent) / 100).toFixed(7),
            )
            .then(setEstimateWithdraw);
    }, [debouncedPercent]);

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
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);

        const tokenIndex = pool.tokens.findIndex(
            token => getAssetString(token) === getAssetString(selectedToken),
        );

        const shareToWithdraw = new BigNumber(accountShare.toString())
            .times(new BigNumber(percent))
            .div(100)
            .toFixed(pool.share_token_decimals);

        const minimumAmount = new BigNumber(estimateWithdraw.get(selectedToken.contract))
            .times(1 - WITHDRAW_ONE_COIN_SLIPPAGE)
            .toFixed(selectedToken.decimal);

        try {
            const tx = withClaim
                ? await SorobanService.amm.getSingleTokenWithdrawAndClaim(
                      account.accountId(),
                      pool.address,
                      shareToWithdraw,
                      tokenIndex,
                      minimumAmount,
                      pool.share_token_address,
                  )
                : await SorobanService.amm.getSingleCoinWithdrawTx(
                      account.accountId(),
                      pool.address,
                      shareToWithdraw,
                      tokenIndex,
                      minimumAmount,
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
                    const resAmount = SorobanService.scVal.i128ToInt(
                        resultValues[index],
                        token.decimal,
                    );

                    ToastService.showSuccessToast(
                        `Payment received: ${formatBalance(Number(resAmount))} ${token.code}`,
                    );
                }
            });

            ModalService.openModal(SuccessModal, {
                assets: pool.tokens,
                amounts: resultValues.map((val, index) =>
                    SorobanService.scVal.i128ToInt(
                        val,
                        (pool.tokens[index] as SorobanToken).decimal,
                    ),
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
        <>
            <Label>Select token</Label>
            <TokenPicker>
                {pool.tokens.map(token => (
                    <Token
                        key={getAssetString(token)}
                        $isSelected={getAssetString(selectedToken) === getAssetString(token)}
                        onClick={() => setSelectedToken(token)}
                    >
                        <Asset asset={token} logoAndCode />
                    </Token>
                ))}
            </TokenPicker>

            <FormRow>
                <InputStyled
                    postfix="%"
                    value={percent}
                    onChange={({ target }) => onInputChange(target.value)}
                    inputMode="decimal"
                />
                <RangeInputStyled
                    onChange={value => setPercent(value.toString())}
                    value={+percent}
                />
            </FormRow>

            <Summary>
                <span>You get</span>
                {estimateWithdraw ? (
                    <span>
                        {formatBalance(estimateWithdraw.get(selectedToken.contract))}{' '}
                        {selectedToken.code}
                    </span>
                ) : (
                    <DotsLoader />
                )}
            </Summary>

            <Summary>
                <span>Minimum to receive</span>
                {estimateWithdraw ? (
                    <span>
                        {formatBalance(estimateWithdraw.get(selectedToken.contract) * 0.99)}{' '}
                        {selectedToken.code}
                        <Tooltip
                            content={
                                <InputInner>
                                    The exact amount might differ because it depends on your current
                                    pool share. While the transaction is being executed some other
                                    users might add or withdraw funds from the same pool and your
                                    share will slightly change. We put 1% safety margin (slippage
                                    tolerance) value as default. If the difference between your pool
                                    share on withdrawal initiation and the transaction execution
                                    exceeds 1% then the transaction will be reverted.
                                </InputInner>
                            }
                            showOnHover
                            position={TOOLTIP_POSITION.left}
                        >
                            <Info />
                        </Tooltip>
                    </span>
                ) : (
                    <DotsLoader />
                )}
            </Summary>

            {selectedToken.type === TokenType.classic && <NoTrustline asset={selectedToken} />}

            <Divider />

            {Boolean(rewards) && (
                <Checkbox
                    checked={withClaim}
                    onChange={setWithClaim}
                    label={`Claim rewards: ${formatBalance(rewards, true)} AQUA`}
                />
            )}

            {withClaim && <NoTrustline asset={aquaStellarAsset} />}

            <StyledButton
                isBig
                pending={pending}
                onClick={() => withdraw()}
                disabled={
                    !Number(percent) ||
                    (selectedToken.type === TokenType.classic &&
                        account.getAssetBalance(selectedToken) === null)
                }
            >
                Remove
            </StyledButton>
        </>
    );
};

export default SingleTokenWithdraw;
