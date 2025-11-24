import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

import { POOL_TYPE } from 'constants/amm';
import { DAY } from 'constants/intervals';

import { contractValueToAmount } from 'helpers/amount';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import {
    ModalService,
    SorobanService,
    StellarService,
    ToastService,
} from 'services/globalServices';

import { PoolExtended, PoolIncentives, PoolRewardsInfo } from 'types/amm';
import { ModalProps } from 'types/modal';
import { SorobanToken, Token, TokenType } from 'types/token';

import Revert from 'assets/icons/actions/icon-revert-16x17.svg';
import Arrow from 'assets/icons/arrows/arrow-alt2-16.svg';
import Info from 'assets/icons/status/icon-info-16.svg';

import Alert from 'basics/Alert';
import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import { Checkbox } from 'basics/inputs';
import Input from 'basics/inputs/Input';
import Label from 'basics/Label';
import DotsLoader from 'basics/loaders/DotsLoader';
import { ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { customScroll, flexRowSpaceBetween, noSelect, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import SuccessModal from '../SuccessModal/SuccessModal';

const Container = styled.div<{ $isModal: boolean }>`
    width: 100%;
    max-height: 82vh;
    overflow: auto;
    padding-top: 4rem;

    ${customScroll};

    ${respondDown(Breakpoints.md)`
        width: 100%;
        max-height: 100vh;
    `}

    Button {
        width: fit-content;
        margin-left: auto;
    }
`;

const Form = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 3rem;

    ${respondDown(Breakpoints.sm)`
        Button {
            width: 100%;
        }
    `}
`;

const FormRow = styled.div`
    display: flex;
    margin: 3rem 0;
    position: relative;
`;

const DescriptionRow = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 1.6rem;
    color: ${COLORS.textGray};

    span {
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }

    span:last-child {
        color: ${COLORS.textTertiary};
    }
`;

const PoolRates = styled.span`
    cursor: pointer;
    ${noSelect};
`;

const Balance = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    right: 0;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textTertiary};
    display: flex;
    align-items: center;

    svg {
        margin-left: 0.4rem;
    }

    ${respondDown(Breakpoints.sm)`
        font-size: 1.2rem;
    `}
`;

const BalanceClickable = styled.span`
    color: ${COLORS.purple500};
    cursor: pointer;
    margin-left: 0.4rem;
`;

const PoolInfo = styled.div<{ $isModal: boolean }>`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.gray50};
    border-radius: 0.6rem;
    padding: ${({ $isModal }) => ($isModal ? '2.4rem;' : '0')};
    margin-top: ${({ $isModal }) => ($isModal ? '2.4rem;' : '0')};
    margin-bottom: ${({ $isModal }) => ($isModal ? '4.8rem;' : '0')};

    ${respondDown(Breakpoints.sm)`
        margin-bottom: 2rem;
    `}
`;

const TooltipInnerBalance = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.white};
    font-size: 1.3rem;
    line-height: 1.3rem;
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 1.2rem;

    &:last-child:not(:first-child) {
        font-weight: 700;
    }
`;

const CheckboxStyled = styled(Checkbox)`
    margin-bottom: 2.4rem;
`;

const RevertIcon = styled(Revert)`
    margin-left: 0.4rem;
`;

interface DepositToPoolParams {
    pool: PoolExtended;
    isModal: boolean;
    baseAmount: string;
    counterAmount: string;
    base: Token;
    counter: Token;
    onUpdate: () => void;
}

