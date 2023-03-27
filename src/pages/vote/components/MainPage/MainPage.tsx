import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import BackgroundImageLeft from '../../../../common/assets/img/background-left.svg';
import BackgroundImageRight from '../../../../common/assets/img/background-right.svg';
import { Breakpoints, COLORS } from '../../../../common/styles';
import {
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from '../../../../common/mixins';
import ToggleGroup from '../../../../common/basics/ToggleGroup';
import Table from './Table/Table';
import FloatingButton from './FloatingButton/FloatingButton';
import VotesAmountModal from './VoteModals/VotesAmountModal';
import { ModalService, StellarService } from '../../../../common/services/globalServices';
import ChooseLoginMethodModal from '../../../../common/modals/ChooseLoginMethodModal';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import AssetDropdown from '../AssetDropdown/AssetDropdown';
import Arrows from '../../../../common/assets/img/icon-arrows-circle.svg';
import {
    getFilteredPairsList,
    getPairsList,
    getPairsWithBribes,
    getTotalVotingStats,
    getUserPairsList,
    SortTypes,
    updateVotesForMarketKeys,
} from '../../api/api';
import PageLoader from '../../../../common/basics/PageLoader';
import Tooltip, { TOOLTIP_POSITION } from '../../../../common/basics/Tooltip';
import { PairStats } from '../../api/types';
import CreatePairModal from './CreatePairModal/CreatePairModal';
import Pair from '../common/Pair';
import Button from '../../../../common/basics/Button';
import { formatBalance, getTimeAgoValue } from '../../../../common/helpers/helpers';
import { Option } from '../../../../common/basics/Select';
import Pagination from '../../../../common/basics/Pagination';
import {
    AQUA_CODE,
    AQUA_ISSUER,
    DOWN_ICE_CODE,
    ICE_ISSUER,
    StellarEvents,
    UP_ICE_CODE,
} from '../../../../common/services/stellar.service';
import DotsLoader from '../../../../common/basics/DotsLoader';
import { useHistory, useLocation } from 'react-router-dom';
import useAssetsStore from '../../../../store/assetsStore/useAssetsStore';
import { MarketRoutes } from '../../../../routes';
import { LoginTypes } from '../../../../store/authStore/types';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    padding: 10% 0;
    ${flexAllCenter};
    flex-direction: column;
    background-color: ${COLORS.darkPurple};
    min-height: 10rem;
    max-height: 40vh;
    overflow: hidden;
    position: relative;

    ${respondDown(Breakpoints.md)`
        padding: 10% 1.6rem;
    `}
`;

const BackgroundLeft = styled(BackgroundImageLeft)`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;

    ${respondDown(Breakpoints.md)`
        height: unset;
        width: 40%;
        top: 50%;
        transform: translateY(-50%);
    `}
`;

const BackgroundRight = styled(BackgroundImageRight)`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;

    ${respondDown(Breakpoints.md)`
         height: unset;
         width: 40%;
         top: 50%;
         transform: translateY(-50%);
     `}
`;

const Title = styled.h2`
    font-size: 8rem;
    line-height: 9.4rem;
    font-weight: bold;
    color: ${COLORS.white};
    z-index: 1;
    margin-bottom: 1.6rem;
    text-align: center;

    ${respondDown(Breakpoints.lg)`
      font-size: 7rem;
      line-height: 8rem;
      margin-bottom: 1.2rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5.5rem;
        line-height: 6rem;
        margin-bottom: 1rem;
    `}
    
    ${respondDown(Breakpoints.sm)`
        font-size: 4rem;
        line-height: 5rem;
        margin-bottom: 0.8rem;
    `}
`;

const Description = styled.div`
    max-width: 79.2rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.white};
    text-align: center;
    opacity: 0.7;
    z-index: 1;
`;

const ExploreBlock = styled.div<{ hasChosenPairs: boolean }>`
    position: relative;
    padding: 0 4rem;
    ${commonMaxWidth};
    padding-bottom: ${({ hasChosenPairs }) => (hasChosenPairs ? '0' : '6.6rem')};

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        background: ${COLORS.lightGray};
    `}
`;

