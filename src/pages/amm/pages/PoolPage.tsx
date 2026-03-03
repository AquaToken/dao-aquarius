import { xdr } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getPool } from 'api/amm';

import { ChartPeriods } from 'constants/charts';
import { DAY } from 'constants/intervals';
import { AppRoutes } from 'constants/routes';

import { keyOfPosition, normalizePositions } from 'helpers/amm-concentrated-positions';
import { contractValueToAmount } from 'helpers/amount';
import { getAquaAssetData, getAssetString } from 'helpers/assets';
import getExplorerLink, { ExplorerSection } from 'helpers/explorer-links';
import { formatBalance } from 'helpers/format-number';
import { truncateString } from 'helpers/truncate-string';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { ModalService, SorobanService, ToastService } from 'services/globalServices';

import { ConcentratedPosition, PoolExtended, PoolIncentives } from 'types/amm';
import { ClassicToken, SorobanToken, TokenType } from 'types/token';

import ArrowLeft from 'assets/icons/arrows/arrow-left-16.svg';
import SettingsIcon from 'assets/icons/nav/icon-settings-16.svg';

import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import CircleButton from 'basics/buttons/CircleButton';
import CopyButton from 'basics/buttons/CopyButton';
import { ExternalLink } from 'basics/links';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';

import MigrateToSorobanBanner from 'components/MigrateToSorobanBanner';
import NoTrustline from 'components/NoTrustline';

import RewardsSettingsModal from 'modals/RewardsSettingsModal';

import { commonMaxWidth, flexAllCenter, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import LiquidityDistributionChart from 'pages/amm/components/LiquidityDistributionChart/LiquidityDistributionChart';
import type { LiquidityDistributionChartHandle } from 'pages/amm/components/LiquidityDistributionChart/LiquidityDistributionChart';

import LiquidityChart from '../components/LiquidityChart/LiquidityChart';
import PoolEvents from '../components/PoolEvents/PoolEvents';
import PoolMembers from '../components/PoolMembers/PoolMembers';
import Sidebar from '../components/Sidebar/Sidebar';
import VolumeChart from '../components/VolumeChart/VolumeChart';

const MainBlock = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.gray50};
    z-index: 1;
`;

const Background = styled.div`
    width: 100%;
    padding: 4rem 0 6rem;
    background-color: ${COLORS.gray50};

    ${respondDown(Breakpoints.md)`
        padding: 1.6rem 0;
    `}
`;

const Section = styled.section<{ $smallTopPadding?: boolean }>`
    ${commonMaxWidth};
    padding-top: ${({ $smallTopPadding }) => ($smallTopPadding ? '2rem' : '2.8rem')};
    padding-left: 4rem;
    padding-right: calc(10vw + 20rem);
    width: 100%;

    &:last-child {
        margin-bottom: 6.6rem;
    }

    ${respondDown(Breakpoints.xxxl)`
        padding-right: calc(10vw + 30rem);
    `}

    ${respondDown(Breakpoints.xxl)`
        padding-right: calc(10vw + 40rem);
    `}

    ${respondDown(Breakpoints.lg)`
        padding: 3.2rem 1.6rem 0;
    `}
`;

const SectionWrap = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    padding: 4.2rem 3.2rem 4.2rem;
    border-radius: 0.5rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `}
`;

const Rewards = styled.div`
    ${flexRowSpaceBetween};

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 2rem;
    `}
`;

const RewardsDescription = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.textTertiary};
    font-weight: 700;
    font-size: 2.6rem;

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.textPrimary};
        margin-bottom: 0.8rem;
    }

    ${respondDown(Breakpoints.md)`
        align-items: center;
    `}
`;

const IncentiveAmount = styled.span`
    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }
`;

const SectionRow = styled.div`
    ${flexRowSpaceBetween};
    align-items: center;
    color: ${COLORS.textTertiary};
    margin: 1rem 0;
    height: 2.8rem;
    font-size: 1.6rem;

    span {
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
`;

const SectionLabel = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textGray};
`;

const Charts = styled.div`
    display: flex;
    justify-content: space-evenly;
    gap: 1.6rem;
    padding: 1.6rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        padding: 0;
    `}
`;

const Chart = styled.div`
    ${flexAllCenter};
    border-radius: 0.6rem;
    padding: 1.6rem;
    flex: 1;
    background-color: ${COLORS.gray50};