const DepositToPool = ({ params, confirm }: ModalProps<DepositToPoolParams>) => {
    const { account } = useAuthStore();
    const { pool, isModal = true, baseAmount, counterAmount, base, counter, onUpdate } = params;

    const [accountShare, setAccountShare] = useState(null);
    const [assetsReserves, setAssetsReserves] = useState(null);
    const [poolRewards, setPoolRewards] = useState(null);
    const [balances, setBalances] = useState(null);
    const [amounts, setAmounts] = useState<Map<string, string>>(
        new Map<string, string>(pool.tokens.map(asset => [getAssetString(asset), ''])),
    );
    const [pending, setPending] = useState(false);
    const [isBalancedDeposit, setIsBalancedDeposit] = useState(true);

    const [priceIndex, setPriceIndex] = useState(0);

    const [incentives, setIncentives] = useState<PoolIncentives[] | null>(null);

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
        const sorobanTokens = pool.tokens.filter(({ type }) => type === TokenType.soroban);
        Promise.all(
            sorobanTokens.map((asset: SorobanToken) => account.getAssetBalance(asset)),
        ).then(res => {
            const result = new Map();
            sorobanTokens.forEach((token, index) => {
                result.set(getAssetString(token), res[index]);
            });

            setBalances(result);
        });
    }, [account]);

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
    }, [account]);

    useEffect(() => {
        if (!account) {
            setPoolRewards(null);
            return;
        }
        SorobanService.amm.getPoolRewards(account.accountId(), pool.address).then(res => {
            setPoolRewards(res);
        });
    }, [account, pool]);

    useEffect(() => {
        if (!account) {
            setIncentives(null);
            return;
        }

        SorobanService.amm.getPoolIncentives(account.accountId(), pool.address).then(setIncentives);
    }, [account, pool]);

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

    const isValidForDepositAmounts = useMemo(() => {
        const hasSomeAmount = [...amounts.values()].some(value => Boolean(+value));

        return isBalancedDeposit ? hasAllAmounts : hasSomeAmount;
    }, [hasAllAmounts, isBalancedDeposit, amounts]);

    const { sharesBefore, sharesAfter, sharesAfterValue } = useMemo(() => {
        const totalShare = Number(pool.total_share) / Math.pow(10, pool.share_token_decimals);

        if (!reserves || reserves.size === 0 || totalShare <= 0) {
            return {
                sharesBefore: 0,
                sharesAfter: isValidForDepositAmounts ? 100 : null,
                sharesAfterValue: null,
            };
        }

        const accountShareNum = Number(accountShare) || 0;
        const sharesBefore = (accountShareNum / totalShare) * 100;

        // Collect pool reserves and user deposit amounts
        const tokenReserves: number[] = [];
        const tokenDeposits: number[] = [];
        for (const token of pool.tokens) {
            const key = getAssetString(token);
            tokenReserves.push(Number(reserves.get(key) || 0));
            tokenDeposits.push(Number(amounts.get(key) || 0));
        }

        const totalReserves = tokenReserves.reduce((a, b) => a + b, 0);
        const totalDeposit = tokenDeposits.reduce((a, b) => a + b, 0);

        if (totalReserves === 0 || totalDeposit === 0) {
            return {
                sharesBefore,
                sharesAfter: null,
                sharesAfterValue: null,
            };
        }

        // === One-sided deposit handling ===
        // The idea: if only one token is deposited,
        // the protocol internally swaps part of it to the missing tokens
        // so that the effective deposit matches pool proportions.
        const effectiveDeposits: number[] = [];
        for (let i = 0; i < tokenReserves.length; i++) {
            const proportion = tokenReserves[i] / totalReserves;
            effectiveDeposits[i] = totalDeposit * proportion;
        }

        // Effective ratio of deposit to reserve (same for all tokens after balancing)
        const ratio = effectiveDeposits[0] / tokenReserves[0];

        // Minted LP shares based on this ratio
        const mintedShares = totalShare * ratio;

        // New account share and total supply after deposit
        const newAccountShare = accountShareNum + mintedShares;
        const newTotalShare = totalShare + mintedShares;

        const sharesAfter = (newAccountShare / newTotalShare) * 100;
        const sharesAfterValue = newAccountShare;

        return {
            sharesBefore,
            sharesAfter,
            sharesAfterValue,
        };
    }, [amounts, pool, reserves, accountShare, isValidForDepositAmounts]);

    const rates: Map<string, string> = useMemo(() => {
        if (Number(pool.total_share) === 0 && !hasAllAmounts) {
            return null;
        }
        const map = new Map();

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
    }, [reserves, pool, amounts]);

    const getDailyRewards = (rewardsInfo: PoolRewardsInfo) => {
        if (!rewardsInfo) return <DotsLoader />;

        const tps = +rewardsInfo.tps;
        const wSupply = +rewardsInfo.working_supply;
        const wBalance = +rewardsInfo.working_balance;

        if (!tps || !wSupply || !wBalance) return '0 AQUA';

        const secondsInDay = 60 * 60 * 24;

        return `${formatBalance((tps * wBalance * secondsInDay) / wSupply, true)} AQUA`;
    };

    const getNewDailyRewards = (rewardsInfo: PoolRewardsInfo) => {
        if (!rewardsInfo) return <DotsLoader />;

        const supply = +rewardsInfo.supply;
        const lockedSupply = +rewardsInfo.boost_supply;
        const lockedBalance = +rewardsInfo.boost_balance;

        const newWBalance = Math.min(
            +sharesAfterValue + (1.5 * lockedBalance * supply) / lockedSupply,
            +sharesAfterValue * 2.5,
        );

        const tps = +rewardsInfo.tps;
        const newWSupply = +rewardsInfo.working_supply - accountShare + sharesAfterValue;

        if (!tps) return '0 AQUA';

        const secondsInDay = 60 * 60 * 24;

        return `${formatBalance((tps * newWBalance * secondsInDay) / newWSupply, true)} AQUA`;
    };

    const calculateBoostValue = (rewardsInfo: PoolRewardsInfo) => {
        if (!rewardsInfo) return 1;
        const tps = +rewardsInfo.tps;
        const wSupply = +rewardsInfo.working_supply;
        const wBalance = +rewardsInfo.working_balance;

        if (!tps || !wSupply || !wBalance) return 1;

        const tpsWithoutBoost =
            ((+accountShare / Math.pow(10, pool.share_token_decimals)) * tps) / wSupply;
        const expectedTps = (tps * wBalance) / wSupply;

        if (tpsWithoutBoost === 0) return 1;

        return expectedTps / tpsWithoutBoost / 1e7;
    };

    const calculateNewBoostValue = (rewardsInfo: PoolRewardsInfo) => {
        if (!rewardsInfo) return 1;

        const supply = +rewardsInfo.supply;
        const lockedSupply = +rewardsInfo.boost_supply;
        const lockedBalance = +rewardsInfo.boost_balance;

        const newWBalance = Math.min(
            +sharesAfterValue + (1.5 * lockedBalance * supply) / lockedSupply,
            +sharesAfterValue * 2.5,
        );

        return newWBalance / sharesAfterValue;
    };

    const onSubmit = () => {
        const insufficientBalanceTokens = pool.tokens.filter(
            asset =>
                (asset.type === TokenType.soroban
                    ? balances?.get(getAssetString(asset))
                    : account.getAssetBalance(asset)) < +amounts.get(getAssetString(asset)),
        );
        if (insufficientBalanceTokens.length) {
            ToastService.showErrorToast(
                `Insufficient balance ${insufficientBalanceTokens
                    .map(({ code }) => code)
                    .join(' ')}`,
            );
            return;
        }
        let hash: string;
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setPending(true);
        SorobanService.amm
            .getDepositTx(account?.accountId(), pool.address, pool.tokens, amounts)
            .then(tx => {
                hash = tx.hash().toString('hex');
                return account.signAndSubmitTx(tx, true);
            })
            .then((res: { value?: () => unknown; status?: BuildSignAndSubmitStatuses }) => {
                setPending(false);

                if (!res) {
                    return;
                }

                confirm();

                if (onUpdate) {
                    onUpdate();
                }

                if (
                    (res as { status: BuildSignAndSubmitStatuses }).status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }

                const resultAmounts = res.value()[0].value();

                pool.tokens.forEach((token, index) => {
                    if (token.type === TokenType.soroban) {
                        const resAmount = SorobanService.scVal.i128ToInt(
                            resultAmounts[index],
                            token.decimal,
                        );

                        ToastService.showSuccessToast(
                            `Payment sent: ${formatBalance(Number(resAmount))} ${token.code}`,
                        );
                    }
                });

                ModalService.openModal(SuccessModal, {
                    assets: pool.tokens,
                    amounts: resultAmounts.map((value, index) =>
                        SorobanService.scVal.i128ToInt(
                            value,
                            (pool.tokens[index] as SorobanToken).decimal,
                        ),
                    ),
                    title: 'Deposit Successful',
                    hash,
                });
            })
            .catch(e => {
                ToastService.showErrorToast(
                    e.message ?? e.toString() ?? 'Oops! Something went wrong',
                );
                setPending(false);
            });
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

        // empty pool
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
        if (!baseAmount || !counterAmount) {
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

    const ButtonAdd = (
        <Button
            isBig
            onClick={() => onSubmit()}
            pending={pending}
            disabled={
                isBalancedDeposit ? !hasAllAmounts : ![...amounts.values()].some(v => Boolean(+v))
            }
        >
            deposit
        </Button>
    );

    const content = (
        <>
            {Number(pool.total_share) === 0 && (
                <Alert
                    title="This is the first deposit into this pool."
                    text="We recommend depositing tokens
                        according to the market rate. Otherwise, traders may profit from your
                        deposit, and you could lose money."
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
                                                    ? balances?.get(getAssetString(asset)) || 0
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

                {isModal && (
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

                <PoolInfo $isModal={isModal}>
                    <DescriptionRow>
                        <span>Share of Pool</span>
                        <span>
                            {formatBalance(sharesBefore, true)}%
                            {sharesAfter && (
                                <>
                                    <Arrow />
                                    {formatBalance(sharesAfter, true)}%
                                </>
                            )}
                        </span>
                    </DescriptionRow>
                    {Boolean(Number(pool.total_share)) && Boolean(poolRewards) && (
                        <DescriptionRow>
                            <span>ICE Reward Boost</span>
                            <span>
                                <Label
                                    labelText={`x${(+calculateBoostValue(poolRewards)).toFixed(2)}`}
                                    labelSize="medium"
                                    background={COLORS.blue700}
                                    withoutUppercase
                                />
                                {sharesAfter && (
                                    <>
                                        <Arrow />
                                        <Label
                                            labelText={`x${calculateNewBoostValue(
                                                poolRewards,
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
                    {Boolean(Number(pool.reward_tps)) && (
                        <DescriptionRow>
                            <span>Daily rewards</span>
                            <span>
                                {getDailyRewards(poolRewards)}
                                {sharesAfter && (
                                    <>
                                        <Arrow />
                                        {getNewDailyRewards(poolRewards)}
                                    </>
                                )}
                            </span>
                        </DescriptionRow>
                    )}

                    {incentives?.length
                        ? incentives
                              .filter(incentive => !!Number(incentive.info.tps))
                              .map(incentive => (
                                  <DescriptionRow key={incentive.token.contract}>
                                      <span>Daily incentives {incentive.token.code}</span>
                                      <span>
                                          {formatBalance(
                                              (+incentive.info.tps * DAY * sharesBefore) /
                                                  1000 /
                                                  100,
                                              true,
                                          )}{' '}
                                          {incentive.token.code}
                                          {sharesAfter && (
                                              <>
                                                  <Arrow />
                                                  {formatBalance(
                                                      (+incentive.info.tps * DAY * sharesAfter) /
                                                          1000 /
                                                          100,
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

                {isModal ? <StickyButtonWrapper>{ButtonAdd}</StickyButtonWrapper> : ButtonAdd}
            </Form>
        </>
    );

    return isModal ? (
        <ModalWrapper>
            <ModalTitle>Add liquidity</ModalTitle>
            {content}
        </ModalWrapper>
    ) : (
        <Container $isModal={isModal}>{content}</Container>
    );
};

export default DepositToPool;
