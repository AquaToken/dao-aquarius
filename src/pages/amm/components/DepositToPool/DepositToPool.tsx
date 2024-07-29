import * as React from 'react';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { customScroll, flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import Input from '../../../../common/basics/Input';
import Asset from '../../../vote/components/AssetDropdown/Asset';
import {
    ModalService,
    SorobanService,
    StellarService,
    ToastService,
} from '../../../../common/services/globalServices';
import Button from '../../../../common/basics/Button';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import SuccessModal from '../SuccessModal/SuccessModal';
import { formatBalance } from '../../../../common/helpers/helpers';
import DotsLoader from '../../../../common/basics/DotsLoader';
import { getAssetString } from '../../../../store/assetsStore/actions';
import Info from '../../../../common/assets/img/icon-info.svg';
import Arrow from '../../../../common/assets/img/icon-arrow-right-long.svg';
import Tooltip, { TOOLTIP_POSITION } from '../../../../common/basics/Tooltip';
import { BuildSignAndSubmitStatuses } from '../../../../common/services/wallet-connect.service';
import Alert from '../../../../common/basics/Alert';
import MainNetWarningModal, {
    SHOW_PURPOSE_ALIAS_MAIN_NET,
} from '../../../../common/modals/MainNetWarningModal';

const Container = styled.div`
    width: 52.3rem;
    max-height: 80vh;
    overflow: auto;

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
`;

const PoolInfo = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.lightGray};
    border-radius: 0.6rem;
    padding: 2.4rem;
    margin-top: 2.4rem;
    margin-bottom: 4.8rem;

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
    font-size: 1.2rem;
    line-height: 2rem;
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 1.2rem;

    &:last-child:not(:first-child) {
        font-weight: 700;
    }
