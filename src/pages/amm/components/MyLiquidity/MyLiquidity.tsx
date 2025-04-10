import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getUserPools } from 'api/amm';

import { MainRoutes } from 'constants/routes';

import { getAquaAssetData, getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import {
    ModalService,
    SorobanService,
    StellarService,
    ToastService,
} from 'services/globalServices';
import { POOL_TYPE } from 'services/soroban.service';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { PoolRewardsInfo, PoolUserProcessed } from 'types/amm';
import { Int128Parts } from 'types/stellar';

import { flexAllCenter, flexRowSpaceBetween, respondDown, textEllipsis } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import AquaLogo from 'assets/aqua-logo-small.svg';
import IconClaim from 'assets/icon-claim.svg';
import IconInfo from 'assets/icon-info.svg';

import ApyBoosted from 'basics/ApyBoosted';
import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import Label from 'basics/Label';
import { CircleLoader, DotsLoader } from 'basics/loaders';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Table, { CellAlign } from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import NoTrustline from 'components/NoTrustline';

import BoostTooltip from 'pages/amm/components/BoostTooltip/BoostTooltip';
import ExpandedMenu from 'pages/amm/components/MyLiquidity/ExpandedMenu/ExpandedMenu';
import MigratePoolButton from 'pages/amm/components/PoolsList/MigratePoolButton/MigratePoolButton';
import { AnalyticsTabs, AnalyticsUrlParams } from 'pages/amm/pages/Analytics';
import { ProfileTabs, ProfileUrlParams } from 'pages/profile/Profile';
import { ExternalLinkStyled } from 'pages/profile/SdexRewards/SdexRewards';
import { Empty } from 'pages/profile/YourVotes/YourVotes';

const PoolsListBlock = styled.div<{ $onlyList: boolean }>`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    margin: 4.8rem auto 5rem;

    ${({ $onlyList }) =>
        !$onlyList &&
        `
        padding: 4.8rem;
        border-radius: 0.5rem;
        box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
        margin-top: 0;
    `}

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 0;
        background-color: ${COLORS.lightGray};
    `}
`;

const ListHeader = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 2rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

const ListTitle = styled.h3`
    font-size: 3.6rem;
    line-height: 4.2rem;
    font-weight: 400;

    ${respondDown(Breakpoints.sm)`
        font-size: 2.8rem;
    `}
`;

const ListTotal = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;

    span:last-child {
        font-weight: 700;
    }
`;

const NoTrustlineStyled = styled(NoTrustline)`
    background-color: ${COLORS.white}!important;

    ${respondDown(Breakpoints.sm)`
        background-color: ${COLORS.lightGray}!important;
    `}
`;

const Section = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
`;

const LoginButton = styled(Button)`
    margin-top: 1rem;
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    margin-bottom: 4rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const SelectWrapper = styled.div`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: flex;
        padding: 0 1.6rem;
    `}
`;

const SelectStyled = styled(Select)`
    margin-bottom: 4rem;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const Buttons = styled.div`
    display: flex;
    gap: 0.8rem;
`;

const RewardsWrap = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.lightGray};
    padding: 3.2rem;
    border-radius: 0.5rem;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.md)`
        background-color: ${COLORS.white};
    `}
`;

const AquaLogoStyled = styled(AquaLogo)`
    height: 4.8rem;
    width: 4.8rem;
`;

const Rewards = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 2rem;
    `}
`;

const Pooled = styled.div`
    display: flex;
    gap: 0.8rem;
    align-items: center;
`;

const RewardsDescription = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.grayText};
    font-size: 1.4rem;

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
        display: flex;
        align-items: center;

        svg {
            margin: 0 0.5rem;
        }
    }

    ${respondDown(Breakpoints.md)`
        text-align: center;
    `}
`;

const StyledButton = styled(Button)`
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
        margin-left: 0;
    `}
