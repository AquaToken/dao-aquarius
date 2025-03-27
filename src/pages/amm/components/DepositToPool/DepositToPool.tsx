import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import {
    ModalService,
    SorobanService,
    StellarService,
    ToastService,
} from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { PoolExtended, PoolRewardsInfo } from 'types/amm';
import { ModalProps } from 'types/modal';
import { Asset as AssetType, Int128Parts } from 'types/stellar';

import { customScroll, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Arrow from 'assets/icon-arrow-right-long.svg';
import Info from 'assets/icon-info.svg';

import Alert from 'basics/Alert';
import ApyBoosted from 'basics/ApyBoosted';
import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';
import Label from 'basics/Label';
import DotsLoader from 'basics/loaders/DotsLoader';
import { ModalTitle } from 'basics/ModalAtoms';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import SuccessModal from '../SuccessModal/SuccessModal';

const Container = styled.div<{ $isModal: boolean }>`
    width: ${({ $isModal }) => ($isModal ? '52.3rem' : '100%')};
    max-height: 82vh;
    overflow: auto;
    padding-top: ${({ $isModal }) => ($isModal ? '0' : '4rem')};

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
    color: ${COLORS.grayText};

    span {
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }

    span:last-child {
        color: ${COLORS.paragraphText};
    }
`;

const Balance = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    right: 0;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
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
    color: ${COLORS.purple};
    cursor: pointer;
    margin-left: 0.4rem;
`;

const PoolInfo = styled.div<{ $isModal: boolean }>`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.lightGray};
    border-radius: 0.6rem;
    padding: ${({ $isModal }) => ($isModal ? '2.4rem;' : '0')};
    margin-top: ${({ $isModal }) => ($isModal ? '2.4rem;' : '0')};
    margin-bottom: ${({ $isModal }) => ($isModal ? '4.8rem;' : '0')};

    ${respondDown(Breakpoints.sm)`
        margin-bottom: 2rem;
    `}
