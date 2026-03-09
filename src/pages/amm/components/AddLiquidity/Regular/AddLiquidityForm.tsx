import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';

import { POOL_TYPE } from 'constants/amm';

import { contractValueToAmount } from 'helpers/amount';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { getPercentValue } from 'helpers/number';
import { calculateBoostValue, calculateDailyRewards } from 'helpers/rewards';

import { useDebounce } from 'hooks/useDebounce';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService, StellarService } from 'services/globalServices';

import { PoolExtended, PoolIncentives, PoolRewardsInfo } from 'types/amm';
import { SorobanToken, Token, TokenType } from 'types/token';

import Arrow from 'assets/icons/arrows/arrow-alt2-16.svg';
import Info from 'assets/icons/status/icon-info-16.svg';

import Alert from 'basics/Alert';
import Asset from 'basics/Asset';
import Input from 'basics/inputs/Input';
import Label from 'basics/Label';
import DotsLoader from 'basics/loaders/DotsLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { COLORS } from 'styles/style-constants';

import {
    Balance,
    BalanceClickable,
    CheckboxStyled,
    DescriptionRow,
    Form,
    FormRow,
    PoolInfo,
    PoolRates,
    RevertIcon,
    TooltipInnerBalance,
    TooltipRow,
} from './AddLiquidity.styled';

export type AddLiquidityFormData = {
    amounts: Map<string, string>;
    balances: Map<string, number> | null;
    hasAllAmounts: boolean;
    hasAnyAmount: boolean;
    isBalancedDeposit: boolean;
};

type SwapReserve = {
    label: string;
    value: number;
};

type AddLiquidityFormProps = {
    pool: PoolExtended;
    showPoolSummaryRows?: boolean;
    withPoolInfoCardSpacing?: boolean;
    baseAmount?: string;
    counterAmount?: string;
    base?: Token;
    counter?: Token;
    onDataChange?: (data: AddLiquidityFormData) => void;
};

