import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StellarService } from '../../../common/services/globalServices';
import NotFoundPage from '../../../common/components/NotFoundPage/NotFoundPage';
import useAssetsStore from '../../store/assetsStore/useAssetsStore';
import { Breakpoints, COLORS } from '../../../common/styles';
import { commonMaxWidth, flexAllCenter, respondDown } from '../../../common/mixins';
import { getFilteredPairsList, getTotalVotingStats } from '../../api/api';
import Pair from '../common/Pair';
import PageLoader from '../../../common/basics/PageLoader';
import { isRewardsOn } from '../MainPage/Table/Table';
import AboutAsset from './AboutAsset/AboutAsset';
import MarketBribes from './MarketBribes/MarketBribes';
import Sidebar from './Sidebar/Sidebar';
import { getCachedChosenPairs, SELECTED_PAIRS_ALIAS } from '../MainPage/MainPage';
import { PairStats } from '../../api/types';
import useAuthStore from '../../../common/store/authStore/useAuthStore';
import YourVotes from './YourVotes/YourVotes';
import TradeStats from './TradeStats/TradeStats';
import Rewards from './Rewards/Rewards';
import { useIsOverScrolled } from '../../../common/hooks/useIsOnViewport';
import ArrowLeft from '../../../common/assets/img/icon-arrow-left.svg';
import { MainRoutes } from '../../routes';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    width: 100%;
    padding: 4rem 0 11.7rem;
    background-color: ${COLORS.lightGray};

    ${respondDown(Breakpoints.md)`
        padding: 1.6rem 0;
    `}
`;

const Back = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 3.2rem;
    text-decoration: none;
    color: ${COLORS.paragraphText};
    cursor: pointer;
`;

const BackButton = styled.div`
    ${flexAllCenter};
    width: 4.8rem;
    height: 4.8rem;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 50%;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all ease 200ms;
    z-index: 1;
    margin-right: 1.6rem;

    &:hover {
        background-color: ${COLORS.lightGray};
    }

    &:active {
        transform: scale(0.9);
    }
`;

const MarketSection = styled.section`
    ${commonMaxWidth};
    padding-top: 6rem;
    padding-left: 4rem;
    padding-right: calc(10vw + 20rem);
    width: 100%;

    ${respondDown(Breakpoints.xxxl)`
        padding-right: calc(10vw + 30rem);
    `}

    ${respondDown(Breakpoints.xxl)`
        padding-right: calc(10vw + 40rem);
    `}

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem 0;
    `}
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-direction: column-reverse;
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

