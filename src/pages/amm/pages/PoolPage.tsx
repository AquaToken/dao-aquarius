import { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getPool } from 'api/amm';

import { ChartPeriods } from 'constants/charts';

import { getAquaAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { truncateString } from 'helpers/truncate-string';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { PoolExtended } from 'types/amm';
import { Int128Parts } from 'types/stellar';

import { commonMaxWidth, flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import ArrowLeft from 'assets/icon-arrow-left.svg';

import Button from 'basics/buttons/Button';
import CircleButton from 'basics/buttons/CircleButton';
import CopyButton from 'basics/buttons/CopyButton';
import ExternalLink from 'basics/ExternalLink';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';

import MigrateToSorobanBanner from 'components/MigrateToSorobanBanner';
import NoTrustline from 'components/NoTrustline';

import LiquidityChart from '../components/LiquidityChart/LiquidityChart';
import PoolEvents from '../components/PoolEvents/PoolEvents';
import PoolMembers from '../components/PoolMembers/PoolMembers';
import Sidebar from '../components/Sidebar/Sidebar';
import VolumeChart from '../components/VolumeChart/VolumeChart';

const MainBlock = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.lightGray};
    z-index: 1;
`;

const Background = styled.div`
    width: 100%;
    padding: 4rem 0 6rem;
    background-color: ${COLORS.lightGray};

    ${respondDown(Breakpoints.md)`
        padding: 1.6rem 0;
    `}
`;

const BackButton = styled(CircleButton)`
    margin-bottom: 7.2rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 3.2rem;
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
    color: ${COLORS.paragraphText};
    font-weight: 700;
    font-size: 2.6rem;

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.titleText};
        margin-bottom: 0.8rem;
    }
`;

const SectionRow = styled.div`
    ${flexRowSpaceBetween};
    align-items: center;
    color: ${COLORS.paragraphText};
    margin: 1rem 0;
    height: 2.8rem;
    font-size: 1.6rem;
`;

const SectionLabel = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.grayText};
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
    background-color: ${COLORS.lightGray};
`;

const ExternalLinkStyled = styled(ExternalLink)`
    margin-top: 1.6rem;
`;

const PoolPage = () => {
    const [pool, setPool] = useState<PoolExtended | null>(null);
    const [rewards, setRewards] = useState(null);
    const { poolAddress } = useParams<{ poolAddress: string }>();
    const [claimPending, setClaimPending] = useState(false);
    const [chartWidth, setChartWidth] = useState(0);

    const { account } = useAuthStore();

    const history = useHistory();

    const updateIndex = useUpdateIndex(5000);

    const { aquaStellarAsset } = getAquaAssetData();

    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!pool) {
            return;
        }
        if (!account) {
            setRewards(null);
            return;
        }
        SorobanService.getPoolRewards(account.accountId(), pool.address).then(res => {
            setRewards(res);
        });
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

    const claim = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setClaimPending(true);

        SorobanService.getClaimRewardsTx(account.accountId(), pool.address)
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
                setClaimPending(false);
            })
            .catch(err => {
                ToastService.showErrorToast(err.message ?? err.toString());
                setClaimPending(false);
            });
    };

    if (!pool) {
        return <PageLoader />;
    }

    return (
        <MainBlock>
            <Background>
                <Section>
                    <BackButton
                        label="Pools"
                        onClick={() => {
                            history.goBack();
                        }}
                    >
                        <ArrowLeft />
                    </BackButton>
                    <Market
                        assets={pool.assets}
                        leftAlign
                        bigCodes
                        isBigLogo
                        isCircleLogos
                        withoutLink
                        mobileVerticalDirections
                    />
                    <ExternalLinkStyled
                        href={`https://stellar.expert/explorer/public/contract/${pool.address}`}
                    >
                        View on Explorer
                    </ExternalLinkStyled>
                </Section>
                <Sidebar pool={pool} />

                {pool.assets.length === 2 && (
                    <Section>
                        <MigrateToSorobanBanner base={pool.assets[0]} counter={pool.assets[1]} />
                    </Section>
                )}

                {Boolean(rewards && Number(rewards.to_claim)) && (
                    <Section>
                        <SectionWrap>
                            <Rewards>
                                <RewardsDescription>
                                    <span>You have unclaimed rewards</span>
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

                        <SectionRow>
                            <SectionLabel>Type:</SectionLabel>
                            <span>{pool.pool_type === 'stable' ? 'Stable' : 'Volatile'}</span>
                        </SectionRow>
                        <SectionRow>
                            <SectionLabel>Fee:</SectionLabel>
                            <span>{(Number(pool.fee) * 100).toFixed(2)}%</span>
                        </SectionRow>
                        {pool.assets.map((asset, index) => (
                            <SectionRow key={pool.tokens_addresses[index]}>
                                <SectionLabel>Total {asset.code}:</SectionLabel>
                                <span>
                                    {formatBalance(+pool.reserves[index] / 1e7, true)} {asset.code}
                                </span>
                            </SectionRow>
                        ))}
                        <SectionRow>
                            <SectionLabel>Total share:</SectionLabel>
                            <span>{formatBalance(+pool.total_share / 1e7, true)}</span>
                        </SectionRow>
                        <SectionRow>
                            <SectionLabel>Members: </SectionLabel>
                            <span>{pool.membersCount}</span>
                        </SectionRow>
                        <SectionRow>
                            <SectionLabel>Daily reward: </SectionLabel>
                            <span>
                                {formatBalance((+pool.reward_tps / 1e7) * 60 * 60 * 24, true)} AQUA
                            </span>
                        </SectionRow>
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
                        <PoolMembers poolId={pool.address} totalShare={pool.total_share} />
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
