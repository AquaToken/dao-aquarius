import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../styles';
import { ModalContainer, ModalTitle } from '../atoms/ModalAtoms';
import Pair from '../../../pages/vote/components/common/Pair';
import { PairContainer } from '../../../pages/amm/components/WithdrawFromPool/WithdrawFromPool';
import Input from '../../basics/Input';
import RangeInput from '../../basics/RangeInput';
import Button from '../../basics/Button';
import { useMemo, useState } from 'react';
import AssetLogo from '../../../pages/vote/components/AssetDropdown/AssetLogo';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { formatBalance, getAssetString } from '../../helpers/helpers';
import BigNumber from 'bignumber.js';
import { ModalService, StellarService } from '../../services/globalServices';
import MigrateLiquidityStep2 from './MigrateLiquidityStep2';

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

const AmountRow = styled.div<{ isFirst?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${COLORS.grayText};
    margin-top: ${({ isFirst }) => (isFirst ? '3rem' : '1.2rem')};
`;

const Amounts = styled.span`
    display: flex;
    align-items: center;
    font-size: 1.6rem;

    span {
        margin-left: 0.8rem;
    }
`;

const AmountWithdraw = styled.span`
    color: ${COLORS.paragraphText};
`;

const MigrateLiquidityStep1 = ({ params }) => {
    const { base, counter, pool, poolsToMigrate } = params;

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

        const baseTotal = pool.reserves.find((reserve) => reserve.asset === getAssetString(base));
        const counterTotal = pool.reserves.find(
            (reserve) => reserve.asset === getAssetString(counter),
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
        const op = StellarService.createWithdrawOperation(
            pool.id,
            amountsToWithdraw.shareToWithdraw,
            base,
            counter,
            amountsToWithdraw.baseAmount,
            amountsToWithdraw.counterAmount,
        );

        const tx = await StellarService.buildTx(account, op);

        account
            .signAndSubmitTx(tx, false, () =>
                ModalService.openModal(MigrateLiquidityStep2, {
                    poolsToMigrate,
                    base,
                    counter,
                    baseAmount: amountsToWithdraw.baseAmount,
                    counterAmount: amountsToWithdraw.counterAmount,
                }),
            )
            .then(() => {
                setPending(false);
            })
            .catch(() => {
                setPending(false);
            });
    };

    return (
        <ModalContainer isWide>
            <Stepper>STEP 1/2</Stepper>
            <ModalTitle>Withdraw from classic pool</ModalTitle>
            <PairContainer>
                <Pair base={base} counter={counter} verticalDirections withoutLink />
            </PairContainer>
            <StyledInput
                label="Amount to migrate"
                value={percent.toString()}
                onChange={(e) => setPercentValue(e)}
                postfix="%"
            />
            <RangeInput onChange={setPercent} value={Number(percent)} />
            <AmountRow isFirst>
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

            <StyledButton
                isBig
                disabled={!Number(percent)}
                onClick={() => submit()}
                pending={pending}
            >
                withdraw
            </StyledButton>
        </ModalContainer>
    );
};

export default MigrateLiquidityStep1;