const AddLiquidityForm = ({
    pool,
    showPoolSummaryRows = true,
    withPoolInfoCardSpacing = true,
    baseAmount,
    counterAmount,
    base,
    counter,
    onDataChange,
}: AddLiquidityFormProps): React.ReactNode => {
    const { account } = useAuthStore();

    const [accountShare, setAccountShare] = useState<string | null>(null);
    const [assetsReserves, setAssetsReserves] = useState<SwapReserve[][] | null>(null);
    const [poolRewards, setPoolRewards] = useState<PoolRewardsInfo>(null);
    const [balances, setBalances] = useState<Map<string, number> | null>(null);
    const [amounts, setAmounts] = useState<Map<string, string>>(
        new Map<string, string>(pool.tokens.map(asset => [getAssetString(asset), ''])),
    );
    const [isBalancedDeposit, setIsBalancedDeposit] = useState(true);
    const [priceIndex, setPriceIndex] = useState(0);
    const [incentives, setIncentives] = useState<PoolIncentives[] | null>(null);
    const [isRewardsEnabled, setIsRewardsEnabled] = useState<boolean | null>(null);
    const [depositShares, setDepositShares] = useState<number | null>(null);
    const [newWorkingBalance, setNewWorkingBalance] = useState<number | null>(null);
    const [newWorkingSupply, setNewWorkingSupply] = useState<number | null>(null);

    useEffect(() => {
        if (!account) {
            return;
        }

        SorobanService.amm
            .getUserRewardsStatus(pool.address, account.accountId())
            .then(setIsRewardsEnabled);
    }, [account, pool.address]);

    useEffect(() => {
        if (!account) {
            setAssetsReserves(null);
            return;
        }

        Promise.all(pool.tokens.map(asset => account.getReservesForSwap(asset))).then(res => {
            setAssetsReserves(res);
        });
    }, [account, pool]);

    useEffect(() => {
        if (!account) {
            setBalances(null);
            return;
        }

        const sorobanTokens = pool.tokens.filter(({ type }) => type === TokenType.soroban);
        Promise.all(
            sorobanTokens.map((asset: SorobanToken) => account.getAssetBalance(asset)),
        ).then(res => {
            const result = new Map<string, number>();
            sorobanTokens.forEach((token, index) => {
                result.set(getAssetString(token), Number(res[index] ?? 0));
            });

            setBalances(result);
        });
    }, [account, pool.tokens]);

    useEffect(() => {
        if (!account) {
            setAccountShare(null);
            return;
        }

        SorobanService.token
            .getTokenBalance(pool.share_token_address, account.accountId())
            .then(res => {
                setAccountShare(res);
            });
    }, [account, pool.share_token_address]);

    useEffect(() => {
        if (!account) {
            setPoolRewards(null);
            return;
        }

        SorobanService.amm.getPoolRewards(account.accountId(), pool.address).then(setPoolRewards);
    }, [account, pool.address]);

    useEffect(() => {
        if (!account) {
            setIncentives(null);
            return;
        }

        SorobanService.amm.getPoolIncentives(account.accountId(), pool.address).then(setIncentives);
    }, [account, pool.address]);

    const reserves: Map<string, number> = useMemo(
        () =>
            new Map(
                pool.tokens.map((asset, index) => [
                    getAssetString(asset),
                    +contractValueToAmount(
                        pool.reserves[index],
                        (pool.tokens[index] as SorobanToken).decimal,
                    ),
                ]) as [string, number][],
            ),
        [pool],
    );

    const hasAllAmounts = useMemo(
        () => [...amounts.values()].every(value => Boolean(+value)),
        [amounts],
    );
    const hasAnyAmount = useMemo(
        () => [...amounts.values()].some(value => Boolean(+value)),
        [amounts],
    );

    const rates: Map<string, string> = useMemo(() => {
        if (Number(pool.total_share) === 0 && !hasAllAmounts) {
            return null;
        }

        const map = new Map<string, string>();

        pool.tokens.forEach(asset => {
            const otherAssets = pool.tokens
                .filter(token => getAssetString(token) !== getAssetString(asset))
                .map(
                    token =>
                        `${formatBalance(
                            Number(pool.total_share) === 0
                                ? +amounts.get(getAssetString(token)) /
                                      +amounts.get(getAssetString(asset))
                                : reserves.get(getAssetString(token)) /
                                      reserves.get(getAssetString(asset)),
                            true,
                        )} ${token.code}`,
                );
            map.set(getAssetString(asset), `1 ${asset.code} ≈ ${otherAssets.join(' ≈ ')}`);
        });

        return map;
    }, [reserves, pool, amounts, hasAllAmounts]);

    const hasActiveIncentives = useMemo(() => {
        if (!incentives?.length) {
            return false;
        }

        return incentives.some(
            i => !!Number(i.info.tps) && Number(i.info.expired_at) * 1000 > Date.now(),
        );
    }, [incentives]);

    const debouncedAmounts = useDebounce(amounts, 1000);

    useEffect(() => {
        setDepositShares(null);

        if (!account || [...debouncedAmounts.current.values()].some(v => Number.isNaN(+v))) {
            return;
        }

        SorobanService.amm
            .estimateDeposit(
                account.accountId(),
                pool.address,
                pool.tokens,
                debouncedAmounts.current,
            )
            .then(setDepositShares);
    }, [account, pool, debouncedAmounts]);

    useEffect(() => {
        setNewWorkingBalance(null);
        setNewWorkingSupply(null);

        if (!account || !depositShares) {
            return;
        }

        SorobanService.amm
            .estimateWorkingBalanceAndSupply(
                pool,
                account.accountId(),
                String(Number(accountShare) + depositShares),
            )
            .then(({ workingBalance, workingSupply }) => {
                setNewWorkingBalance(workingBalance);
                setNewWorkingSupply(workingSupply);
            });
    }, [account, pool, depositShares, accountShare]);

    const sharesBeforePercent = useMemo(() => {
        if (!Number(pool.total_share)) {
            return 0;
        }

        return +getPercentValue(Number(accountShare), +contractValueToAmount(pool.total_share), 2);
    }, [pool.total_share, accountShare]);

    const sharesAfterPercent = useMemo(() => {
        if (!depositShares) {
            return 0;
        }

        return +getPercentValue(
            Number(accountShare) + depositShares,
            +contractValueToAmount(pool.total_share) + depositShares,
            2,
        );
    }, [pool.total_share, accountShare, depositShares]);

    const dailyRewards = calculateDailyRewards(
        +poolRewards?.tps,
        +poolRewards?.working_balance,
        +poolRewards?.working_supply,
    );

    const getDailyRewards = () => {
        if (!poolRewards) {
            return <DotsLoader />;
        }

        if (!poolRewards.tps || !poolRewards.working_balance || !poolRewards.working_supply) {
            return '0 AQUA';
        }

        return `${formatBalance(dailyRewards, true)} AQUA`;
    };

    const getNewDailyRewards = () => {
        if (
            !poolRewards ||
            depositShares === null ||
            newWorkingBalance === null ||
            newWorkingSupply === null
        ) {
            return <DotsLoader />;
        }

        if (!poolRewards.tps) {
            return '0 AQUA';
        }

        const newRewards = calculateDailyRewards(
            +poolRewards.tps,
            newWorkingBalance,
            newWorkingSupply,
        );

        return `${formatBalance(newRewards, true)} AQUA`;
    };

    const onChangeInput = (asset: Token, inputValue: string) => {
        const value = inputValue.replaceAll(',', '');
        if (value === '') {
            pool.tokens.forEach(token => {
                setAmounts(new Map(amounts.set(getAssetString(token), '')));
            });
            return;
        }

        setAmounts(new Map(amounts.set(getAssetString(asset), value)));

        if (Number(pool.total_share) === 0 || !isBalancedDeposit) {
            return;
        }

        pool.tokens
            .filter(token => getAssetString(token) !== getAssetString(asset))
            .forEach(token => {
                const newAmount = (
                    (Number(value) * +reserves.get(getAssetString(token))) /
                    +reserves.get(getAssetString(asset))
                ).toFixed((token as SorobanToken).decimal ?? 7);
                setAmounts(new Map(amounts.set(getAssetString(token), newAmount)));
            });
    };

    useEffect(() => {
        pool.tokens.forEach(token => {
            setAmounts(new Map(amounts.set(getAssetString(token), '')));
        });
    }, [isBalancedDeposit]);

    useEffect(() => {
        if (!baseAmount || !counterAmount || !base || !counter) {
            return;
        }

        const newCounterAmount = (
            (Number(baseAmount) * +reserves.get(getAssetString(counter))) /
            +reserves.get(getAssetString(base))
        ).toFixed((counter as SorobanToken).decimal ?? 7);

        if (+newCounterAmount >= +counterAmount) {
            onChangeInput(counter, counterAmount);
        } else {
            onChangeInput(base, baseAmount);
        }
    }, []);

    useEffect(() => {
        if (!onDataChange) {
            return;
        }

        onDataChange({
            amounts: new Map(amounts),
            balances,
            hasAllAmounts,
            hasAnyAmount,
            isBalancedDeposit,
        });
    }, [onDataChange, amounts, balances, hasAllAmounts, hasAnyAmount, isBalancedDeposit]);

    return (
        <>
            {Number(pool.total_share) === 0 && (
                <Alert
                    title="This is the first deposit into this pool."
                    text="We recommend depositing tokens according to the market rate. Otherwise, traders may profit from your deposit, and you could lose money."
                />
            )}
            <Form>
                {pool.tokens.map((asset, index) => (
                    <FormRow key={getAssetString(asset)}>
                        {account &&
                            (asset.type === TokenType.soroban
                                ? balances?.get(getAssetString(asset))
                                : account.getAssetBalance(asset)) !== null && (
                                <Balance>
                                    Available:
                                    <BalanceClickable
                                        onClick={() =>
                                            onChangeInput(
                                                asset,
                                                asset.type === TokenType.soroban
                                                    ? String(
                                                          balances?.get(getAssetString(asset)) || 0,
                                                      )
                                                    : account
                                                          .getAvailableForSwapBalance(asset)
                                                          .toFixed(7),
                                            )
                                        }
                                    >
                                        {' '}
                                        {formatBalance(
                                            asset.type === TokenType.soroban
                                                ? balances?.get(getAssetString(asset))
                                                : account.getAvailableForSwapBalance(asset),
                                        )}
                                    </BalanceClickable>
                                    <Tooltip
                                        showOnHover
                                        background={COLORS.textPrimary}
                                        position={TOOLTIP_POSITION.left}
                                        content={
                                            <TooltipInnerBalance>
                                                {assetsReserves ? (
                                                    assetsReserves[index].map(
                                                        ({ label, value }) => (
                                                            <TooltipRow key={label}>
                                                                <span>{label}</span>
                                                                <span>
                                                                    {value} {asset.code}
                                                                </span>
                                                            </TooltipRow>
                                                        ),
                                                    )
                                                ) : (
                                                    <DotsLoader />
                                                )}
                                            </TooltipInnerBalance>
                                        }
                                    >
                                        <Info />
                                    </Tooltip>
                                </Balance>
                            )}
                        <NumericFormat
                            value={amounts.get(getAssetString(asset))}
                            onChange={({ target }) => onChangeInput(asset, target.value)}
                            placeholder={`Enter ${asset.code} amount`}
                            customInput={Input}
                            label={`${asset.code} Amount`}
                            postfix={<Asset asset={asset} logoAndCode />}
                            inputMode="decimal"
                            allowedDecimalSeparators={[',']}
                            thousandSeparator=","
                            decimalScale={(asset as SorobanToken).decimal ?? 7}
                            allowNegative={false}
                        />
                    </FormRow>
                ))}

                {pool.pool_type === 'stable' && !!Number(pool.total_share) && (
                    <CheckboxStyled
                        checked={isBalancedDeposit}
                        onChange={setIsBalancedDeposit}
                        label="Match pool ratio"
                    />
                )}

                {showPoolSummaryRows && (
                    <>
                        <DescriptionRow>
                            <span>Type</span>
                            <span>{pool.pool_type === 'stable' ? 'Stable' : 'Volatile'}</span>
                        </DescriptionRow>
                        <DescriptionRow>
                            <span>Fee</span>
                            <span>{(Number(pool.fee) * 100).toFixed(2)} %</span>
                        </DescriptionRow>
                        <DescriptionRow>
                            <span>Liquidity</span>
                            <span>
                                {pool.liquidity
                                    ? `$${formatBalance(
                                          (Number(pool.liquidity) *
                                              StellarService.price.priceLumenUsd) /
                                              1e7,
                                          true,
                                      )}`
                                    : '0'}
                            </span>
                        </DescriptionRow>
                        {pool.pool_type === POOL_TYPE.constant && Boolean(rates) && (
                            <DescriptionRow>
                                <span>Pool rates</span>
                                <PoolRates
                                    onClick={() => setPriceIndex(prev => (prev + 1) % rates.size)}
                                >
                                    {[...rates.values()][priceIndex]} <RevertIcon />{' '}
                                </PoolRates>
                            </DescriptionRow>
                        )}
                    </>
                )}

                <PoolInfo $withCardSpacing={withPoolInfoCardSpacing}>
                    <DescriptionRow>
                        <span>Share of Pool</span>
                        <span>
                            {formatBalance(sharesBeforePercent, true)}%
                            {!!sharesAfterPercent && (
                                <>
                                    <Arrow />
                                    {formatBalance(sharesAfterPercent, true)}%
                                </>
                            )}
                        </span>
                    </DescriptionRow>
                    {isRewardsEnabled &&
                        (Boolean(Number(pool.reward_tps)) || hasActiveIncentives) &&
                        Boolean(Number(pool.total_share)) &&
                        Boolean(poolRewards) && (
                            <DescriptionRow>
                                <span>ICE Reward Boost</span>
                                <span>
                                    <Label
                                        labelText={`x${(+calculateBoostValue(poolRewards.working_balance, accountShare)).toFixed(2)}`}
                                        labelSize="medium"
                                        background={COLORS.blue700}
                                        withoutUppercase
                                    />
                                    {!!newWorkingBalance && (
                                        <>
                                            <Arrow />
                                            <Label
                                                labelText={`x${calculateBoostValue(
                                                    newWorkingBalance,
                                                    +accountShare + +depositShares,
                                                ).toFixed(2)}`}
                                                labelSize="medium"
                                                background={COLORS.blue700}
                                                withoutUppercase
                                            />
                                        </>
                                    )}
                                </span>
                            </DescriptionRow>
                        )}
                    {isRewardsEnabled && Boolean(Number(pool.reward_tps)) && (
                        <DescriptionRow>
                            <span>Daily rewards</span>
                            <span>
                                {getDailyRewards()}
                                {!!newWorkingBalance && (
                                    <>
                                        <Arrow />
                                        {getNewDailyRewards()}
                                    </>
                                )}
                            </span>
                        </DescriptionRow>
                    )}

                    {hasActiveIncentives && isRewardsEnabled
                        ? incentives
                              .filter(incentive => !!Number(incentive.info.tps))
                              .map(incentive => (
                                  <DescriptionRow key={incentive.token.contract}>
                                      <span>Daily incentives {incentive.token.code}</span>
                                      <span>
                                          {formatBalance(
                                              calculateDailyRewards(
                                                  +incentive.info.tps,
                                                  +poolRewards?.working_balance,
                                                  +poolRewards?.working_supply,
                                              ),
                                              true,
                                          )}{' '}
                                          {incentive.token.code}
                                          {!!depositShares && (
                                              <>
                                                  <Arrow />
                                                  {formatBalance(
                                                      calculateDailyRewards(
                                                          +incentive.info.tps,
                                                          newWorkingBalance,
                                                          newWorkingSupply,
                                                      ),
                                                      true,
                                                  )}{' '}
                                                  {incentive.token.code}
                                              </>
                                          )}
                                      </span>
                                  </DescriptionRow>
                              ))
                        : null}
                </PoolInfo>
            </Form>
        </>
    );
};

export default AddLiquidityForm;
