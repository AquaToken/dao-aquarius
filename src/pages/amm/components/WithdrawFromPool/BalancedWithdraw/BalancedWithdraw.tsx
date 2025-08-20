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
import { Int128Parts } from 'types/stellar';
import { SorobanToken, TokenType } from 'types/token';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import { Checkbox } from 'basics/inputs';
import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';
import DotsLoader from 'basics/loaders/DotsLoader';
import { StickyButtonWrapper } from 'basics/ModalAtoms';

import NoTrustline from 'components/NoTrustline';

import SuccessModal from 'pages/amm/components/SuccessModal/SuccessModal';

const StyledButton = styled(Button)`
    margin-top: 5rem;
    margin-left: auto;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        margin-top: 2rem;
    `}
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

    ${respondDown(Breakpoints.sm)`
        input {
            padding: 1rem;
            font-size: 1.4rem;
        }
    `}
`;

const RangeInputStyled = styled(RangeInput)`
    flex: 2.8;
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
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }
`;

interface Props {
    pool: PoolExtended;
    totalShares: string;
    reserves: Map<string, string>;
    rewards: number;
    accountShare: string;
    close: () => void;
}

const BalancedWithdraw = ({ pool, totalShares, reserves, rewards, accountShare, close }: Props) => {
    const [percent, setPercent] = useState('100');
    const [pending, setPending] = useState(false);
    const [withClaim, setWithClaim] = useState(false);

    const { account } = useAuthStore();

    const { aquaStellarAsset } = getAquaAssetData();

    useEffect(() => {
        if (rewards) {
            setWithClaim(true);
        }
    }, [rewards]);

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
                ? await SorobanService.amm.getWithdrawAndClaim(
                      account?.accountId(),
                      pool.address,
                      amount,
                      pool.tokens,
                      pool.share_token_address,
                  )
                : await SorobanService.amm.getWithdrawTx(
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
                                        (((+percent / 100) * +accountShare) / +totalShares) *
                                        +reserves.get(getAssetString(asset))
                                    ).toFixed((asset as SorobanToken).decimal ?? 7),
                                )
                            )}
                            <AssetLogo asset={asset} isSmall />
                        </span>
                    </DescriptionRow>
                ))}

                {pool.tokens
                    .filter(token => token.type === TokenType.classic)
                    .map(token => (
                        <NoTrustline asset={token} key={token.contract} />
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

            <StickyButtonWrapper>
                <StyledButton
                    isBig
                    pending={pending}
                    onClick={() => withdraw()}
                    disabled={pool.tokens
                        .filter(token => token.type === TokenType.classic)
                        .some(token => account.getAssetBalance(token) === null)}
                >
                    Remove
                </StyledButton>
            </StickyButtonWrapper>
        </>
    );
};

export default BalancedWithdraw;