const PairSearch = styled.div`
    margin-top: -5.5rem;
    height: 17rem;
    background: ${COLORS.white};
    box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4.8rem;
    box-sizing: border-box;

    ${respondDown(Breakpoints.md)`
        margin-top: 3rem;
        flex-direction: column;
        box-shadow: unset;
        padding: 0;
        margin-bottom: 8rem; 
        background: ${COLORS.transparent};
    `}
`;

const SwapButton = styled.div<{ disabled: boolean }>`
    margin: 0 3.6rem;
    padding: 0.8rem;
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 0.4rem;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

    &:hover {
        background: ${COLORS.lightGray};
    }

    ${respondDown(Breakpoints.md)`
        margin: 1.8rem 0;
    `}
`;

const ArrowsIcon = styled(Arrows)`
    min-width: 1.6rem;
    min-height: 1.6rem;
`;

const TooltipFullWidth = styled(Tooltip)`
    width: 100%;
`;

const TooltipContent = styled.div`
    display: flex;
    ${flexAllCenter};
    width: 30rem;
    white-space: pre-wrap;
    font-size: 1.6rem;
    line-height: 2.4rem;
    padding: 0.8rem;

    span:first-child {
        margin-right: 1.2rem;
    }

    ${respondDown(Breakpoints.md)`
        width: 25rem;
        font-size: 1.2rem;
        line-height: 1.4rem;
        padding: 0.3rem;
    `}
`;

const Header = styled.header`
    display: flex;
    //justify-content: space-between;
    align-items: center;
    margin: 5.4rem 0;

    ${respondDown(Breakpoints.md)`
         flex-direction: column-reverse;
         margin-bottom: 2.4rem;
    `}
`;

const TitleHeader = styled.h3`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.titleText};
    margin-right: 3.6rem;

    ${respondDown(Breakpoints.md)`
         display: none;
    `}
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    ${respondDown(Breakpoints.md)`
        width: 100%;
        justify-content: space-evenly;
        margin-top: 1.6rem;
        
        label {
            padding: 0.8rem 0;
            width: 100%;
        }
    `}
`;

const StatusUpdate = styled.div`
    margin-left: auto;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    white-space: nowrap;

    ${respondDown(Breakpoints.md)`
         text-align: center;
         margin-left: 0;
    `}
`;

const Dot = styled.span`
    ${respondDown(Breakpoints.md)`
          display: none;
    `}
`;

const LastUpdated = styled.span`
    ${respondDown(Breakpoints.md)`
            display: block;
    `}
`;

const SearchEnabled = styled.div`
    font-size: 3.6rem;
    line-height: 4.2rem;
    margin-bottom: 3.2rem;
`;

const CreatePair = styled.div`
    ${flexRowSpaceBetween};
    height: 9.6rem;
    margin-bottom: 6rem;
    border: 0.1rem solid ${COLORS.transparent};
    cursor: pointer;
    padding-right: 0.8rem;

    &:hover {
        background: ${COLORS.lightGray};
        border: 0.1rem solid ${COLORS.gray};
    }

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        background: ${COLORS.white};
        border-radius: 0.5rem;
        margin-bottom: 1.6rem;
        padding: 2.7rem 1.6rem 8rem;
        height: unset;
        
        Button {
            margin-top: 3.2rem;
        }
    `}
`;

const BeFirst = styled.div`
    font-weight: bold;
    font-size: 1.2rem;
    line-height: 1.4rem;
    display: flex;
    align-items: center;
    width: 16rem;
    white-space: pre-line;

    div:first-child {
        margin-right: 0.8rem;
    }