`;

const Links = styled.div`
    display: flex;
    gap: 3.2rem;
`;

const ExternalLinkStyled = styled(ExternalLink)`
    margin-top: 1.6rem;
`;

const DistributionCard = styled.div`
    margin: 1.6rem 0 2.4rem;
    border: 0.1rem solid ${COLORS.gray100};
    border-radius: 1.2rem;
    padding: 2rem;
`;

const DistributionTitle = styled.h6`
    margin: 0;
    font-size: 2.2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
`;

const DistributionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    margin-bottom: 1.6rem;
`;

const DistributionControls = styled.div`
    display: flex;
    gap: 0.8rem;
`;

const DistributionControlButton = styled.button`
    width: 3.2rem;
    height: 3.2rem;
    border: none;
    border-radius: 0.8rem;
    background: ${COLORS.gray50};
    color: ${COLORS.textPrimary};
    font-size: 1.8rem;
    cursor: pointer;
`;

const DistributionCanvas = styled.div`
    position: relative;
    height: 28rem;
    border-radius: 1rem;
    background: ${COLORS.gray50};
    border: 0.1rem solid ${COLORS.gray100};
    padding: 1rem 1rem 1rem 1.8rem;
`;

const DistributionLoader = styled.div`
    ${flexAllCenter};
    width: 100%;
    height: 100%;
`;

const SettingsIconPurple = styled(SettingsIcon)`
    path {
        stroke: ${COLORS.purple500};
    }
`;

const PageHeader = styled.div`
    ${flexRowSpaceBetween};
    align-items: center;
    margin-bottom: 7.2rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 3.2rem;
    `}
