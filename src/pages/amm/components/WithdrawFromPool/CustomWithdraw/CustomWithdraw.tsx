import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

import { WITHDRAW_CUSTOM_SLIPPAGE } from 'constants/withdraw';

import { getAquaAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useDebounce } from 'hooks/useDebounce';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, SorobanService, ToastService } from 'services/globalServices';
import { estimateCustomWithdraw } from 'services/soroban/contracts/ammContract';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { PoolExtended, PoolIncentives } from 'types/amm';
import { Int128Parts } from 'types/stellar';
import { TokenType } from 'types/token';

import Input from 'web/basics/inputs/Input';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import ErrorMessage from 'basics/ErrorMessage';
import { Checkbox } from 'basics/inputs';
import { StickyButtonWrapper } from 'basics/ModalAtoms';

import NoTrustline from 'components/NoTrustline';

import SuccessModal from 'pages/amm/components/SuccessModal/SuccessModal';

const InputStyled = styled(Input)`
    margin-bottom: 3.2rem;
    margin-top: 5rem;
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
    margin: 0.8rem 0;

    span {
        display: flex;
        align-items: center;

        svg {
            margin: 0 0.4rem;
        }
    }
`;

const CheckboxStyled = styled(Checkbox)`
    margin-top: 1.2rem;
`;

interface Props {
    pool: PoolExtended;
    rewards: number;
    accountShare: string;
    close: () => void;
    incentives: PoolIncentives[];
}

const CustomWithdraw = ({ pool, accountShare, rewards, close, incentives }: Props) => {
    const [amounts, setAmounts] = useState(new Map());
    const [withClaimRewards, setWithClaimRewards] = useState(false);
    const [withClaimIncentives, setWithClaimIncentives] = useState(false);
    const [isInsufficient, setIsInsufficient] = useState(false);
    const [estimatedValue, setEstimatedValue] = useState(null);
    const [pending, setPending] = useState(false);

    const debouncedAmounts = useDebounce(amounts, 700, true);

    const { aquaStellarAsset } = getAquaAssetData();

    const { account } = useAuthStore();

    useEffect(() => {
        if (rewards) {
            setWithClaimRewards(true);
        }
    }, [rewards]);

    useEffect(() => {
        const map = new Map();
        pool.tokens.forEach(token => {
            map.set(token.contract, '');
        });
        setAmounts(map);
    }, []);

    const onInputChange = (token, amount) => {
        const value = amount.replaceAll(',', '');
        const map = new Map(amounts.entries());

        map.set(token.contract, value);

        setEstimatedValue(null);
        setAmounts(map);
    };

    const hasAmount = amounts.size && [...amounts.values()].some(val => Boolean(Number(val)));

    const hasIncentivesToClaim =
        incentives &&
        Boolean(incentives.length) &&
        incentives.some(incentive => Boolean(Number(incentive.info.user_reward)));

    const sharesToRemove = useMemo(() => {
        if (!estimatedValue) return null;

        const valueWithSlippage = (estimatedValue * (1 + WITHDRAW_CUSTOM_SLIPPAGE)).toFixed(
            pool.share_token_decimals,
        );

        return Number(valueWithSlippage) > Number(accountShare) ? accountShare : valueWithSlippage;
    }, [estimatedValue]);

    useEffect(() => {
        setIsInsufficient(false);
        if (!hasAmount) {
            setEstimatedValue(null);
            return;
        }

        estimateCustomWithdraw(
            account.accountId(),
            pool.address,
            accountShare,
            debouncedAmounts,
            pool.tokens,
            pool.share_token_address,
        )
            .then(res => {
                setEstimatedValue(res);
            })
            .catch(() => {
                setIsInsufficient(true);
                setEstimatedValue(null);
            });
    }, [debouncedAmounts]);

    const withdraw = async () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);

        try {
            const tx = await SorobanService.amm.getCustomWithdrawAndClaim(
                account.accountId(),
                pool.address,
                sharesToRemove,
                amounts,
                pool.tokens,
                pool.share_token_address,
                withClaimRewards,
                withClaimIncentives,
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

            pool.tokens.forEach(token => {
                if (token.type === TokenType.soroban) {
                    if (!Number(amounts.get(token))) return;

                    ToastService.showSuccessToast(
                        `Payment received: ${formatBalance(Number(amounts.get(token)))} ${
                            token.code
                        }`,
                    );
                }
            });

            ModalService.openModal(SuccessModal, {
                assets: pool.tokens,
                amounts: [...amounts.values()],
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
            {pool.tokens.map(token => (
                <NumericFormat
                    key={token.contract}
                    value={amounts.get(token.contract)}
                    onChange={({ target }) => onInputChange(token, target.value)}
                    placeholder={`Enter ${token.code} amount`}
                    customInput={InputStyled}
                    label={`${token.code} to remove`}
                    postfix={<Asset asset={token} logoAndCode />}
                    inputMode="decimal"
                    allowedDecimalSeparators={[',']}
                    thousandSeparator=","
                    decimalScale={token.decimal}
                    allowNegative={false}
                    disabled={
                        token.type !== TokenType.soroban && account.getAssetBalance(token) === null
                    }
                />
            ))}

            <Summary>
                <span>You have</span>

                <span>{formatBalance(+accountShare)} shares</span>
            </Summary>

            {!!sharesToRemove && (
                <Summary>
                    <span>You remove</span>

                    <span>{formatBalance(+sharesToRemove)} shares</span>
                </Summary>
            )}

            {isInsufficient && (
                <ErrorMessage text="The withdraw amount requested exceeds the amount of pool shares available" />
            )}

            {pool.tokens
                .filter(token => token.type === TokenType.classic)
                .map(token => (
                    <NoTrustline asset={token} key={token.contract} />
                ))}

            <Divider />

            {Boolean(rewards) && (
                <Checkbox
                    checked={withClaimRewards}
                    onChange={setWithClaimRewards}
                    label={`Claim rewards: ${formatBalance(rewards, true)} AQUA`}
                />
            )}

            {hasIncentivesToClaim && (
                <CheckboxStyled
                    checked={withClaimIncentives}
                    onChange={setWithClaimIncentives}
                    label={`Claim incentives: ${incentives
                        .filter(incentive => Boolean(Number(incentive.info.user_reward)))
                        .map(
                            incentive =>
                                `${formatBalance(+incentive.info.user_reward, true)} ${
                                    incentive.token.code
                                }`,
                        )
                        .join(', ')}`}
                />
            )}

            {withClaimRewards && <NoTrustline asset={aquaStellarAsset} />}

            {withClaimIncentives &&
                incentives
                    .filter(incentive => Boolean(Number(incentive.info.user_reward)))
                    .map(incentive => (
                        <NoTrustline key={incentive.token.contract} asset={incentive.token} />
                    ))}

            <StickyButtonWrapper>
                <StyledButton
                    isBig
                    disabled={!hasAmount || isInsufficient || !estimatedValue}
                    onClick={() => withdraw()}
                    pending={pending}
                >
                    Remove
                </StyledButton>
            </StickyButtonWrapper>
        </>
    );
};

export default CustomWithdraw;