`;

export const SELECTED_PAIRS_ALIAS = 'selected pairs';

export const getCachedChosenPairs = () =>
    JSON.parse(localStorage.getItem(SELECTED_PAIRS_ALIAS) || '[]');

const options: Option<SortTypes>[] = [
    { label: 'Top Voted', value: SortTypes.topVoted },
    { label: 'Popular', value: SortTypes.popular },
    { label: 'With Bribes', value: SortTypes.withBribes },
    { label: 'Your Votes', value: SortTypes.yourVotes },
];

const PAGE_SIZE = 20;
const UPDATE_INTERVAL = 60 * 1000; // 1 minute

export const AQUA = StellarService.createAsset(AQUA_CODE, AQUA_ISSUER);
export const UP_ICE = StellarService.createAsset(UP_ICE_CODE, ICE_ISSUER);
export const DOWN_ICE = StellarService.createAsset(DOWN_ICE_CODE, ICE_ISSUER);

enum UrlParams {
    sort = 'sort',
    base = 'base',
    counter = 'counter',
}

const assetToUrlParams = (asset) => {
    const assetInstance = StellarService.createAsset(asset.code, asset.issuer);

    if (assetInstance.isNative()) {
        return 'native';
    }

    return `${assetInstance.code}:${assetInstance.issuer}`;
};

const assetFromUrlParams = (params) => {
    if (params === 'native') {
        return StellarService.createLumen();
    }

    const [code, issuer] = params.split(':');

    return StellarService.createAsset(code, issuer);
};

export const getAssetsFromPairs = (pairs) => {
    return pairs.reduce((acc, item) => {
        const bribeAssets =
            item.aggregated_bribes?.reduce((accum, bribe) => {
                return [...accum, { code: bribe.asset_code, issuer: bribe.asset_issuer }];
            }, []) ?? [];

        return [
            ...acc,
            ...bribeAssets,
            { code: item.asset1_code, issuer: item.asset1_issuer },
            { code: item.asset2_code, issuer: item.asset2_issuer },
        ];
    }, []);
};

const MainPage = (): JSX.Element => {
    const [updateIndex, setUpdateIndex] = useState(0);
    const { processNewAssets } = useAssetsStore();
    const [chosenPairs, setChosenPairs] = useState(getCachedChosenPairs());
    const [sort, setSort] = useState(null);
    const [page, setPage] = useState(1);
    const { isLogged, account } = useAuthStore();
    const [claimUpdateId, setClaimUpdateId] = useState(0);
    const [searchBase, setSearchBase] = useState(null);
    const [searchCounter, setSearchCounter] = useState(null);
    const [pairsLoading, setPairsLoading] = useState(false);
    const [changePageLoading, setChangePageLoading] = useState(false);
    const [isCounterSearchActive, setIsCounterSearchActive] = useState(false);
    const [totalStats, setTotalStats] = useState(null);

    const [pairs, setPairs] = useState(null);
    const [count, setCount] = useState(0);

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (
            !params.has(UrlParams.sort) &&
            !params.has(UrlParams.base) &&
            !params.has(UrlParams.counter)
        ) {
            params.append(UrlParams.sort, SortTypes.topVoted);
            history.replace({ search: params.toString() });
            return;
        }
        if (
            params.has(UrlParams.sort) &&
            (params.has(UrlParams.base) || params.has(UrlParams.counter))
        ) {
            params.delete(UrlParams.base);
            params.delete(UrlParams.counter);
            history.replace({ search: params.toString() });
            return;
        }

        if (params.has(UrlParams.counter) && !params.has(UrlParams.base)) {
            params.append(UrlParams.base, params.get(UrlParams.counter));
            params.delete(UrlParams.counter);
            history.replace({ search: params.toString() });
        }

        if (
            params.get(UrlParams.base) &&
            params.get(UrlParams.base) === params.get(UrlParams.counter)
        ) {
            params.delete(UrlParams.counter);
            history.replace({ search: params.toString() });
            return;
        }

        if (
            params.has(UrlParams.sort) &&
            !Object.values(SortTypes).includes(params.get(UrlParams.sort) as SortTypes)
        ) {
            params.delete(UrlParams.sort);
            history.replace({ search: params.toString() });
            return;
        }

        if (params.has(UrlParams.sort)) {
            setSort(params.get(UrlParams.sort));
        } else {
            setSort(null);
        }
        if (params.has(UrlParams.base)) {
            try {
                const asset = assetFromUrlParams(params.get(UrlParams.base));
                setSearchBase(asset);
            } catch (e) {
                params.delete(UrlParams.base);
                history.replace({ search: params.toString() });
            }
        } else {
            setSearchBase(null);
        }
        if (params.has(UrlParams.counter)) {
            try {
                const asset = assetFromUrlParams(params.get(UrlParams.counter));
                setSearchCounter(asset);
            } catch (e) {
                params.delete(UrlParams.counter);
                history.replace({ search: params.toString() });
            }
        } else {
            setSearchCounter(null);
        }
    }, [location]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex((prev) => prev + 1);
        }, UPDATE_INTERVAL);

        return () => {
            clearInterval(interval);
        };
    }, [sort, searchBase, searchCounter, page]);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setClaimUpdateId((prevState) => prevState + 1);
            }
        });

        return () => unsub();
    }, []);

    const headerRef = useRef(null);

    useEffect(() => {
        if (!pairs?.length || !headerRef.current) {
            return;
        }
        headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [page]);

    const updateChosenPairs = () => {
        setChosenPairs(getCachedChosenPairs());
    };

    const startVote = () => {
        if (isLogged) {
            ModalService.openModal(VotesAmountModal, {
                pairs: chosenPairs,
                updatePairs: updateChosenPairs,
            }).then(() => {
                setChosenPairs(getCachedChosenPairs());
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    const processAssetsFromPairs = (pairs) => {
        const assets = getAssetsFromPairs(pairs);

        processNewAssets(assets);
    };

    useEffect(() => {
        if (sort === SortTypes.yourVotes && !isLogged) {
            changeSort(SortTypes.topVoted);
        }
    }, [isLogged, sort]);

    useEffect(() => {
        if (sort !== SortTypes.yourVotes || !account) {
            return;
        }
        setPairsLoading(true);

        const keys = StellarService.getKeysSimilarToMarketKeys(account.accountId());

        getUserPairsList(keys).then((result) => {
            setPairs(result);
            processAssetsFromPairs(result);
            setCount(result.length);
            setPairsLoading(false);
            setChangePageLoading(false);
        });
    }, [sort]);

    useEffect(() => {
        if (sort !== SortTypes.yourVotes || !claimUpdateId || !account) {
            return;
        }

        const keys = StellarService.getKeysSimilarToMarketKeys(account.accountId());

        getUserPairsList(keys).then((result) => {
            setPairs(result);
            processAssetsFromPairs(result);
            setCount(result.length);
            setPairsLoading(false);
            setChangePageLoading(false);
        });
    }, [claimUpdateId]);

    useEffect(() => {
        if (sort === SortTypes.topVoted || sort === SortTypes.popular) {
            Promise.all([getPairsList(sort, PAGE_SIZE, page), getTotalVotingStats()]).then(
                ([pairsResult, totalStatsResult]) => {
                    setPairs(pairsResult.pairs);
                    setCount(pairsResult.count);
                    processAssetsFromPairs(pairsResult.pairs);
                    setTotalStats(totalStatsResult);
                },
            );
            return;
        }
        Promise.all([updateVotesForMarketKeys(pairs), getTotalVotingStats()]).then(
            ([pairsResult, totalStatsResult]) => {
                setPairs(pairsResult);
                setTotalStats(totalStatsResult);
            },
        );
    }, [updateIndex]);

    useEffect(() => {
        if (!sort || sort === SortTypes.yourVotes || sort === SortTypes.withBribes) {
            return;
        }

        setPairsLoading(true);
        getPairsList(sort, PAGE_SIZE, page).then((result) => {
            setPairs(result.pairs);
            setCount(result.count);
            processAssetsFromPairs(result.pairs);
            setPairsLoading(false);
            setChangePageLoading(false);
        });
    }, [sort, page]);

    useEffect(() => {
        if (sort !== SortTypes.withBribes) {
            return;
        }

        setPairsLoading(true);
        getPairsWithBribes(PAGE_SIZE, page).then((result) => {
            setPairs(result.pairs);
            setCount(result.count);
            processAssetsFromPairs(result.pairs);
            setPairsLoading(false);
            setChangePageLoading(false);
        });
    }, [sort, page]);

    useEffect(() => {
        if (!searchBase) {
            return;
        }
        setPairsLoading(true);
        getFilteredPairsList(searchBase, searchCounter, PAGE_SIZE, page).then((result) => {
            setPairs(result.pairs);
            processAssetsFromPairs(result.pairs);
            setCount(result.count);
            setPairsLoading(false);
            setChangePageLoading(false);
        });
    }, [searchBase, searchCounter, page]);

    // clear chosen pairs for Ledger
    useEffect(() => {
        if (isLogged && account.authType === LoginTypes.ledger) {
            localStorage.setItem(SELECTED_PAIRS_ALIAS, JSON.stringify([]));
            setChosenPairs([]);
        }
    }, [isLogged]);

    const changeSort = (sortValue) => {
        if (!isLogged && sortValue === SortTypes.yourVotes) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.sort, sortValue);
        params.delete(UrlParams.base);
        params.delete(UrlParams.counter);
        history.push({ pathname: location.pathname, search: params.toString() });
        setPage(1);
    };

    const changeBaseSearch = (asset) => {
        const params = new URLSearchParams(location.search);
        params.delete(UrlParams.sort);
        if (asset) {
            params.set(UrlParams.base, assetToUrlParams(asset));
        } else {
            params.delete(UrlParams.base);
        }
        history.push({
            pathname: location.pathname,
            search: decodeURIComponent(params.toString()),
        });
        setPairsLoading(true);
        setPage(1);
    };

    const changeCounterSearch = (asset) => {
        const params = new URLSearchParams(location.search);
        params.delete(UrlParams.sort);
        if (asset) {
            params.set(UrlParams.counter, assetToUrlParams(asset));
        } else {
            params.delete(UrlParams.counter);
        }
        history.push({
            pathname: location.pathname,
            search: decodeURIComponent(params.toString()),
        });
        setPairsLoading(true);
        setPage(1);
    };

    const swapAssets = () => {
        if (!searchCounter) {
            return;
        }
        const params = new URLSearchParams(location.search);
        const base = params.get(UrlParams.base);
        const counter = params.get(UrlParams.counter);

        params.set(UrlParams.base, counter);
        params.set(UrlParams.counter, base);

        history.push({
            pathname: location.pathname,
            search: decodeURIComponent(params.toString()),
        });
    };

    const changePage = (page) => {
        setPage(page);
        setChangePageLoading(true);
    };

    if (!pairs) {
        return <PageLoader />;
    }
    const createPair = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLogged) {
            ModalService.openModal(CreatePairModal, {
                base: searchBase,
                counter: searchCounter,
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {});
    };
    const onVoteClick = (pair: PairStats) => {
        if (isLogged && account.authType === LoginTypes.ledger) {
            ModalService.openModal(VotesAmountModal, {
                pairs: [pair],
                isSingleVoteForModal: true,
                updatePairs: () => {},
            });
            return;
        }
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

    const hasChosenPairs = chosenPairs.length > 0;

    const goToMarketPage = () => {
        history.push(
            `${MarketRoutes.main}/${
                searchBase.isNative() ? 'native' : `${searchBase.code}:${searchBase.issuer}`
            }/${
                searchCounter.isNative()
                    ? 'native'
                    : `${searchCounter.code}:${searchCounter.issuer}`
            }`,
        );
    };

    return (
        <MainBlock>
            <Background>
                <Title>Vote For Your Favorite Pairs</Title>
                <Description>
                    Lock your AQUA or ICE to create immutable and transparent votes direct on the
                    Stellar blockchain
                </Description>
                <BackgroundLeft />
                <BackgroundRight />
            </Background>
            <ExploreBlock hasChosenPairs={hasChosenPairs}>
                <PairSearch>
                    <AssetDropdown
                        asset={searchBase}
                        onUpdate={changeBaseSearch}
                        exclude={searchCounter}
                    />
                    <SwapButton disabled={!searchCounter} onClick={() => swapAssets()}>
                        <ArrowsIcon />
                    </SwapButton>

                    <TooltipFullWidth
                        content={
                            <TooltipContent>
                                <span>&#128075;</span>
                                <span>
                                    Can&apos;t find your pair below? Try to type second asset into
                                    this field
                                </span>
                            </TooltipContent>
                        }
                        position={TOOLTIP_POSITION.bottom}
                        isShow={
                            Boolean(searchBase) && !Boolean(searchCounter) && !isCounterSearchActive
                        }
                    >
                        <AssetDropdown
                            asset={searchCounter}
                            onUpdate={changeCounterSearch}
                            disabled={!searchBase}
                            onToggle={setIsCounterSearchActive}
                            exclude={searchBase}
                        />
                    </TooltipFullWidth>
                </PairSearch>
                <Header ref={headerRef}>
                    <TitleHeader>Explore</TitleHeader>
                    <ToggleGroupStyled
                        value={sort}
                        onChange={(option) => changeSort(option)}
                        options={options}
                    />
                    {Boolean(pairs.length && pairs.some((pair) => Boolean(pair.timestamp))) && (
                        <StatusUpdate>
                            {totalStats ? (
                                <>
                                    <span>
                                        {formatBalance(totalStats.total_votes_sum, true)} total in
                                        votes
                                    </span>
                                    <Dot>{' · '}</Dot>
                                </>
                            ) : (
                                <DotsLoader />
                            )}
                            <LastUpdated>
                                Last updated{' '}
                                {getTimeAgoValue(
                                    pairs.find((pair) => Boolean(pair.timestamp)).timestamp,
                                )}
                            </LastUpdated>
                        </StatusUpdate>
                    )}
                </Header>
                {!pairsLoading && searchBase && !searchCounter && (
                    <SearchEnabled>
                        {pairs.length ? 'Search results' : 'No pairs found'}
                    </SearchEnabled>
                )}
                {sort === SortTypes.yourVotes && !pairs.length && (
                    <SearchEnabled>No pairs found</SearchEnabled>
                )}
                {searchBase && searchCounter && !pairs.length && (
                    <CreatePair onClick={() => goToMarketPage()}>
                        <Pair base={searchBase} counter={searchCounter} mobileVerticalDirections />
                        <Tooltip
                            content={
                                <BeFirst>
                                    <div>&#128293;</div>
                                    <div>Be the first to vote for rewards on this pair!</div>
                                </BeFirst>
                            }
                            position={TOOLTIP_POSITION.bottom}
                            isShow={true}
                        >
                            <Button onClick={(e) => createPair(e)}>create pair</Button>
                        </Tooltip>
                    </CreatePair>
                )}
                <Table
                    pairs={pairs}
                    selectedPairs={chosenPairs}
                    selectPair={onVoteClick}
                    loading={pairsLoading}
                    totalStats={totalStats}
                    isYourVotes={sort === SortTypes.yourVotes}
                />
                {(!pairsLoading || changePageLoading) && sort !== SortTypes.yourVotes && (
                    <Pagination
                        pageSize={PAGE_SIZE}
                        totalCount={count}
                        onPageChange={(page) => changePage(page)}
                        currentPage={page}
                        itemName="pairs"
                    />
                )}
                {hasChosenPairs && (
                    <FloatingButton onClick={() => startVote()}>
                        {chosenPairs.length}
                    </FloatingButton>
                )}
            </ExploreBlock>
        </MainBlock>
    );
};

export default MainPage;
