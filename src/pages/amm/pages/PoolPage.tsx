import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { SorobanService, ToastService } from '../../../common/services/globalServices';
import useAuthStore from '../../../store/authStore/useAuthStore';
import Button from '../../../common/basics/Button';
import { formatBalance, getDateString } from '../../../common/helpers/helpers';
import { useUpdateIndex } from '../../../common/hooks/useUpdateIndex';
import AccountViewer from '../../../common/basics/AccountViewer';
import Table from '../../../common/basics/Table';
import LiquidityChart from '../components/LiquidityChart/LiquidityChart';
import VolumeChart from '../components/VolumeChart/VolumeChart';

const Container = styled.main`
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;
`;

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

const Amounts = styled.span`
    font-size: 1.4rem;
`;

const getEventTitle = (event, pool) => {
    if (event.event_type === 'swap') {
        const fromIndex = event.amounts.findIndex((amount) => amount > 0);
        const toIndex = event.amounts.findIndex((amount) => amount < 0);

        return `Swap ${pool.assets[fromIndex].code} to ${pool.assets[toIndex].code}`;
    }

    return event.event_type === 'deposit' ? 'Add liquidity' : 'Remove liquidity';
};

const getEventAmounts = (event, pool) => {
    if (event.event_type === 'swap') {
        const fromIndex = event.amounts.findIndex((amount) => amount > 0);
        const toIndex = event.amounts.findIndex((amount) => amount < 0);

        return (
            <Amounts>
                <span>
                    {formatBalance(event.amounts[fromIndex] / 1e7)} {pool.assets[fromIndex].code}
                </span>
                <br />
                <span>
                    {formatBalance(Math.abs(event.amounts[toIndex] / 1e7))}{' '}
                    {pool.assets[toIndex].code}
                </span>
            </Amounts>
        );
    }
    return (
        <Amounts>
            {event.amounts.map((amount, index) => (
                <span key={pool.tokens_str[index]}>
                    <span>
                        {formatBalance(amount / 1e7)} {pool.assets[index].code}
                    </span>
                    <br />
                </span>
            ))}
        </Amounts>
    );
};

const getEventTime = (timeStr) => {
    const [date, time] = timeStr.split(' ');

    const [year, month, day] = date.split('-');
    const [hour, minute, second] = time.split(':');

    return getDateString(new Date(Date.UTC(year, month - 1, day, hour, minute, second)).getTime(), {
        withTime: true,
    });
};

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

const PoolPage = () => {
    const [pool, setPool] = useState(null);
    const [rewards, setRewards] = useState(null);
    const { poolAddress } = useParams<{ poolAddress: string }>();
    const [claimPending, setClaimPending] = useState(false);

    const { account } = useAuthStore();

    const updateIndex = useUpdateIndex(5000);

    console.log(pool);

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
            .then((tx) => account.signAndSubmitTx(tx))
            .then((res) => {
                const value = SorobanService.i128ToInt(res.value());

                ToastService.showSuccessToast(`Claimed ${formatBalance(value)} AQUA`);
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
                </Section>
                <Sidebar pool={pool} />

                {rewards && Number(rewards.to_claim) && (
                    <Section>
                        <SectionWrap>
                            <Rewards>
                                <RewardsDescription>
                                    <span>You have unclaimed rewards</span>
                                    <span>{formatBalance(rewards.to_claim)} AQUA</span>
                                </RewardsDescription>
                                <Button isBig onClick={() => claim()} pending={claimPending}>
                                    Claim rewards
                                </Button>
                            </Rewards>
                        </SectionWrap>
                    </Section>
                )}
                <Section>
                    <SectionWrap>
                        <Charts>
                            <Chart>
                                <LiquidityChart data={pool.stats} />
                            </Chart>
                            <Chart>
                                <VolumeChart data={pool.stats} />
                            </Chart>
                        </Charts>

                        <SectionRow>
                            <span>Type:</span>
                            <span>
                                {pool.pool_type === 'stable' ? 'Stable swap' : 'Constant product'}
                            </span>
                        </SectionRow>
                        <SectionRow>
                            <span>Fee:</span>
                            <span>{pool.fee * 100}%</span>
                        </SectionRow>
                        {pool.assets.map((asset, index) => (
                            <SectionRow key={pool.tokens_addresses[index]}>
                                <span>Total {asset.code}:</span>
                                <span>
                                    {formatBalance(pool.reserves[index] / 1e7, true)} {asset.code}
                                </span>
                            </SectionRow>
                        ))}
                        <SectionRow>
                            <span>Total share:</span>
                            <span>{formatBalance(pool.total_share / 1e7, true)}</span>
                        </SectionRow>
                        <SectionRow>
                            <span>Members: </span>
                            <span>{pool.members.length}</span>
                        </SectionRow>
                    </SectionWrap>
                </Section>

                {Boolean(pool.members.length) && (
                    <Section>
                        <SectionWrap>
                            <h3>Pool members</h3>
                            {pool.members
                                .sort((a, b) => b.balance - a.balance)
                                .map((member) => (
                                    <SectionRow key={member.account_address}>
                                        <AccountViewer pubKey={member.account_address} />
                                        <span>
                                            {formatBalance(member.balance / 1e7, true)} (
                                            {Number(pool.total_share)
                                                ? formatBalance(
                                                      (100 * member.balance) /
                                                          1e7 /
                                                          (pool.total_share / 1e7),
                                                      true,
                                                  )
                                                : '0'}
                                            %)
                                        </span>
                                    </SectionRow>
                                ))}
                        </SectionWrap>
                    </Section>
                )}

                {Boolean(pool.events.length) && (
                    <Section>
                        <SectionWrap>
                            <h3>Transactions</h3>
                            <Table
                                head={[
                                    { children: 'Type' },
                                    { children: 'Amounts' },
                                    { children: 'Account', flexSize: 1.5 },
                                    { children: 'Time' },
                                ]}
                                body={pool.events.map((event) => {
                                    return {
                                        key: event.ledger,
                                        rowItems: [
                                            { children: getEventTitle(event, pool) },
                                            { children: getEventAmounts(event, pool) },
                                            {
                                                children: (
                                                    <AccountViewer pubKey={event.account_address} />
                                                ),
                                                flexSize: 1.5,
                                            },
                                            {
                                                children: getEventTime(event.ledger_close_at_str),
                                            },
                                        ],
                                    };
                                })}
                            />
                        </SectionWrap>
                    </Section>
                )}
            </Background>
        </MainBlock>
    );
};

export default PoolPage;