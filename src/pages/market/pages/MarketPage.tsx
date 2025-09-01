import { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { VoteRoutes } from 'constants/routes';

import { createAsset, createLumen } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { contentWithSidebar, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import ArrowLeft from 'assets/icon-arrow-left.svg';

import CircleButton from 'basics/buttons/CircleButton';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import PageTitle from 'basics/PageTitle';

import MigrateToSorobanBanner from 'components/MigrateToSorobanBanner';
import NotFoundPage from 'components/NotFoundPage';
import PageNavigation from 'components/PageNavigation';

import AmmStats from 'pages/market/components/AmmStats/AmmStats';
import AssetsDetails from 'pages/market/components/AssetsDetails/AssetsDetails';

import { getFilteredPairsList, getTotalVotingStats } from '../../vote/api/api';
import { PairStats } from '../../vote/api/types';
import { isRewardsOn, MAX_REWARDS_PERCENT } from '../../vote/components/MainPage/Table/Table';
import VotesAmountModal from '../../vote/components/MainPage/VoteModals/VotesAmountModal';
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

const BackButtonWrapper = styled.div`
    ${contentWithSidebar};
    padding-left: 4rem;
    margin-top: 6.8rem;
`;

const BackButton = styled(CircleButton)`
    margin-bottom: 3.2rem;
`;

const MarketSection = styled.section<{ $smallTopPadding?: boolean }>`
    ${contentWithSidebar};
    padding-top: ${({ $smallTopPadding }) => ($smallTopPadding ? '2rem' : '2.8rem')};
    padding-left: 4rem;
    width: 100%;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-direction: column;
    background-color: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 4.1rem 3.7rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `}
`;

const Divider = styled.div`
    border-top: 0.1rem solid ${COLORS.gray};
    margin: 4rem 0;
    height: 0.1rem;
    width: 100%;
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
        createAsset(code, issuer);
        return true;
    } catch {
        return false;
    }
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

    const baseAsset = baseCode === 'native' ? createLumen() : createAsset(baseCode, baseIssuer);
    const counterAsset =
        counterCode === 'native' ? createLumen() : createAsset(counterCode, counterIssuer);

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

    const AmmStatRef = useRef(null);
    const MarketStatRef = useRef(null);
    const RewardsRef = useRef(null);
    const BribesRef = useRef(null);
    const YourVotesRef = useRef(null);

    if (!isValidAssets) {
        return <NotFoundPage />;
    }

    if (votesData === null || !totalStats) {
        return <PageLoader />;
    }

    return (
        <PageTitle title={`Staging: Market: ${baseAsset.code} / ${counterAsset.code} - Aquarius`}>
            <MainBlock>
                <BackButtonWrapper>
                    <BackButton
                        label="Back to markets"
                        onClick={() => {
                            try {
                                history.goBack();
                            } catch (e) {
                                history.push(VoteRoutes.main);
                            }
                        }}
                    >
                        <ArrowLeft />
                    </BackButton>
                </BackButtonWrapper>

                <PageNavigation
                    anchors={[
                        { title: 'AMM stats', ref: AmmStatRef },
                        { title: 'Market stats', ref: MarketStatRef },
                        { title: 'Rewards', ref: RewardsRef },
                        { title: 'Bribes', ref: BribesRef },
                        isLogged && votesData ? { title: 'Your votes', ref: YourVotesRef } : null,
                    ].filter(Boolean)}
                />

                <Sidebar
                    votesData={votesData}
                    base={baseAsset}
                    counter={counterAsset}
                    totalStats={totalStats}
                    onVoteClick={onVoteClick}
                    isPairSelected={false}
                />

                <MarketSection>
                    <Header>
                        <Market
                            assets={[baseAsset, counterAsset]}
                            leftAlign
                            bigCodes
                            bottomLabels
                            mobileVerticalDirections
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
                        <Divider />
                        <AssetsDetails assets={[baseAsset, counterAsset]} />
                    </Header>
                    <MigrateToSorobanBanner base={baseAsset} counter={counterAsset} />
                </MarketSection>
                <MarketSection ref={AmmStatRef}>
                    <AmmStats assets={[baseAsset, counterAsset]} />
                </MarketSection>
                <MarketSection ref={MarketStatRef}>
                    <TradeStats base={baseAsset} counter={counterAsset} />
                </MarketSection>
                {votesData && (
                    <MarketSection ref={RewardsRef}>
                        <Rewards base={baseAsset} counter={counterAsset} />
                    </MarketSection>
                )}
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
        </PageTitle>
    );
};

export default MarketPage;