const NavItem = styled.div<{ active?: boolean }>`
    padding: 1.7rem 0 1.3rem;
    color: ${({ active }) => (active ? COLORS.purple : COLORS.grayText)};
    font-weight: ${({ active }) => (active ? 700 : 400)};
    border-bottom: ${({ active }) =>
        active ? `0.1rem solid ${COLORS.purple}` : `0.1rem solid ${COLORS.transparent}`};
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

const scrollToRef = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const MarketPage = () => {
    const { base, counter } = useParams<{ base: string; counter: string }>();
    const { processNewAssets } = useAssetsStore();
    const [votesData, setVotesData] = useState(null);
    const [totalStats, setTotalStats] = useState(null);
    const [chosenPairs, setChosenPairs] = useState(getCachedChosenPairs());

    const { isLogged } = useAuthStore();

    const history = useHistory();

    const isValidAssets = isValidPathAsset(base) && isValidPathAsset(counter) && base !== counter;

    if (!isValidAssets) {
        return <NotFoundPage />;
    }

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
        processNewAssets([baseAsset, counterAsset]);
    }, []);

    useEffect(() => {
        getTotalVotingStats().then((res) => {
            setTotalStats(res);
        });
    }, []);

    useEffect(() => {
        getFilteredPairsList(baseAsset, counterAsset, 1, 1).then((res) => {
            setVotesData(res.pairs[0]);
        });
    }, []);

    const onVoteClick = (pair: PairStats) => {
        const isPairSelected = chosenPairs.some(
            (chosenPair) => chosenPair.market_key === pair.market_key,
        );

        let updatedPairs;

        if (isPairSelected) {
            updatedPairs = chosenPairs.filter(
                (chosenPair) => chosenPair.market_key !== pair.market_key,
            );
        } else {
            updatedPairs = [...chosenPairs, pair];
        }
        setChosenPairs(updatedPairs);
        localStorage.setItem(SELECTED_PAIRS_ALIAS, JSON.stringify(updatedPairs));
    };

    const isPairSelected = ({ market_key: marketKey }: PairStats): boolean => {
        return chosenPairs.some((pair) => pair.market_key === marketKey);
    };

    const MarketStatRef = useRef(null);
    const RewardsRef = useRef(null);
    const AboutBaseRef = useRef(null);
    const AboutCounterRef = useRef(null);
    const BribesRef = useRef(null);
    const YourVotesRef = useRef(null);

    const isMarketStatRefOverScrolled = useIsOverScrolled(MarketStatRef, 50);
    const isRewardsRefOverScrolled = useIsOverScrolled(RewardsRef, 50);
    const isAboutBaseRefOverScrolled = useIsOverScrolled(AboutBaseRef, 50);
    const isAboutCounterRefOverScrolled = useIsOverScrolled(AboutCounterRef, 50);
    const isBribesRefOverScrolled = useIsOverScrolled(BribesRef, 50);
    const isYourVotesRefOverScrolled = useIsOverScrolled(YourVotesRef, 50);

    if (votesData === null || !totalStats) {
        return <PageLoader />;
    }

    console.log(history);

    return (
        <MainBlock>
            <Background>
                <MarketSection>
                    <Header>
                        <Pair
                            base={baseAsset}
                            counter={counterAsset}
                            verticalDirections
                            leftAlign
                            bigCodes
                            bottomLabels
                            authRequired={votesData?.auth_required}
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
                        />
                        <Back
                            onClick={() => {
                                history.length > 2
                                    ? history.goBack()
                                    : history.push(MainRoutes.main);
                            }}
                        >
                            <BackButton>
                                <ArrowLeft />
                            </BackButton>
                            <span>Back to pairs</span>
                        </Back>
                    </Header>
                </MarketSection>
            </Background>
            <NavPanel>
                <NavContent>
                    <NavItem
                        active={!isMarketStatRefOverScrolled}
                        onClick={() => scrollToRef(MarketStatRef)}
                    >
                        Market stats
                    </NavItem>
                    {votesData && (
                        <NavItem
                            active={isMarketStatRefOverScrolled && !isRewardsRefOverScrolled}
                            onClick={() => scrollToRef(RewardsRef)}
                        >
                            Rewards
                        </NavItem>
                    )}
                    <NavItem
                        active={
                            isMarketStatRefOverScrolled &&
                            isRewardsRefOverScrolled &&
                            !isAboutBaseRefOverScrolled
                        }
                        onClick={() => scrollToRef(AboutBaseRef)}
                    >
                        {baseAsset.code}
                    </NavItem>
                    <NavItem
                        active={isAboutBaseRefOverScrolled && !isAboutCounterRefOverScrolled}
                        onClick={() => scrollToRef(AboutCounterRef)}
                    >
                        {counterAsset.code}
                    </NavItem>
                    {votesData && (
                        <NavItem
                            active={isAboutCounterRefOverScrolled && !isBribesRefOverScrolled}
                            onClick={() => scrollToRef(BribesRef)}
                        >
                            Bribes
                        </NavItem>
                    )}
                    {isLogged && votesData && (
                        <NavItem
                            active={isBribesRefOverScrolled && !isYourVotesRefOverScrolled}
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
                isPairSelected={votesData ? isPairSelected(votesData) : false}
            />
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
    );
};

export default MarketPage;