`;

const PoolPage = () => {
    const [pool, setPool] = useState<PoolExtended | null>(null);
    const [rewards, setRewards] = useState(null);
    const [incentives, setIncentives] = useState<PoolIncentives[] | null>(null);
    const { poolAddress } = useParams<{ poolAddress: string }>();
    const [claimPending, setClaimPending] = useState(false);
    const [claimIncentivePending, setClaimIncentivePending] = useState(false);
    const [chartWidth, setChartWidth] = useState(0);
    const [distributionItems, setDistributionItems] = useState<
        { tickLower: number; tickUpper: number; liquidity: number }[]
    >([]);
    const [distributionCurrentTick, setDistributionCurrentTick] = useState<number | null>(null);
    const [distributionLoading, setDistributionLoading] = useState(false);
    const [distributionReady, setDistributionReady] = useState(false);

    const { account, isLogged } = useAuthStore();

    const navigate = useNavigate();

    const updateIndex = useUpdateIndex(5000);

    const { aquaStellarAsset } = getAquaAssetData();

    const chartRef = useRef<HTMLDivElement>(null);
    const distributionChartRef = useRef<LiquidityDistributionChartHandle>(null);

    useEffect(() => {
        if (!pool) {
            return;
        }
        if (!account) {
            setRewards(null);
            return;
        }
        SorobanService.amm.getPoolRewards(account.accountId(), pool.address).then(setRewards);

        SorobanService.amm.getPoolIncentives(account.accountId(), pool.address).then(setIncentives);
    }, [account, pool, updateIndex]);

    useEffect(() => {
        getPool(poolAddress).then(res => {
            setPool(res);
        });
    }, [poolAddress, updateIndex]);

    useEffect(() => {
        if (!pool) {
            return;
        }
        const updateWidth = () => {
            if (chartRef.current) {
                setChartWidth(chartRef.current.offsetWidth - 32);
            }
        };
        updateWidth();

        const handleResize = () => {
            requestAnimationFrame(updateWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [pool]);

    useEffect(() => {
        if (!pool || pool.pool_type !== 'concentrated') {
            return;
        }
        setDistributionReady(false);
        setDistributionItems([]);
        setDistributionCurrentTick(null);
    }, [pool?.address]);

    useEffect(() => {
        if (!pool || pool.pool_type !== 'concentrated') {
            setDistributionItems([]);
            setDistributionCurrentTick(null);
            setDistributionLoading(false);
            setDistributionReady(false);
            return;
        }

        let cancelled = false;

        const hydratePositionsLiquidity = async (ranges: ConcentratedPosition[]) => {
            if (!account || !ranges.length) {
                return ranges;
            }

            const resolved = await Promise.all(
                ranges.map(async range => {
                    try {
                        const position = await SorobanService.amm.getPosition(
                            pool.address,
                            account.accountId(),
                            range.tickLower,
                            range.tickUpper,
                        );
                        return {
                            ...range,
                            liquidity: position?.liquidity ?? range.liquidity ?? '0',
                        };
                    } catch {
                        return range;
                    }
                }),
            );

            return resolved.filter(item => Number(item.liquidity || 0) > 0);
        };

        const loadDistribution = async () => {
            const shouldShowLoader = !distributionReady;
            if (shouldShowLoader) {
                setDistributionLoading(true);
            }

            try {
                const [slot0, snapshot] = await Promise.all([
                    SorobanService.amm.getConcentratedSlot0(pool.address),
                    account
                        ? SorobanService.amm.getUserPositionSnapshot(
                              pool.address,
                              account.accountId(),
                          )
                        : Promise.resolve(null),
                ]);

                if (cancelled) {
                    return;
                }

                setDistributionCurrentTick(Number((slot0 as Record<string, unknown>)?.tick));

                if (!account || !snapshot) {
                    setDistributionItems([]);
                    return;
                }

                const ranges = normalizePositions(snapshot);
                const hydrated = await hydratePositionsLiquidity(ranges);

                if (cancelled) {
                    return;
                }

                const totalLiquidityUsd = new BigNumber(pool.liquidity_usd || 0).dividedBy(1e7);
                const totalPositionsLiquidity = hydrated.reduce(
                    (acc, position) => acc.plus(position.liquidity || 0),
                    new BigNumber(0),
                );
                const usdPerLiquidity = totalPositionsLiquidity.gt(0)
                    ? totalLiquidityUsd.dividedBy(totalPositionsLiquidity)
                    : new BigNumber(0);

                const unique = new Map(
                    hydrated.map(position => [
                        keyOfPosition(position),
                        {
                            tickLower: position.tickLower,
                            tickUpper: position.tickUpper,
                            liquidity: new BigNumber(position.liquidity || 0)
                                .multipliedBy(usdPerLiquidity)
                                .toNumber(),
                        },
                    ]),
                );

                setDistributionItems(
                    [...unique.values()].filter(position => position.liquidity > 0),
                );
            } catch {
                if (cancelled) {
                    return;
                }
                setDistributionItems([]);
                setDistributionCurrentTick(null);
            } finally {
                if (!cancelled) {
                    setDistributionLoading(false);
                    setDistributionReady(true);
                }
            }
        };

        loadDistribution();

        return () => {
            cancelled = true;
        };
    }, [pool, account, updateIndex]);

    const claim = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setClaimPending(true);

        SorobanService.amm
            .getClaimRewardsTx(account.accountId(), pool.address)
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses }) => {
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
                const value = SorobanService.scVal.i128ToInt(res as xdr.ScVal);

                ToastService.showSuccessToast(`Claimed ${formatBalance(+value)} AQUA`);
                setClaimPending(false);
            })
            .catch(err => {
                ToastService.showErrorToast(err.message ?? err.toString());
                setClaimPending(false);
            });
    };

    const claimIncentive = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setClaimIncentivePending(true);

        SorobanService.amm
            .getClaimIncentiveTx(account.accountId(), pool.address)
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses }) => {
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
                setClaimIncentivePending(false);
            })
            .catch(err => {
                ToastService.showErrorToast(err.message ?? err.toString());
                setClaimIncentivePending(false);
            });
    };

    const hasIncentivesToClaim = useMemo(() => {
        if (!incentives || !incentives.length) return false;

        return incentives.some(({ info }) => !!Number(info.user_reward));
    }, [incentives]);

    if (!pool) {
        return <PageLoader />;
    }

    return (
        <MainBlock>
            <Background>
                <Section>
                    <PageHeader>
                        <CircleButton
                            label="Pools"
                            onClick={() => {
                                navigate(AppRoutes.section.amm.link.index);
                            }}
                        >
                            <ArrowLeft />
                        </CircleButton>

                        {isLogged && (
                            <CircleButton
                                onClick={() =>
                                    ModalService.openModal(RewardsSettingsModal, { pool })
                                }
                            >
                                <SettingsIconPurple />
                            </CircleButton>
                        )}
                    </PageHeader>
                    <Market
                        assets={pool.tokens}
                        leftAlign
                        bigCodes
                        isBigLogo
                        isCircleLogos
                        withoutLink
                        mobileVerticalDirections
                    />
                    <Links>
                        {pool.tokens.length === 2 &&
                            pool.tokens.every(({ type }) => type !== TokenType.soroban) && (
                                <ExternalLinkStyled
                                    to={AppRoutes.section.market.to.market({
                                        base: getAssetString(pool.tokens[0]),
                                        counter: getAssetString(pool.tokens[1]),
                                    })}
                                >
                                    View Market
                                </ExternalLinkStyled>
                            )}
                        <ExternalLinkStyled
                            href={getExplorerLink(ExplorerSection.contract, pool.address)}
                        >
                            View on Explorer
                        </ExternalLinkStyled>
                    </Links>
                </Section>
                <Sidebar pool={pool} />

                {pool.tokens.length === 2 &&
                    pool.tokens.every(({ type }) => type === TokenType.classic) && (
                        <Section>
                            <MigrateToSorobanBanner
                                base={pool.tokens[0] as ClassicToken}
                                counter={pool.tokens[1] as ClassicToken}
                            />
                        </Section>
                    )}

                {Boolean(rewards && Number(rewards.to_claim)) && (
                    <Section>
                        <SectionWrap>
                            <Rewards>
                                <RewardsDescription>
                                    <span>You have AQUA rewards:</span>
                                    <span>{formatBalance(rewards.to_claim)} AQUA</span>
                                </RewardsDescription>
                                <Button
                                    onClick={() => claim()}
                                    pending={claimPending}
                                    disabled={
                                        pool.claim_killed ||
                                        account?.getAssetBalance(aquaStellarAsset) === null
                                    }
                                >
                                    Claim rewards
                                </Button>
                            </Rewards>
                            <NoTrustline asset={aquaStellarAsset} />
                        </SectionWrap>
                    </Section>
                )}

                {hasIncentivesToClaim && Boolean(account) && (
                    <Section>
                        <SectionWrap>
                            <Rewards>
                                <RewardsDescription>
                                    <span>You have extra incentives:</span>
                                    {incentives
                                        .filter(({ info }) => !!Number(info.user_reward))
                                        .map(({ token, info }) => (
                                            <IncentiveAmount key={token.contract}>
                                                {formatBalance(+info.user_reward, true)}{' '}
                                                {token.code}
                                            </IncentiveAmount>
                                        ))}
                                </RewardsDescription>
                                <Button
                                    onClick={() => claimIncentive()}
                                    pending={claimIncentivePending}
                                    disabled={incentives.some(
                                        ({ token }) =>
                                            token.type === TokenType.classic &&
                                            account.getAssetBalance(token) === null,
                                    )}
                                >
                                    Claim incentives
                                </Button>
                            </Rewards>
                            {incentives.map(({ token }) => (
                                <NoTrustline key={token.contract} asset={token} />
                            ))}
                        </SectionWrap>
                    </Section>
                )}
                <Section>
                    <SectionWrap>
                        {Boolean(pool.stats.length) && (
                            <Charts>
                                <Chart ref={chartRef}>
                                    <LiquidityChart
                                        data={pool.stats}
                                        currentLiquidity={pool.liquidity_usd}
                                        width={chartWidth}
                                        defaultPeriod={ChartPeriods.month}
                                    />
                                </Chart>
                                <Chart>
                                    <VolumeChart
                                        data={pool.stats}
                                        volume24h={{ volume_usd: pool.volume_usd }}
                                        width={chartWidth}
                                        defaultPeriod={ChartPeriods.month}
                                    />
                                </Chart>
                            </Charts>
                        )}
                        {pool.pool_type === 'concentrated' && (
                            <DistributionCard>
                                <DistributionHeader>
                                    <DistributionTitle>Liquidity Distribution</DistributionTitle>
                                    <DistributionControls>
                                        <DistributionControlButton
                                            type="button"
                                            onClick={() => distributionChartRef.current?.panLeft()}
                                        >
                                            ←
                                        </DistributionControlButton>
                                        <DistributionControlButton
                                            type="button"
                                            onClick={() => distributionChartRef.current?.panRight()}
                                        >
                                            →
                                        </DistributionControlButton>
                                        <DistributionControlButton
                                            type="button"
                                            onClick={() => distributionChartRef.current?.zoomOut()}
                                        >
                                            -
                                        </DistributionControlButton>
                                        <DistributionControlButton
                                            type="button"
                                            onClick={() => distributionChartRef.current?.zoomIn()}
                                        >
                                            +
                                        </DistributionControlButton>
                                        <DistributionControlButton
                                            type="button"
                                            onClick={() =>
                                                distributionChartRef.current?.resetView()
                                            }
                                        >
                                            ↺
                                        </DistributionControlButton>
                                    </DistributionControls>
                                </DistributionHeader>
                                <DistributionCanvas>
                                    {distributionLoading && !distributionReady ? (
                                        <DistributionLoader>
                                            <PageLoader />
                                        </DistributionLoader>
                                    ) : (
                                        <LiquidityDistributionChart
                                            ref={distributionChartRef}
                                            items={distributionItems}
                                            currentTick={distributionCurrentTick}
                                            decimalsDiff={
                                                pool.tokens[0].decimal - pool.tokens[1].decimal
                                            }
                                            showControls={false}
                                        />
                                    )}
                                </DistributionCanvas>
                            </DistributionCard>
                        )}

                        <SectionRow>
                            <SectionLabel>Type:</SectionLabel>
                            <span>
                                {pool.pool_type === 'stable'
                                    ? 'Stable'
                                    : pool.pool_type === 'concentrated'
                                      ? 'Concentrated'
                                      : 'Volatile'}
                            </span>
                        </SectionRow>
                        <SectionRow>
                            <SectionLabel>Fee:</SectionLabel>
                            <span>{(Number(pool.fee) * 100).toFixed(2)}%</span>
                        </SectionRow>
                        {pool.tokens.map((asset, index) => (
                            <SectionRow key={pool.tokens_addresses[index]}>
                                <SectionLabel>Total {asset.code}:</SectionLabel>
                                <span>
                                    {formatBalance(
                                        +contractValueToAmount(
                                            pool.reserves[index],
                                            (pool.tokens[index] as SorobanToken).decimal,
                                        ),
                                    )}{' '}
                                    <AssetLogo asset={asset} isSmall isCircle />
                                </span>
                            </SectionRow>
                        ))}
                        <SectionRow>
                            <SectionLabel>Total share:</SectionLabel>
                            <span>
                                {formatBalance(
                                    Number(
                                        contractValueToAmount(
                                            pool.total_share,
                                            pool.share_token_decimals,
                                        ),
                                    ),
                                    true,
                                )}
                            </span>
                        </SectionRow>
                        <SectionRow>
                            <SectionLabel>Members: </SectionLabel>
                            <span>{pool.membersCount}</span>
                        </SectionRow>
                        <SectionRow>
                            <SectionLabel>Daily reward: </SectionLabel>
                            <span>
                                {formatBalance(
                                    Number(contractValueToAmount(pool.reward_tps)) * 60 * 60 * 24,
                                    true,
                                )}{' '}
                                AQUA
                            </span>
                        </SectionRow>

                        {incentives?.length
                            ? incentives
                                  .filter(incentive => !!Number(incentive.info.tps))
                                  .map(incentive => (
                                      <SectionRow key={incentive.token.contract}>
                                          <SectionLabel>
                                              Daily incentive {incentive.token.code}:{' '}
                                          </SectionLabel>
                                          <span>
                                              {formatBalance(
                                                  (+incentive.info.tps * DAY) / 1000,
                                                  true,
                                              )}{' '}
                                              {incentive.token.code}
                                          </span>
                                      </SectionRow>
                                  ))
                            : null}
                        <SectionRow>
                            <SectionLabel>Pool hash: </SectionLabel>
                            <span>
                                <CopyButton text={pool.index} isBlackText>
                                    {truncateString(pool.index)}
                                </CopyButton>
                            </span>
                        </SectionRow>
                        <SectionRow>
                            <SectionLabel>Pool address: </SectionLabel>
                            <span>
                                <CopyButton text={pool.address} isBlackText>
                                    {truncateString(pool.address)}
                                </CopyButton>
                            </span>
                        </SectionRow>
                    </SectionWrap>
                </Section>

                <Section>
                    <SectionWrap>
                        <PoolMembers
                            poolId={pool.address}
                            totalShare={pool.total_share}
                            shareTokenDecimals={pool.share_token_decimals}
                        />
                    </SectionWrap>
                </Section>

                <Section>
                    <SectionWrap>
                        <PoolEvents pool={pool} />
                    </SectionWrap>
                </Section>
            </Background>
        </MainBlock>
    );
};

export default PoolPage;
