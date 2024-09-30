import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import Title from 'react-document-title';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { useIsOverScrolled } from 'hooks/useIsOnViewport';
import { ModalService, StellarService } from 'services/globalServices';
import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import ArrowLeft from 'assets/icon-arrow-left.svg';

import CircleButton from 'basics/buttons/CircleButton';
import PageLoader from 'basics/loaders/PageLoader';

import MigrateToSorobanBanner from 'components/MigrateToSorobanBanner';
import NotFoundPage from 'components/NotFoundPage';

import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import { VoteRoutes } from '../../../routes';
import { getFilteredPairsList, getTotalVotingStats } from '../../vote/api/api';
import { PairStats } from '../../vote/api/types';
import Market from '../../vote/components/common/Market';
import { isRewardsOn, MAX_REWARDS_PERCENT } from '../../vote/components/MainPage/Table/Table';
import VotesAmountModal from '../../vote/components/MainPage/VoteModals/VotesAmountModal';
import AboutAsset from '../components/AboutAsset/AboutAsset';
import AmmStats from '../components/AmmStats/AmmStats';
import MarketBribes from '../components/MarketBribes/MarketBribes';
import Rewards from '../components/Rewards/Rewards';
import Sidebar from '../components/Sidebar/Sidebar';
import TradeStats from '../components/TradeStats/TradeStats';
import YourVotes from '../components/YourVotes/YourVotes';

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
    margin-bottom: 3.2rem;
`;

const MarketSection = styled.section<{ $smallTopPadding?: boolean }>`
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

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-direction: column-reverse;
    background-color: ${COLORS.lightGray};
`;

const NavPanel = styled.div`
    height: 5rem;
    width: 100%;
    background: ${COLORS.lightGray};
    z-index: 101;
    top: 0;
    position: sticky;

    ${respondDown(Breakpoints.md)`
         display: none;
    `}
`;

const NavContent = styled.div`
    ${commonMaxWidth};
    padding-left: 4rem;
    display: flex;
`;

const NavItem = styled.div<{ $active?: boolean }>`
    padding: 1.7rem 0 1.3rem;
    color: ${({ $active }) => ($active ? COLORS.purple : COLORS.grayText)};
    font-weight: ${({ $active }) => ($active ? 700 : 400)};
    border-bottom: ${({ $active }) =>
        $active ? `0.1rem solid ${COLORS.purple}` : `0.1rem solid ${COLORS.transparent}`};
    cursor: pointer;

    &:hover {
        border-bottom: 0.1rem solid ${COLORS.purple};
        color: ${COLORS.purple};
    }

    &:not(:last-child) {
        margin-right: 2.5rem;
    }
