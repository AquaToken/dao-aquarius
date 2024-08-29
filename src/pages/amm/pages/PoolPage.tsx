import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { getPool } from '../api/api';
import PageLoader from '../../../common/basics/PageLoader';
import styled from 'styled-components';
import Pair from '../../vote/components/common/Pair';
import { Breakpoints, COLORS } from '../../../common/styles';
import {
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from '../../../common/mixins';
import Sidebar from '../components/Sidebar/Sidebar';
import {
    SorobanService,
    StellarService,
    ToastService,
} from '../../../common/services/globalServices';
import useAuthStore from '../../../store/authStore/useAuthStore';
import Button from '../../../common/basics/Button';
import { formatBalance } from '../../../common/helpers/helpers';
import { useUpdateIndex } from '../../../common/hooks/useUpdateIndex';
import LiquidityChart from '../components/LiquidityChart/LiquidityChart';
import VolumeChart from '../components/VolumeChart/VolumeChart';
import ExternalLink from '../../../common/basics/ExternalLink';
import { BuildSignAndSubmitStatuses } from '../../../common/services/wallet-connect.service';
import { PoolExtended } from '../api/types';
import CircleButton from '../../../common/basics/CircleButton';
import ArrowLeft from '../../../common/assets/img/icon-arrow-left.svg';
import { AmmRoutes } from '../../../routes';
import PoolMembers from '../components/PoolMembers/PoolMembers';
import PoolEvents from '../components/PoolEvents/PoolEvents';
import { AQUA_CODE, AQUA_ISSUER } from '../../../common/services/stellar.service';
import NoTrustline from '../../../common/components/NoTrustline/NoTrustline';
import MigrateToSorobanBanner from '../../../common/components/MigrateToSorobanBanner/MigrateToSorobanBanner';

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

const Section = styled.section<{ smallTopPadding?: boolean }>`
    ${commonMaxWidth};
    padding-top: ${({ smallTopPadding }) => (smallTopPadding ? '2rem' : '2.8rem')};
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
    color: ${COLORS.grayText};
    margin: 1rem 0;
    height: 2.8rem;

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
    }
`;

const Charts = styled.div`
    display: flex;
    justify-content: space-evenly;
    gap: 1.6rem;

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
    `}
`;

const Chart = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.lightGray};
    padding: 1.6rem;
    border-radius: 0.6rem;
    flex: 1;
`;

const ExternalLinkStyled = styled(ExternalLink)`
    margin-top: 1.6rem;
`;

const PoolPage = () => {
    const [pool, setPool] = useState<PoolExtended | null>(null);
    const [rewards, setRewards] = useState(null);
    const { poolAddress } = useParams<{ poolAddress: string }>();
    const [claimPending, setClaimPending] = useState(false);

    const { account } = useAuthStore();

    const history = useHistory();

    const updateIndex = useUpdateIndex(5000);

    useEffect(() => {
        if (!pool) {
            return;
        }
        if (!account) {
            setRewards(null);
            return;
        }
        SorobanService.getPoolRewards(account.accountId(), pool.address).then((res) => {
            setRewards(res);
        });
    }, [account, pool, updateIndex]);

    useEffect(() => {
        getPool(poolAddress).then((res) => {
            setPool(res);
        });
    }, [poolAddress, updateIndex]);

    const claim = () => {
        setClaimPending(true);

        SorobanService.getClaimRewardsTx(account.accountId(), pool.address)
            .then((tx) => account.signAndSubmitTx(tx, true))
            .then((res) => {
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
            .catch((err) => {
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
                            history.length ? history.goBack() : history.push(AmmRoutes.analytics);
                        }}
                    >
                        <ArrowLeft />
                    </BackButton>
                    <Pair
                        base={pool.assets[0]}
                        counter={pool.assets[1]}
                        thirdAsset={pool.assets[2]}
                        fourthAsset={pool.assets[3]}
                        verticalDirections
                        leftAlign
                        bigCodes
                        isBigLogo
                        isCircleLogos
                        withoutLink
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
                                        account?.getAssetBalance(
                                            StellarService.createAsset(AQUA_CODE, AQUA_ISSUER),
                                        ) === null
                                    }
                                >
                                    Claim rewards
                                </Button>
                            </Rewards>
                            <NoTrustline
                                asset={StellarService.createAsset(AQUA_CODE, AQUA_ISSUER)}
                            />
                        </SectionWrap>
                    </Section>
                )}
                <Section>
                    <SectionWrap>
                        {Boolean(pool.stats.length) && (
                            <Charts>
                                <Chart>
                                    <LiquidityChart data={pool.stats} />
                                </Chart>
                                <Chart>
                                    <VolumeChart data={pool.stats} />
                                </Chart>
                            </Charts>
                        )}

                        <SectionRow>
                            <span>Type:</span>
                            <span>{pool.pool_type === 'stable' ? 'Stable' : 'Volatile'}</span>
                        </SectionRow>
                        <SectionRow>
                            <span>Fee:</span>
                            <span>{(Number(pool.fee) * 100).toFixed(2)}%</span>
                        </SectionRow>
                        {pool.assets.map((asset, index) => (
                            <SectionRow key={pool.tokens_addresses[index]}>
                                <span>Total {asset.code}:</span>
                                <span>
                                    {formatBalance(+pool.reserves[index] / 1e7, true)} {asset.code}
                                </span>
                            </SectionRow>
                        ))}
                        <SectionRow>
                            <span>Total share:</span>
                            <span>{formatBalance(+pool.total_share / 1e7, true)}</span>
                        </SectionRow>
                        <SectionRow>
                            <span>Members: </span>
                            <span>{pool.membersCount}</span>
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