`;

const DepositToPool = ({ params }) => {
    const { account } = useAuthStore();
    const { pool, accountShare } = params;

    const [amounts, setAmounts] = useState<Map<string, string>>(
        new Map<string, string>(pool.assets.map((asset) => [getAssetString(asset), ''])),
    );
    const [pending, setPending] = useState(false);

    const hasAllAmounts = useMemo(() => {
        // @ts-ignore
        return [...amounts.values()].every((value) => Boolean(+value));
    }, [amounts]);

    const reserves: Map<string, number> = useMemo(() => {
        return new Map(
            pool.assets.map((asset, index) => [getAssetString(asset), pool.reserves[index] / 1e7]),
        );
    }, [pool]);

    const shares = useMemo(() => {
        const firstAssetString = getAssetString(pool.assets[0]);

        const amountBeforeDeposit =
            (reserves.get(firstAssetString) * accountShare) / (pool.total_share / 1e7);

        if (Number(pool.total_share) === 0 && hasAllAmounts) {
            return hasAllAmounts ? (
                <span>
                    0% <Arrow /> 100%
                </span>
            ) : (
                <span>0%</span>
            );
        }

        if (hasAllAmounts) {
            return (
                <span>
                    {formatBalance((accountShare / (pool.total_share / 1e7)) * 100, true)}%
                    <Arrow />
                    {formatBalance(
                        ((+amounts.get(firstAssetString) + amountBeforeDeposit) /
                            (reserves.get(firstAssetString) + +amounts.get(firstAssetString))) *
                            100,
                        true,
                    )}
                    %
                </span>
            );
        }

        return `${formatBalance(
            ((+amounts.get(firstAssetString) + amountBeforeDeposit) /
                (reserves.get(firstAssetString) + +amounts.get(firstAssetString))) *
                100,
            true,
        )}%`;
    }, [amounts, pool, reserves, accountShare]);

    const rates: Map<string, string> = useMemo(() => {
        if (Number(pool.total_share) === 0 && !hasAllAmounts) {
            return null;
        }
        const map = new Map();

        pool.assets.forEach((asset) => {
            const otherAssets = pool.assets
                .filter((token) => getAssetString(token) !== getAssetString(asset))
                .map(
                    (token) =>
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

    const onSubmit = () => {
        const insufficientBalanceTokens = pool.assets.filter(
            (asset) => account.getAssetBalance(asset) < +amounts.get(getAssetString(asset)),
        );
        if (!!insufficientBalanceTokens.length) {
            ToastService.showErrorToast(
                `Insufficient balance ${insufficientBalanceTokens
                    .map(({ code }) => code)
                    .join(' ')}`,
            );
            return;
        }
        let hash: string;
        setPending(true);
        SorobanService.getDepositTx(account?.accountId(), pool.index, pool.assets, amounts)
            .then((tx) => {
                hash = tx.hash().toString('hex');
                return account.signAndSubmitTx(tx, true);
            })
            .then((res) => {
                setPending(false);

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

                const resultAmounts = res.value()[0].value();

                ModalService.confirmAllModals();

                ModalService.openModal(SuccessModal, {
                    assets: pool.assets,
                    amounts: resultAmounts.map((value) => SorobanService.i128ToInt(value.value())),
                    title: 'Deposit Successful',
                    hash,
                });
            })
            .catch((e) => {
                ToastService.showErrorToast(
                    e.message ?? e.toString() ?? 'Oops! Something went wrong',
                );
                setPending(false);
            });
    };

    const submitWithWarning = () => {
        const showPurpose = JSON.parse(localStorage.getItem(SHOW_PURPOSE_ALIAS_MAIN_NET) || 'true');
        if (showPurpose) {
            ModalService.openModal(MainNetWarningModal, {}).then(({ isConfirmed }) => {
                if (isConfirmed) {
                    onSubmit();
                }
            });
            return;
        }
        onSubmit();
    };

    const onChangeInput = (asset, value) => {
        if (Number.isNaN(Number(value))) {
            return;
        }

        if (value === '') {
            pool.assets.forEach((token) => {
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
            .filter((token) => getAssetString(token) !== getAssetString(asset))
            .forEach((token) => {
                const newAmount = (
                    (Number(roundedValue) * +reserves.get(getAssetString(token))) /
                    +reserves.get(getAssetString(asset))
                ).toFixed(7);
                setAmounts(
                    new Map(amounts.set(getAssetString(token), Number(newAmount).toFixed(7))),
                );
            });
    };

    return (
        <Container>
            <ModalTitle>Add liquidity</ModalTitle>
            {Number(pool.total_share) === 0 && (
                <Alert
                    title="This is the first deposit into this pool."
                    text="We recommend depositing tokens
                        according to the market rate. Otherwise, traders may profit from your
                        deposit, and you could lose money."
                />
            )}
            <Form>
                {pool.assets.map((asset) => (
                    <FormRow>
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
                                    isDark
                                    position={TOOLTIP_POSITION.left}
                                    content={
                                        <TooltipInnerBalance>
                                            {account
                                                .getReservesForSwap(asset)
                                                .map(({ label, value }) => (
                                                    <TooltipRow key={label}>
                                                        <span>{label}</span>
                                                        <span>
                                                            {value} {asset.code}
                                                        </span>
                                                    </TooltipRow>
                                                ))}
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
                        />
                    </FormRow>
                ))}

                <DescriptionRow>
                    <span>Type</span>
                    <span>{pool.pool_type === 'stable' ? 'Stable swap' : 'Constant product'}</span>
                </DescriptionRow>
                <DescriptionRow>
                    <span>Fee</span>
                    <span>{(pool.fee * 100).toFixed(2)} %</span>
                </DescriptionRow>
                <DescriptionRow>
                    <span>Liquidity</span>
                    <span>
                        {pool.liquidity
                            ? `$${formatBalance(
                                  (pool.liquidity * StellarService.priceLumenUsd) / 1e7,
                                  true,
                              )}`
                            : '0'}
                    </span>
                </DescriptionRow>

                <PoolInfo>
                    <DescriptionRow>
                        <span>Share of Pool</span>
                        <span>{shares}</span>
                    </DescriptionRow>
                    {pool.assets.map((asset) => (
                        <DescriptionRow>
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
                                        {formatBalance(+reserves.get(getAssetString(asset)), true)}
                                        <Arrow />
                                    </>
                                )}
                                {reserves !== null ? (
                                    formatBalance(
                                        +reserves.get(getAssetString(asset)) +
                                            +amounts.get(getAssetString(asset)),
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
                    onClick={() => submitWithWarning()}
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