`;

const TooltipInner = styled.span`
    color: ${COLORS.white}!important;
    white-space: pre-line;
    max-width: 30rem;
    width: max-content;

    ${respondDown(Breakpoints.sm)`
        width: 12rem;
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

interface DepositToPoolParams {
    pool: PoolExtended;
    isModal: boolean;
    baseAmount: string;
    counterAmount: string;
    base: AssetType;
    counter: AssetType;
    onUpdate: () => void;
}

const DepositToPool = ({ params, confirm }: ModalProps<DepositToPoolParams>) => {
    const { account } = useAuthStore();
    const { pool, isModal = true, baseAmount, counterAmount, base, counter, onUpdate } = params;

    const [accountShare, setAccountShare] = useState(null);
    const [assetsReserves, setAssetsReserves] = useState(null);
    const [poolRewards, setPoolRewards] = useState(null);

    useEffect(() => {
        if (!account) {
            setAssetsReserves(null);
            return;
        }
        Promise.all(pool.assets.map(asset => account.getReservesForSwap(asset))).then(res => {
            setAssetsReserves(res);
        });
    }, [account, pool]);

    useEffect(() => {
        if (!account) {
            setAccountShare(null);
            return;
        }
        SorobanService.getTokenBalance(pool.share_token_address, account.accountId()).then(res => {
            setAccountShare(res);
        });
    }, [account]);

    useEffect(() => {
        if (!account) {
            setPoolRewards(null);
            return;
        }
        SorobanService.getPoolRewards(account.accountId(), pool.address).then(res => {
            setPoolRewards(res);
        });
    }, [account, pool]);

    const reserves: Map<string, number> = useMemo(
        () =>
            new Map(
                pool.assets.map((asset, index) => [
                    getAssetString(asset),
                    Number(pool.reserves[index]) / 1e7,
                ]),
            ),
        [pool],
    );

    const [amounts, setAmounts] = useState<Map<string, string>>(
        new Map<string, string>(pool.assets.map(asset => [getAssetString(asset), ''])),
    );
    const [pending, setPending] = useState(false);

    const hasAllAmounts = useMemo(
        () => [...amounts.values()].every(value => Boolean(+value)),
        [amounts],
    );

    const { sharesBefore, sharesAfter, sharesAfterValue } = useMemo(() => {
        const firstAssetString = getAssetString(pool.assets[0]);

        const amountBeforeDeposit =
            (reserves.get(firstAssetString) * accountShare) / (Number(pool.total_share) / 1e7);

        if (Number(pool.total_share) === 0) {
            return {
                sharesBefore: 0,
                sharesAfter: hasAllAmounts ? 100 : null,
                sharesAfterValue: null,
            };
        }

        if (hasAllAmounts) {
            const oldReserves = +reserves.get(firstAssetString);
            const newReserves = oldReserves + +amounts.get(firstAssetString);

            const newTotalShare = (Number(pool.total_share) / 1e7) * (newReserves / oldReserves);

            return {
                sharesBefore: (accountShare / (Number(pool.total_share) / 1e7)) * 100,
                sharesAfter:
                    ((+amounts.get(firstAssetString) + amountBeforeDeposit) / newReserves) * 100,
                sharesAfterValue:
                    +accountShare +
                    (newTotalShare - Number(pool.total_share) / 1e7) *
                        (+amounts.get(firstAssetString) / newReserves),
            };
        }

        return {
            sharesBefore: (accountShare / (Number(pool.total_share) / 1e7)) * 100,
            sharesAfter: null,
            sharesAfterValue: null,
        };
    }, [amounts, pool, reserves, accountShare]);

    const getDailyRewards = useCallback(
        (percent: number) => {
            const secondsInDay = 60 * 60 * 24;

            const poolDailyRewards = (Number(pool.reward_tps) / 1e7) * secondsInDay;

            return (poolDailyRewards * percent) / 100;
        },
        [pool],
    );

    const rates: Map<string, string> = useMemo(() => {
        if (Number(pool.total_share) === 0 && !hasAllAmounts) {
            return null;
        }
        const map = new Map();

        pool.assets.forEach(asset => {
            const otherAssets = pool.assets
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

    const calculateBoostValue = (rewardsInfo: PoolRewardsInfo) => {
        if (!rewardsInfo) return 1;
        const tps = +rewardsInfo.tps;
        const wSupply = +rewardsInfo.working_supply;
        const wBalance = +rewardsInfo.working_balance;

        if (!tps || !wSupply || !wBalance) return 1;

        const tpsWithoutBoost = ((+accountShare / 1e7) * tps) / wSupply;
        const expectedTps = (tps * wBalance) / wSupply;

        if (tpsWithoutBoost === 0) return 1;

        return (expectedTps / tpsWithoutBoost / 1e7).toFixed(2);
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
        const insufficientBalanceTokens = pool.assets.filter(
            asset => account.getAssetBalance(asset) < +amounts.get(getAssetString(asset)),
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
        SorobanService.getDepositTx(account?.accountId(), pool.address, pool.assets, amounts)
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

                ModalService.openModal(SuccessModal, {
                    assets: pool.assets,
                    amounts: resultAmounts.map(value =>
                        SorobanService.i128ToInt(value.value() as Int128Parts),
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

    const onChangeInput = (asset: AssetType, value: string) => {
        if (Number.isNaN(Number(value))) {
            return;
        }

        if (value === '') {
            pool.assets.forEach(token => {
                setAmounts(new Map(amounts.set(getAssetString(token), '')));
            });
            return;
        }
        const [integerPart, fractionalPart] = value.split('.');

        const roundedValue =
            fractionalPart && fractionalPart.length > 7
                ? `${integerPart}.${fractionalPart.slice(0, 7)}`
                : value;

        setAmounts(new Map(amounts.set(getAssetString(asset), roundedValue)));

        // empty pool
        if (Number(pool.total_share) === 0) {
            return;
        }

        pool.assets
            .filter(token => getAssetString(token) !== getAssetString(asset))
            .forEach(token => {
                const newAmount = (
                    (Number(roundedValue) * +reserves.get(getAssetString(token))) /
                    +reserves.get(getAssetString(asset))
                ).toFixed(7);
                setAmounts(
                    new Map(amounts.set(getAssetString(token), Number(newAmount).toFixed(7))),
                );
            });
    };

    useEffect(() => {
        if (!baseAmount || !counterAmount) {
            return;
        }
        const newCounterAmount = (
            (Number(baseAmount) * +reserves.get(getAssetString(counter))) /
            +reserves.get(getAssetString(base))
        ).toFixed(7);

        if (+newCounterAmount >= +counterAmount) {
            onChangeInput(counter, counterAmount);
        } else {
            onChangeInput(base, baseAmount);
        }
    }, []);

    return (
        <Container $isModal={isModal}>
            {isModal && <ModalTitle>Add liquidity</ModalTitle>}
            {Number(pool.total_share) === 0 && (
                <Alert
                    title="This is the first deposit into this pool."
                    text="We recommend depositing tokens
                        according to the market rate. Otherwise, traders may profit from your
                        deposit, and you could lose money."
                />
            )}
            <Form>
                {pool.assets.map((asset, index) => (
                    <FormRow key={getAssetString(asset)}>
                        {account && account.getAssetBalance(asset) !== null && (
                            <Balance>
                                Available:
                                <BalanceClickable
                                    onClick={() =>
                                        onChangeInput(
                                            asset,
                                            account.getAvailableForSwapBalance(asset).toFixed(7),
                                        )
                                    }
                                >
                                    {' '}
                                    {formatBalance(account.getAvailableForSwapBalance(asset))}{' '}
                                    {asset.code}
                                </BalanceClickable>
                                <Tooltip
                                    showOnHover
                                    background={COLORS.titleText}
                                    position={TOOLTIP_POSITION.left}
                                    content={
                                        <TooltipInnerBalance>
                                            {assetsReserves ? (
                                                assetsReserves[index].map(({ label, value }) => (
                                                    <TooltipRow key={label}>
                                                        <span>{label}</span>
                                                        <span>
                                                            {value} {asset.code}
                                                        </span>
                                                    </TooltipRow>
                                                ))
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
                        <Input
                            value={amounts.get(getAssetString(asset))}
                            onChange={({ target }) => {
                                onChangeInput(asset, target.value);
                            }}
                            placeholder={`Enter ${asset.code} amount`}
                            label={`${asset.code} Amount`}
                            postfix={<Asset asset={asset} logoAndCode />}
                            inputMode="decimal"
                        />
                    </FormRow>
                ))}

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
                                          (Number(pool.liquidity) * StellarService.priceLumenUsd) /
                                              1e7,
                                          true,
                                      )}`
                                    : '0'}
                            </span>
                        </DescriptionRow>
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
                        <>
                            <DescriptionRow>
                                <span>Rewards APY</span>
                                <span>
                                    {+calculateBoostValue(poolRewards) === 1 ? (
                                        `${formatBalance(+(+pool.rewards_apy * 100).toFixed(2))}%`
                                    ) : (
                                        <ApyBoosted
                                            value={
                                                +pool.rewards_apy *
                                                100 *
                                                +calculateBoostValue(poolRewards)
                                            }
                                            color="purple"
                                        />
                                    )}
                                    {sharesAfter && (
                                        <>
                                            <Arrow />
                                            {calculateNewBoostValue(poolRewards) === 1 ? (
                                                `${formatBalance(
                                                    +(+pool.rewards_apy * 100).toFixed(2),
                                                )}%`
                                            ) : (
                                                <ApyBoosted
                                                    value={
                                                        +pool.rewards_apy *
                                                        100 *
                                                        calculateNewBoostValue(poolRewards)
                                                    }
                                                    color="purple"
                                                />
                                            )}
                                        </>
                                    )}
                                </span>
                            </DescriptionRow>
                            <DescriptionRow>
                                <span>Rewards Boost</span>
                                <span>
                                    <Label
                                        labelText={`x${(+calculateBoostValue(poolRewards)).toFixed(
                                            2,
                                        )}`}
                                        labelSize="big"
                                        background={COLORS.darkBlue}
                                    />
                                    {sharesAfter && (
                                        <>
                                            <Arrow />
                                            <Label
                                                labelText={`x${calculateNewBoostValue(
                                                    poolRewards,
                                                ).toFixed(2)}`}
                                                labelSize="big"
                                                background={COLORS.darkBlue}
                                            />
                                        </>
                                    )}
                                </span>
                            </DescriptionRow>
                        </>
                    )}
                    {Boolean(Number(pool.reward_tps)) && (
                        <DescriptionRow>
                            <span>Daily rewards</span>
                            <span>
                                {formatBalance(getDailyRewards(sharesBefore), true)} AQUA
                                {sharesAfter && (
                                    <>
                                        <Arrow />
                                        {formatBalance(getDailyRewards(sharesAfter), true)} AQUA
                                    </>
                                )}
                            </span>
                        </DescriptionRow>
                    )}
                    {pool.assets.map(asset => (
                        <DescriptionRow key={getAssetString(asset)}>
                            <span>
                                Pooled {asset.code}{' '}
                                {Boolean(rates) && (
                                    <Tooltip
                                        content={
                                            <TooltipInner>
                                                {rates.get(getAssetString(asset))}
                                            </TooltipInner>
                                        }
                                        position={TOOLTIP_POSITION.right}
                                        showOnHover
                                    >
                                        <Info />
                                    </Tooltip>
                                )}
                            </span>
                            <span>
                                {hasAllAmounts && (
                                    <>
                                        {+pool.total_share
                                            ? formatBalance(
                                                  (+reserves.get(getAssetString(asset)) *
                                                      accountShare) /
                                                      (Number(pool.total_share) / 1e7),
                                                  true,
                                              )
                                            : 0}
                                        <Arrow />
                                    </>
                                )}
                                {reserves !== null ? (
                                    formatBalance(
                                        (+pool.total_share
                                            ? (+reserves.get(getAssetString(asset)) *
                                                  accountShare) /
                                              (Number(pool.total_share) / 1e7)
                                            : 0) + +amounts.get(getAssetString(asset)),
                                        true,
                                    )
                                ) : (
                                    <DotsLoader />
                                )}
                            </span>
                        </DescriptionRow>
                    ))}
                </PoolInfo>

                <Button
                    isBig
                    onClick={() => onSubmit()}
                    pending={pending}
                    disabled={!hasAllAmounts}
                >
                    deposit
                </Button>
            </Form>
        </Container>
    );
};

export default DepositToPool;
