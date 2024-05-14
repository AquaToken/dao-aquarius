import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPool } from '../api/api';
import PageLoader from '../../../common/basics/PageLoader';
import styled from 'styled-components';
import Pair from '../../vote/components/common/Pair';
import { Breakpoints, COLORS } from '../../../common/styles';
import { commonMaxWidth, flexRowSpaceBetween, respondDown } from '../../../common/mixins';
import Sidebar from '../components/Sidebar/Sidebar';
import { SorobanService, ToastService } from '../../../common/services/globalServices';
import useAuthStore from '../../../store/authStore/useAuthStore';
import Button from '../../../common/basics/Button';
import { formatBalance } from '../../../common/helpers/helpers';
import { useUpdateIndex } from '../../../common/hooks/useUpdateIndex';
import AccountViewer from '../../../common/basics/AccountViewer';

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
    color: ${COLORS.grayText};

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
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

const PoolPage = () => {
    const [pool, setPool] = useState(null);
    const [rewards, setRewards] = useState(null);
    const { poolAddress } = useParams<{ poolAddress: string }>();
    const [claimPending, setClaimPending] = useState(false);

    const { account } = useAuthStore();

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
                                    <span>for {formatBalance(rewards.to_claim)} AQUA</span>
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
                        <h3>Pool info</h3>
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
                                <span>Total {asset.code} reserved:</span>
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
                            {pool.members.map((member) => (
                                <SectionRow key={member.account_address}>
                                    <AccountViewer pubKey={member.account_address} />
                                    <span>{formatBalance(member.balance / 1e7, true)} shares</span>
                                </SectionRow>
                            ))}
                        </SectionWrap>
                    </Section>
                )}

                <Section>
                    <SectionWrap>
                        <h3>Transactions</h3>
                        <div>Coming soon</div>
                    </SectionWrap>
                </Section>
            </Background>
        </MainBlock>
    );
};

export default PoolPage;