`;

const isValidPathAsset = (pathAsset: string) => {
    if (pathAsset === 'native') {
        return true;
    }

    const [code, issuer, ...rest] = pathAsset.split(':');

    if (!issuer || rest.length) {
        return false;
    }

    try {
        StellarService.createAsset(code, issuer);
        return true;
    } catch {
        return false;
    }
};

const scrollToRef = ref => {
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const MarketPage = () => {
    const { base, counter } = useParams<{ base: string; counter: string }>();
    const { processNewAssets } = useAssetsStore();
    const [votesData, setVotesData] = useState(null);
    const [totalStats, setTotalStats] = useState(null);

    const { isLogged } = useAuthStore();

    const history = useHistory();

    const isValidAssets = isValidPathAsset(base) && isValidPathAsset(counter) && base !== counter;

    const [baseCode, baseIssuer] = base.split(':');
    const [counterCode, counterIssuer] = counter.split(':');

    const baseAsset =
        baseCode === 'native'
            ? StellarService.createLumen()
            : StellarService.createAsset(baseCode, baseIssuer);
    const counterAsset =
        counterCode === 'native'
            ? StellarService.createLumen()
            : StellarService.createAsset(counterCode, counterIssuer);

    useEffect(() => {
        if (!isValidAssets) {
            return;
        }
        processNewAssets([baseAsset, counterAsset]);
    }, []);

    useEffect(() => {
        if (!isValidAssets) {
            return;
        }
        getTotalVotingStats().then(res => {
            setTotalStats(res);
        });
    }, []);

    useEffect(() => {
        if (!isValidAssets) {
            return;
        }
        getFilteredPairsList(baseAsset, counterAsset, 1, 1).then(res => {
            setVotesData(res.pairs[0]);
        });
    }, []);

    const onVoteClick = (pair: PairStats) => {
        if (isLogged) {
            ModalService.openModal(VotesAmountModal, {
                pairs: [pair],
                isSingleVoteForModal: true,
                updatePairs: () => {},
            });
            return;
        }

        ModalService.openModal(ChooseLoginMethodModal, {
            callback: () =>
                ModalService.openModal(VotesAmountModal, {
                    pairs: [pair],
                    isSingleVoteForModal: true,
                    updatePairs: () => {},
                }),
        });
    };

    const MarketStatRef = useRef(null);
    const AmmStatRef = useRef(null);
    const RewardsRef = useRef(null);
    const AboutBaseRef = useRef(null);
    const AboutCounterRef = useRef(null);
    const BribesRef = useRef(null);
    const YourVotesRef = useRef(null);

    const isMarketStatRefOverScrolled = useIsOverScrolled(MarketStatRef, 50);
    const isAmmStatRefOverScrolled = useIsOverScrolled(AmmStatRef, 50);
    const isRewardsRefOverScrolled = useIsOverScrolled(RewardsRef, 50);
    const isAboutBaseRefOverScrolled = useIsOverScrolled(AboutBaseRef, 50);
    const isAboutCounterRefOverScrolled = useIsOverScrolled(AboutCounterRef, 50);
    const isBribesRefOverScrolled = useIsOverScrolled(BribesRef, 50);
    const isYourVotesRefOverScrolled = useIsOverScrolled(YourVotesRef, 50);

    if (!isValidAssets) {
        return <NotFoundPage />;
    }

    if (votesData === null || !totalStats) {
        return <PageLoader />;
    }

    return (
        <Title title={`Market: ${baseAsset.code} / ${counterAsset.code}`}>
            <MainBlock>
                <Background>
                    <MarketSection>
                        <Header>
                            <Market
                                assets={[baseAsset, counterAsset]}
                                verticalDirections
                                leftAlign
                                bigCodes
                                bottomLabels
                                authRequired={
                                    votesData?.auth_required ||
                                    votesData?.auth_revocable ||
                                    votesData?.auth_clawback_enabled
                                }
                                noLiquidity={votesData?.no_liquidity}
                                boosted={
                                    votesData
                                        ? Number(votesData.adjusted_votes_value) >
                                          Number(votesData.votes_value)
                                        : false
                                }
                                isRewardsOn={
                                    votesData
                                        ? (isRewardsOn(
                                              votesData.votes_value,
                                              totalStats.votes_value_sum,
                                          ) ||
                                              Number(votesData.adjusted_votes_value) >
                                                  Number(votesData.votes_value)) &&
                                          isRewardsOn(
                                              votesData.adjusted_votes_value,
                                              totalStats.adjusted_votes_value_sum,
                                          )
                                        : false
                                }
                                isMaxRewards={
                                    votesData && votesData.adjusted_votes_value
                                        ? (votesData.adjusted_votes_value /
                                              totalStats.adjusted_votes_value_sum) *
                                              100 >
                                          MAX_REWARDS_PERCENT
                                        : false
                                }
                                isBigLogo
                                isCircleLogos
                                withoutLink
                            />

                            <BackButton
                                label="Back to markets"
                                onClick={() => {
                                    history.length
                                        ? history.goBack()
                                        : history.push(VoteRoutes.main);
                                }}
                            >
                                <ArrowLeft />
                            </BackButton>
                        </Header>
                        <MigrateToSorobanBanner base={baseAsset} counter={counterAsset} />
                    </MarketSection>
                </Background>

                <NavPanel>
                    <NavContent>
                        <NavItem
                            $active={!isAmmStatRefOverScrolled}
                            onClick={() => scrollToRef(AmmStatRef)}
                        >
                            AMM stats
                        </NavItem>
                        <NavItem
                            $active={!isMarketStatRefOverScrolled && isAmmStatRefOverScrolled}
                            onClick={() => scrollToRef(MarketStatRef)}
                        >
                            Market stats
                        </NavItem>
                        {votesData && (
                            <NavItem
                                $active={isMarketStatRefOverScrolled && !isRewardsRefOverScrolled}
                                onClick={() => scrollToRef(RewardsRef)}
                            >
                                Rewards
                            </NavItem>
                        )}
                        <NavItem
                            $active={
                                isMarketStatRefOverScrolled &&
                                isRewardsRefOverScrolled &&
                                !isAboutBaseRefOverScrolled
                            }
                            onClick={() => scrollToRef(AboutBaseRef)}
                        >
                            {baseAsset.code}
                        </NavItem>
                        <NavItem
                            $active={isAboutBaseRefOverScrolled && !isAboutCounterRefOverScrolled}
                            onClick={() => scrollToRef(AboutCounterRef)}
                        >
                            {counterAsset.code}
                        </NavItem>
                        {votesData && (
                            <NavItem
                                $active={isAboutCounterRefOverScrolled && !isBribesRefOverScrolled}
                                onClick={() => scrollToRef(BribesRef)}
                            >
                                Bribes
                            </NavItem>
                        )}
                        {isLogged && votesData && (
                            <NavItem
                                $active={isBribesRefOverScrolled && !isYourVotesRefOverScrolled}
                                onClick={() => scrollToRef(YourVotesRef)}
                            >
                                Your votes
                            </NavItem>
                        )}
                    </NavContent>
                </NavPanel>
                <Sidebar
                    votesData={votesData}
                    base={baseAsset}
                    counter={counterAsset}
                    totalStats={totalStats}
                    onVoteClick={onVoteClick}
                    isPairSelected={false}
                />
                <MarketSection $smallTopPadding ref={AmmStatRef}>
                    <AmmStats base={baseAsset} counter={counterAsset} />
                </MarketSection>
                <MarketSection ref={MarketStatRef}>
                    <TradeStats base={baseAsset} counter={counterAsset} />
                </MarketSection>
                {votesData && (
                    <MarketSection ref={RewardsRef}>
                        <Rewards base={baseAsset} counter={counterAsset} />
                    </MarketSection>
                )}
                <MarketSection ref={AboutBaseRef}>
                    <AboutAsset asset={baseAsset} />
                </MarketSection>
                <MarketSection ref={AboutCounterRef}>
                    <AboutAsset asset={counterAsset} />
                </MarketSection>
                {votesData && (
                    <MarketSection ref={BribesRef}>
                        <MarketBribes
                            base={baseAsset}
                            counter={counterAsset}
                            bribes={votesData.aggregated_bribes}
                            extra={votesData.extra}
                            marketKey={votesData.market_key}
                        />
                    </MarketSection>
                )}
                {isLogged && votesData && (
                    <MarketSection ref={YourVotesRef}>
                        <YourVotes votesData={votesData} />
                    </MarketSection>
                )}
            </MainBlock>
        </Title>
    );
};

export default MarketPage;