`;

const RewardsTooltipInner = styled.div`
    width: 20rem;
    white-space: wrap;
    line-height: 2rem;
    font-size: 1.4rem;
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    max-width: calc(100vw - 12rem);
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 1.4rem;
    line-height: 2rem;
    gap: 2rem;

    span:first-child {
        color: ${COLORS.grayText};
        width: 60%;
        ${textEllipsis};
    }

    span:last-child {
        color: ${COLORS.paragraphText};
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
`;

const IconInfoStyled = styled(IconInfo)`
    cursor: help;
`;

const BoostValues = styled.div`
    display: flex;
    gap: 0.4rem;
    cursor: help !important;

    & > * {
        cursor: help !important;
    }
`;

enum FilterValues {
    all = 'all',
    volatile = 'volatile',
    stable = 'stable',
    classic = 'classic',
}

enum UrlParams {
    filter = 'filter',
}

const FilterOptions = [
    { label: 'All', value: FilterValues.all },
    { label: 'Stable', value: FilterValues.stable },
    { label: 'Volatile', value: FilterValues.volatile },
    { label: 'Classic', value: FilterValues.classic },
];

interface MyLiquidityProps {
    setTotal?: (total: number) => void;
    onlyList?: boolean;
    backToAllPools?: () => void;
}

const CLAIM_ALL_ID = 'all';

const CLAIM_ALL_COUNT = 5;

const MyLiquidity = ({ setTotal, onlyList, backToAllPools }: MyLiquidityProps) => {
    const { account } = useAuthStore();

    const [pools, setPools] = useState<PoolUserProcessed[]>([]);
    const [classicPools, setClassicPools] = useState([]);
    const [userRewards, setUserRewards] = useState<Map<string, PoolRewardsInfo>>(new Map());
    const [rewardsSum, setRewardsSum] = useState(0);
    const [claimPendingId, setClaimPendingId] = useState(null);
    const [filter, setFilter] = useState(null);

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        if (
            params.get(AnalyticsUrlParams.tab) !== AnalyticsTabs.my &&
            params.get(ProfileUrlParams.tab) !== ProfileTabs.liquidity
        ) {
            return;
        }
        const filterParam = params.get(UrlParams.filter);

        if (filterParam) {
            setFilter(filterParam as FilterValues);
        } else {
            params.append(UrlParams.filter, FilterValues.all);
            setFilter(FilterValues.all);
            history.replace({ search: params.toString() });
        }
    }, [location]);

    const setFilterValue = (value: FilterValues) => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.filter, value);
        history.push({ search: params.toString() });
    };

    const updateIndex = useUpdateIndex(5000);

    const { aquaStellarAsset } = getAquaAssetData();

    const filteredPools = useMemo(() => {
        if (filter === FilterValues.classic) {
            return classicPools;
        }
        if (filter === FilterValues.volatile) {
            return pools.filter(({ pool_type }) => pool_type === POOL_TYPE.constant);
        }
        if (filter === FilterValues.stable) {
            return pools.filter(({ pool_type }) => pool_type === POOL_TYPE.stable);
        }
        return [...pools, ...classicPools];
    }, [classicPools, pools, filter]);

    const updateData = () => {
        if (account) {
            getUserPools(account.accountId()).then(res => {
                setPools(res);
            });

            account?.getClassicPools().then(res => {
                setClassicPools(res);
            });
        }
    };

    useEffect(() => {
        if (!account || !pools) {
            setUserRewards(new Map());
            return;
        }
        Promise.all(
            pools.map(({ address }) => SorobanService.getPoolRewards(account.accountId(), address)),
        ).then(res => {
            const map = new Map<string, PoolRewardsInfo>();
            let sum = 0;

            res.forEach((reward, index) => {
                sum += Number(reward.to_claim);
                if (Number(reward.to_claim)) {
                    map.set(pools[index].address, reward);
                }
            });
            setUserRewards(map);
            setRewardsSum(sum);
        });
    }, [pools, account, updateIndex]);

    useEffect(() => {
        updateData();
    }, [account, updateIndex]);

    const { totalLiquidity, poolsLiquidity } = useMemo(() => {
        const map = new Map<string, number>();
        const totalSorobanUsd = pools.reduce((acc, pool) => {
            const balance = Number(pool.balance) / 1e7;
            const liquidity = Number(pool.liquidity_usd) / 1e7;
            const totalShare = Number(pool.total_share) / 1e7;

            map.set(pool.address, (balance / totalShare) * liquidity);
            acc += (balance / totalShare) * liquidity;
            return acc;
        }, 0);

        const totalClassicXlm = classicPools.reduce((acc, pool) => {
            const balance = Number(pool.balance) / 1e7;
            const liquidity = Number(pool.liquidity) / 1e7;
            const totalShare = Number(pool.total_share) / 1e7;

            map.set(pool.id, (balance / totalShare) * liquidity * StellarService.priceLumenUsd);

            acc += (balance / totalShare) * liquidity;
            return acc;
        }, 0);

        const totalClassicUsd = totalClassicXlm * StellarService.priceLumenUsd;
        const total = totalClassicUsd + totalSorobanUsd;

        if (setTotal) {
            setTotal(total);
        }
        return { totalLiquidity: total, poolsLiquidity: map };
    }, [pools, classicPools]);

    const claim = (poolId: string) => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setClaimPendingId(poolId);

        SorobanService.getClaimRewardsTx(account.accountId(), poolId)
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses; value: () => Int128Parts }) => {
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
                const value = SorobanService.i128ToInt(res.value());

                ToastService.showSuccessToast(`Claimed ${formatBalance(+value)} AQUA`);
                setClaimPendingId(null);
            })
            .catch(err => {
                ToastService.showErrorToast(err.message ?? err.toString());
                setClaimPendingId(null);
            });
    };

    const claimAll = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setClaimPendingId(CLAIM_ALL_ID);

        const top5RewardsPools = [...userRewards.entries()]
            .sort((a, b) => Number(b[1].to_claim) - Number(a[1].to_claim))
            .slice(0, CLAIM_ALL_COUNT)
            .map(([key]) => key);

        SorobanService.getClaimBatchTx(account.accountId(), top5RewardsPools)
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses; value: () => Int128Parts }) => {
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

                ToastService.showSuccessToast('Claimed successfully');
                setClaimPendingId(null);
            })
            .catch(err => {
                ToastService.showErrorToast(err.message ?? err.toString());
                setClaimPendingId(null);
            });
    };

    const calculateBoostValue = (rewardsInfo: PoolRewardsInfo, userBalance: string) => {
        if (!rewardsInfo) return 1;
        const tps = +rewardsInfo.tps;
        const wSupply = +rewardsInfo.working_supply;
        const wBalance = +rewardsInfo.working_balance;

        if (!tps || !wSupply || !wBalance) return 1;

        const tpsWithoutBoost = ((+userBalance / 1e7) * tps) / wSupply;
        const expectedTps = (tps * wBalance) / wSupply;

        if (tpsWithoutBoost === 0) return 1;

        return expectedTps / tpsWithoutBoost;
    };

    if (!account) {
        return (
            <Section>
                <Empty>
                    <h3>Log in required.</h3>
                    <span>To use you need to log in.</span>

                    <LoginButton onClick={() => ModalService.openModal(ChooseLoginMethodModal, {})}>
                        Log in
                    </LoginButton>
                </Empty>
            </Section>
        );
    }

    return (
        <PoolsListBlock $onlyList={onlyList}>
            {!onlyList && (
                <ListHeader>
                    <ListTitle>My liquidity positions</ListTitle>
                    <ListTotal>
                        <span>Total: </span>
                        <span>${formatBalance(totalLiquidity, true)}</span>
                    </ListTotal>
                </ListHeader>
            )}

            <ToggleGroupStyled value={filter} options={FilterOptions} onChange={setFilterValue} />

            <SelectWrapper>
                <SelectStyled value={filter} options={FilterOptions} onChange={setFilterValue} />
            </SelectWrapper>

            {Boolean(rewardsSum) && (
                <RewardsWrap>
                    <Rewards>
                        <AquaLogoStyled />
                        <RewardsDescription>
                            <span>
                                You have {userRewards.size ?? ''} unclaimed rewards
                                <Tooltip
                                    content={
                                        <RewardsTooltipInner>
                                            One can claim not more than {CLAIM_ALL_COUNT} rewards at
                                            a time. If you have more than {CLAIM_ALL_COUNT} rewards
                                            you will have to make multiple claims.
                                        </RewardsTooltipInner>
                                    }
                                    position={TOOLTIP_POSITION.top}
                                    showOnHover
                                >
                                    <IconInfoStyled />
                                </Tooltip>
                            </span>
                            <span>for {formatBalance(rewardsSum)} AQUA</span>
                        </RewardsDescription>
                        <StyledButton
                            disabled={Boolean(claimPendingId) && claimPendingId !== CLAIM_ALL_ID}
                            onClick={() => claimAll()}
                            pending={claimPendingId === CLAIM_ALL_ID}
                        >
                            {userRewards.size > CLAIM_ALL_COUNT
                                ? `Claim Top ${CLAIM_ALL_COUNT}`
                                : 'Claim rewards'}
                        </StyledButton>
                    </Rewards>

                    <NoTrustlineStyled asset={aquaStellarAsset} />
                </RewardsWrap>
            )}
            {!filteredPools ? (
                <PageLoader />
            ) : filteredPools.length ? (
                <Table
                    mobileBreakpoint={Breakpoints.lg}
                    head={[
                        {
                            children: 'Pool',
                            flexSize: 3.5,
                        },
                        { children: 'Base APY', flexSize: 0.6 },
                        { children: 'Rewards APY', flexSize: 1.2 },
                        { children: 'Pooled' },
                        { children: 'My daily rewards' },
                        { children: 'Rewards to claim', align: CellAlign.Right },
                        { children: '' },
                    ]}
                    body={filteredPools.map(pool => {
                        const boostValue = calculateBoostValue(
                            userRewards.get(pool.address),
                            pool.balance,
                        );
                        const poolRewardsData = userRewards.get(pool.address);

                        const userRewardsValue = poolRewardsData
                            ? (+poolRewardsData.tps *
                                  60 *
                                  60 *
                                  24 *
                                  +poolRewardsData.working_balance) /
                              +poolRewardsData.working_supply
                            : 0;
                        return {
                            key: pool.address || pool.id,
                            rowItems: [
                                {
                                    children: (
                                        <Market
                                            assets={pool.assets}
                                            mobileVerticalDirections
                                            withoutLink
                                            poolType={pool.pool_type as POOL_TYPE}
                                            isRewardsOn={Boolean(Number(pool.reward_tps))}
                                            poolAddress={pool.address}
                                            fee={pool.fee}
                                        />
                                    ),
                                    flexSize: 3.5,
                                },
                                {
                                    children: pool.apy
                                        ? `${formatBalance(+(pool.apy * 100).toFixed(2), true)}%`
                                        : '-',
                                    label: 'Base APY',
                                    flexSize: 0.6,
                                },
                                {
                                    children: !pool.rewards_apy ? (
                                        '-'
                                    ) : boostValue === 1 ? (
                                        `${formatBalance(
                                            +(pool.rewards_apy * 100).toFixed(2),
                                            true,
                                        )}%`
                                    ) : (
                                        <Tooltip
                                            content={
                                                <BoostTooltip pool={pool} userBoost={boostValue} />
                                            }
                                            showOnHover
                                            background={COLORS.white}
                                        >
                                            <BoostValues>
                                                <ApyBoosted
                                                    value={pool.rewards_apy * 100 * boostValue}
                                                    color="purple"
                                                />
                                                <Label
                                                    labelText={
                                                        boostValue.toFixed(2) === '1.00'
                                                            ? '< x1.01'
                                                            : `x${boostValue.toFixed(2)}`
                                                    }
                                                    labelSize="medium"
                                                    background={COLORS.darkBlue}
                                                    withoutUppercase
                                                />
                                            </BoostValues>
                                        </Tooltip>
                                    ),
                                    label: 'Rewards APY',
                                    flexSize: 1.2,
                                },
                                {
                                    children: poolsLiquidity.has(pool.address || pool.id) ? (
                                        <Pooled>
                                            <span>
                                                $
                                                {formatBalance(
                                                    poolsLiquidity.get(pool.address || pool.id),
                                                    true,
                                                )}
                                            </span>
                                            <Tooltip
                                                content={
                                                    <TooltipInner>
                                                        {pool.assets.map((asset, index) => (
                                                            <TooltipRow key={getAssetString(asset)}>
                                                                <span>Pooled {asset.code}</span>
                                                                <span>
                                                                    {formatBalance(
                                                                        (pool.reserves[index] *
                                                                            pool.balance) /
                                                                            pool.total_share /
                                                                            1e7,
                                                                        true,
                                                                    )}
                                                                    <AssetLogo
                                                                        asset={asset}
                                                                        isSmall
                                                                        isCircle
                                                                    />
                                                                </span>
                                                            </TooltipRow>
                                                        ))}
                                                        <TooltipRow>
                                                            <span>Shares</span>
                                                            <span>
                                                                {formatBalance(
                                                                    pool.balance / 1e7,
                                                                    true,
                                                                )}{' '}
                                                                (
                                                                {+(
                                                                    (100 * pool.balance) /
                                                                    Number(pool.total_share)
                                                                ) > 0.01
                                                                    ? formatBalance(
                                                                          +(
                                                                              (100 * pool.balance) /
                                                                              Number(
                                                                                  pool.total_share,
                                                                              )
                                                                          ).toFixed(2),
                                                                          true,
                                                                      )
                                                                    : '< 0.01'}
                                                                %)
                                                            </span>
                                                        </TooltipRow>
                                                    </TooltipInner>
                                                }
                                                position={
                                                    +window.innerWidth > 1200
                                                        ? TOOLTIP_POSITION.top
                                                        : TOOLTIP_POSITION.left
                                                }
                                                background={COLORS.white}
                                                showOnHover
                                            >
                                                <IconInfoStyled />
                                            </Tooltip>
                                        </Pooled>
                                    ) : (
                                        '-'
                                    ),
                                    label: 'Pooled',
                                },
                                {
                                    children:
                                        pool.pool_type === POOL_TYPE.classic ? (
                                            '-'
                                        ) : poolRewardsData ? (
                                            `${formatBalance(userRewardsValue, true)} AQUA`
                                        ) : (
                                            <DotsLoader />
                                        ),
                                    label: 'My daily rewards',
                                    mobileStyle: { textAlign: 'right' },
                                },
                                {
                                    children: `${formatBalance(
                                        Number(userRewards.get(pool.address)?.to_claim) || 0,
                                        true,
                                    )} AQUA`,
                                    label: 'Rewards to claim',
                                    align: CellAlign.Right,
                                    mobileStyle: { textAlign: 'right' },
                                },
                                {
                                    children: (
                                        <Buttons>
                                            {pool.address ? (
                                                <Button
                                                    isSquare
                                                    pending={pool.address === claimPendingId}
                                                    disabled={
                                                        (pool.address !== claimPendingId &&
                                                            Boolean(claimPendingId)) ||
                                                        !Number(
                                                            userRewards.get(pool.address)?.to_claim,
                                                        )
                                                    }
                                                    onClick={() => claim(pool.address)}
                                                    title="Claim rewards"
                                                >
                                                    {pool.address === claimPendingId ? (
                                                        <CircleLoader isWhite size="small" />
                                                    ) : (
                                                        <IconClaim />
                                                    )}
                                                </Button>
                                            ) : (
                                                <MigratePoolButton
                                                    isSmall
                                                    pool={pool}
                                                    onUpdate={() => {}}
                                                />
                                            )}
                                            <ExpandedMenu pool={pool} />
                                        </Buttons>
                                    ),
                                    align: CellAlign.Right,
                                },
                            ],
                        };
                    })}
                />
            ) : (
                <Section>
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>It looks like you don’t have any active liquidity positions.</span>

                        <ExternalLinkStyled asDiv>
                            <Link
                                to={MainRoutes.amm}
                                onClick={() => {
                                    if (backToAllPools) {
                                        backToAllPools();
                                    }
                                }}
                            >
                                Browse pools
                            </Link>
                        </ExternalLinkStyled>
                    </Empty>
                </Section>
            )}
        </PoolsListBlock>
    );
};

export default MyLiquidity;
