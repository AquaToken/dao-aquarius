import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useMemo, useState } from 'react';
import styled from 'styled-components';

import { getAssetString } from 'helpers/assets';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { Pool } from 'types/amm';
import { ModalProps } from 'types/modal';
import { Asset, PoolClassic } from 'types/stellar';

import { ModalService, StellarService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';
import Market from 'basics/Market';
import { ModalWrapper, ModalTitle, StickyButtonWrapper } from 'basics/ModalAtoms';

import { PairContainer } from 'pages/amm/components/WithdrawFromPool/WithdrawFromPool';

import MigrateLiquidityStep2 from './MigrateLiquidityStep2';

import { respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';

export const Stepper = styled.div`
    font-size: 1.4rem;
    line-height: 1.6rem;
    letter-spacing: 0.2em;
    color: ${COLORS.descriptionText}B3;
    margin-bottom: 0.8rem;
`;

const StyledInput = styled(Input)`
    margin: 5.8rem 0 4rem;
`;

const StyledButton = styled(Button)`
    margin-top: 4.8rem;
    margin-left: auto;
`;

const AmountRow = styled.div<{ $isFirst?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${COLORS.grayText};
    margin-top: ${({ $isFirst }) => ($isFirst ? '3rem' : '1.2rem')};

    ${respondDown(Breakpoints.md)`
        span:first-child {
            display: none;
        }
    `}
`;

const Amounts = styled.span`
    display: flex;
    align-items: center;
    font-size: 1.6rem;

    span {
        margin-left: 0.8rem;
    }

    ${respondDown(Breakpoints.md)`
        font-size: 1.2rem;
    `}
`;

const AmountWithdraw = styled.span`
    color: ${COLORS.paragraphText};

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
    `}
`;

interface MigrateLiquidityStep1Params {
    poolsToMigrate: Pool[];
    base: Asset;
    counter: Asset;
    pool: PoolClassic;
    onUpdate: () => void;
}

const MigrateLiquidityStep1 = ({ params, confirm }: ModalProps<MigrateLiquidityStep1Params>) => {
    const { base, counter, pool, poolsToMigrate, onUpdate } = params;

    const { account } = useAuthStore();

    const [percent, setPercent] = useState(100);
    const [pending, setPending] = useState(false);
    const setPercentValue = ({ target }) => {
        const { value } = target;
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

    const amountsToWithdraw = useMemo(() => {
        if (!account) {
            return {
                baseAmount: 0,
                baseLeft: 0,
                counterAmount: 0,
                counterLeft: 0,
                shareToWithdraw: 0,
            };
        }
        const balance = account.getPoolBalance(pool.id);
        const sharePart = new BigNumber(balance).div(new BigNumber(pool.total_shares));

        const baseTotal = pool.reserves.find(reserve => reserve.asset === getAssetString(base));
        const counterTotal = pool.reserves.find(
            reserve => reserve.asset === getAssetString(counter),
        );

        const baseUserTotal = sharePart.times(new BigNumber(baseTotal.amount));
        const counterUserTotal = sharePart.times(new BigNumber(counterTotal.amount));

        const baseWithdrawAmount = baseUserTotal.times(new BigNumber(+percent)).div(100);
        const counterWithdrawAmount = counterUserTotal.times(new BigNumber(+percent)).div(100);

        return {
            baseAmount: baseWithdrawAmount.toFixed(7),
            baseLeft: baseUserTotal.minus(baseWithdrawAmount).toFixed(7),
            counterAmount: counterWithdrawAmount.toFixed(7),
            counterLeft: counterUserTotal.minus(counterWithdrawAmount).toFixed(7),
            shareToWithdraw: new BigNumber(balance)
                .times(new BigNumber(+percent))
                .div(100)
                .toFixed(7),
        };
    }, [percent, pool, account]);

    const submit = async () => {
        setPending(true);

        const ops = StellarService.createWithdrawOperation(
            pool.id,
            amountsToWithdraw.shareToWithdraw,
            base,
            counter,
            amountsToWithdraw.baseAmount,
            amountsToWithdraw.counterAmount,
            Number(percent) === 100,
        );

        const tx = await StellarService.buildTx(account, ops);

        account
            .signAndSubmitTx(tx, false, () =>
                poolsToMigrate
                    ? ModalService.openModal(MigrateLiquidityStep2, {
                          poolsToMigrate,
                          base,
                          counter,
                          baseAmount: amountsToWithdraw.baseAmount,
                          counterAmount: amountsToWithdraw.counterAmount,
                          onUpdate,
                      })
                    : void 0,
            )
            .then(res => {
                setPending(false);

                if (onUpdate) {
                    onUpdate();
                }

                if (!poolsToMigrate) {
                    confirm();
                }

                if (
                    (res as { status: BuildSignAndSubmitStatuses })?.status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }
                ToastService.showSuccessToast('Withdrawal successfully');
                confirm();
            })
            .catch(e => {
                const errorText = ErrorHandler(e);
                ToastService.showErrorToast(errorText);
                setPending(false);
            });
    };

    return (
        <ModalWrapper $isWide>
            {Boolean(poolsToMigrate) && <Stepper>STEP 1/2</Stepper>}
            <ModalTitle>Withdraw from classic pool</ModalTitle>
            <PairContainer>
                <Market assets={[base, counter]} verticalDirections withoutLink />
            </PairContainer>
            <StyledInput
                label="Amount to migrate"
                value={percent.toString()}
                onChange={(e: React.SyntheticEvent<HTMLInputElement>) => setPercentValue(e)}
                postfix="%"
                inputMode="decimal"
            />
            <RangeInput onChange={setPercent} value={Number(percent)} />
            <AmountRow $isFirst>
                <span>{base.code} amount</span>
                <Amounts>
                    <AssetLogo asset={base} />
                    <AmountWithdraw>
                        {formatBalance(+amountsToWithdraw.baseAmount, true)} {base.code}
                    </AmountWithdraw>
                    {Boolean(+amountsToWithdraw.baseLeft) && (
                        <span>
                            ({formatBalance(+amountsToWithdraw.baseLeft, true)} {base.code} left)
                        </span>
                    )}
                </Amounts>
            </AmountRow>

            <AmountRow>
                <span>{counter.code} amount</span>
                <Amounts>
                    <AssetLogo asset={counter} />
                    <AmountWithdraw>
                        {formatBalance(+amountsToWithdraw.counterAmount, true)} {counter.code}
                    </AmountWithdraw>
                    {Boolean(+amountsToWithdraw.counterLeft) && (
                        <span>
                            ({formatBalance(+amountsToWithdraw.counterLeft, true)} {counter.code}{' '}
                            left)
                        </span>
                    )}
                </Amounts>
            </AmountRow>

            <StickyButtonWrapper>
                <StyledButton
                    isBig
                    disabled={!Number(percent)}
                    onClick={() => submit()}
                    pending={pending}
                >
                    withdraw
                </StyledButton>
            </StickyButtonWrapper>
        </ModalWrapper>
    );
};

export default MigrateLiquidityStep1;
