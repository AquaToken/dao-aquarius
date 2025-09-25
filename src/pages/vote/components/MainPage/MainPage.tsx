import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
    D_ICE_CODE,
    DOWN_ICE_CODE,
    GD_ICE_CODE,
    GOV_ICE_CODE,
    ICE_ISSUER,
    UP_ICE_CODE,
} from 'constants/assets';
import { MainRoutes, MarketRoutes } from 'constants/routes';

import { getAssetString } from 'helpers/assets';
import { getTimeAgoValue } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { createAsset, createLumen } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar.service';

import { ClassicToken } from 'types/token';

import { commonMaxWidth, flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import BackgroundImageLeft from 'assets/background-left.svg';
import BackgroundImageRight from 'assets/background-right.svg';
import dIce from 'assets/dice-logo.svg';
import Ice from 'assets/ice-logo.svg';
import Info from 'assets/icon-info.svg';

import AssetDropdown from 'basics/asset-pickers/AssetDropdown';
import Button from 'basics/buttons/Button';
import { Option } from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Pagination from 'basics/Pagination';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import DelegateBlockSmall from 'components/DelegateBlockSmall';

import CreatePairModal from './CreatePairModal/CreatePairModal';
import FloatingButton from './FloatingButton/FloatingButton';
import Table from './Table/Table';
import VotesAmountModal from './VoteModals/VotesAmountModal';

import {
    getFilteredPairsList,
    getPairsList,
    getPairsWithBribes,
    getTotalVotingStats,
    getUserPairsList,
    SortTypes,
    updateVotesForMarketKeys,
} from '../../api/api';
import { PairStats } from '../../api/types';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    padding: 10% 0;
    ${flexAllCenter};
    flex-direction: column;
    background-color: ${COLORS.purple900};
    min-height: 10rem;
    max-height: 50vh;
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
    font-size: 6rem;
    line-height: 9.4rem;
    font-weight: bold;
    color: ${COLORS.white};
    z-index: 1;
    margin-bottom: 1.6rem;
    text-align: center;

    ${respondDown(Breakpoints.lg)`
      font-size: 5.5rem;
      line-height: 8rem;
      margin-bottom: 1.2rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5rem;
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

const ExploreBlock = styled.div<{ $hasChosenPairs: boolean }>`
    position: relative;
    ${commonMaxWidth};
    padding: 0 4rem ${({ $hasChosenPairs }) => ($hasChosenPairs ? '0' : '6.6rem')};

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
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
    padding: 1rem 4.8rem 0;
    box-sizing: border-box;

    ${respondDown(Breakpoints.md)`
        margin-top: -3rem;
        padding: 1.6rem;
        margin-bottom: 8rem;
        padding-top: 5rem;
        flex-direction: column;
        height: unset;
    `}
`;

const Header = styled.header`
    display: flex;
    align-items: center;
    margin: 5.4rem 0;

    ${respondDown(Breakpoints.md)`
         flex-direction: column-reverse;
         margin-bottom: 2.4rem;
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
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    margin-left: auto;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
    white-space: nowrap;

    ${respondDown(Breakpoints.md)`
         text-align: center;
         margin-left: 0;
         flex-direction: column;
    `}

    span {
        display: flex;
        align-items: center;
    }
`;

const Dot = styled.div`
    margin: 0 0.6rem;
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
        background: ${COLORS.gray50};
        border: 0.1rem solid ${COLORS.gray100};
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

const InfoIcon = styled(Info)`
    margin-left: 0.4rem;
`;

const TotalTooltip = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.textPrimary};
    width: 25rem;
`;

const TooltipRow = styled.div`
    ${flexRowSpaceBetween};
    padding: 0.4rem 0;
`;

const IceLogo = styled(Ice)`
    height: 1.8rem;
    width: 1.8rem;
    margin-right: 0.5rem;
`;

const DIceLogo = styled(dIce)`
    height: 1.8rem;
    width: 1.8rem;
    margin-right: 0.5rem;
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

export const UP_ICE = createAsset(UP_ICE_CODE, ICE_ISSUER);
export const GOV_ICE = createAsset(GOV_ICE_CODE, ICE_ISSUER);
export const DOWN_ICE = createAsset(DOWN_ICE_CODE, ICE_ISSUER);
export const DELEGATE_ICE = createAsset(D_ICE_CODE, ICE_ISSUER);
export const G_DELEGATE_ICE = createAsset(GD_ICE_CODE, ICE_ISSUER);

enum UrlParams {
    sort = 'sort',
    base = 'base',
    counter = 'counter',
}

const assetToUrlParams = (asset: ClassicToken) => {
    const assetInstance = createAsset(asset.code, asset.issuer);

    if (assetInstance.isNative()) {
        return 'native';
    }

    return `${assetInstance.code}:${assetInstance.issuer}`;
};

const assetFromUrlParams = (params: string) => {
    if (params === 'native') {
        return createLumen();
    }

    const [code, issuer] = params.split(':');

    return createAsset(code, issuer);
};

export const getAssetsFromPairs = pairs =>
    pairs.reduce((acc, item) => {
        const bribeAssets =
            item.aggregated_bribes?.reduce(
                (accum, bribe) => [
                    ...accum,
                    { code: bribe.asset_code, issuer: bribe.asset_issuer },
                ],
                [],
            ) ?? [];

        return [
            ...acc,
            ...bribeAssets,
            { code: item.asset1_code, issuer: item.asset1_issuer },
            { code: item.asset2_code, issuer: item.asset2_issuer },
        ];
    }, []);

const MainPage = (): React.ReactNode => {
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
            } catch {
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
            } catch {
                params.delete(UrlParams.counter);
                history.replace({ search: params.toString() });
            }
        } else {
            setSearchCounter(null);
        }
    }, [location]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex(prev => prev + 1);
        }, UPDATE_INTERVAL);

        return () => {
            clearInterval(interval);
        };
    }, [sort, searchBase, searchCounter, page]);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setClaimUpdateId(prevState => prevState + 1);
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
        ModalService.openModal(ChooseLoginMethodModal, {
            callback: () =>
                ModalService.openModal(VotesAmountModal, {
                    pairs: chosenPairs,
                    updatePairs: updateChosenPairs,
                }).then(() => {
                    setChosenPairs(getCachedChosenPairs());
                }),
        });
    };

    const processAssetsFromPairs = pairs => {
        const assets = getAssetsFromPairs(pairs);

        processNewAssets(assets);
    };

    const changeSort = (sortValue: SortTypes) => {
        if (!isLogged && sortValue === SortTypes.yourVotes) {
            ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: `${MainRoutes.vote}?${UrlParams.sort}=${SortTypes.yourVotes}`,
            });
            return;
        }
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.sort, sortValue);
        params.delete(UrlParams.base);
        params.delete(UrlParams.counter);
        history.push({ pathname: location.pathname, search: params.toString() });
        setPage(1);
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

        if (!StellarService.isClaimableBalancesLoaded) {
            return;
        }

        const keys = StellarService.getKeysSimilarToMarketKeys(account.accountId());

        getUserPairsList(keys).then(result => {
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

        if (!pairs.length) {
            setPairsLoading(true);
        }

        const keys = StellarService.getKeysSimilarToMarketKeys(account.accountId());

        getUserPairsList(keys).then(result => {
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
        Promise.all([
            pairs ? updateVotesForMarketKeys(pairs) : Promise.resolve([]),
            getTotalVotingStats(),
        ]).then(([pairsResult, totalStatsResult]) => {
            setPairs(pairsResult);
            setTotalStats(totalStatsResult);
        });
    }, [updateIndex]);

    useEffect(() => {
        if (!sort || sort === SortTypes.yourVotes || sort === SortTypes.withBribes) {
            return;
        }

        setPairsLoading(true);
        getPairsList(sort, PAGE_SIZE, page).then(result => {
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
        getPairsWithBribes(PAGE_SIZE, page).then(result => {
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
        getFilteredPairsList(searchBase, searchCounter, PAGE_SIZE, page).then(result => {
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

    const changeSearch = (assets: ClassicToken[]): void => {
        const [base, counter] = assets;

        const params = new URLSearchParams(location.search);
        params.delete(UrlParams.sort);

        if (base) {
            params.set(UrlParams.base, assetToUrlParams(base));
        } else {
            params.delete(UrlParams.base);
        }

        if (counter) {
            params.set(UrlParams.counter, assetToUrlParams(counter));
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

    const changePage = (page: number) => {
        setPage(page);
        setChangePageLoading(true);
    };

    const { totalUpIce, totalDIce, totalDownIce } = useMemo(() => {
        if (!totalStats) {
            return {
                totalUpIce: 0,
                totalDownIce: 0,
                totalDIce: 0,
            };
        }
        const { assets } = totalStats;

        return {
            totalUpIce: +assets.find(({ asset }) => asset === getAssetString(UP_ICE))?.votes_sum,
            totalDownIce: +assets.find(({ asset }) => asset === getAssetString(DOWN_ICE))
                ?.votes_sum,
            totalDIce: +assets.find(({ asset }) => asset === getAssetString(DELEGATE_ICE))
                ?.votes_sum,
        };
    }, [totalStats]);

    if (!pairs) {
        return <PageLoader />;
    }
    const createPair = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLogged) {
            ModalService.openModal(CreatePairModal, {
                base: searchBase,
                counter: searchCounter,
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {
            callback: () =>
                ModalService.openModal(CreatePairModal, {
                    base: searchBase,
                    counter: searchCounter,
                }),
        });
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
            chosenPair => chosenPair.market_key === pair.market_key,
        );

        let updatedPairs;

        if (isPairSelected) {
            updatedPairs = chosenPairs.filter(
                chosenPair => chosenPair.market_key !== pair.market_key,
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
                <Title>Vote with ICE to Support Stellar Markets</Title>
                <Description>
                    Lock your AQUA to mint ICE and vote on-chain. Your votes decide how AQUA
                    emissions are distributed — and can earn you bribes and incentives along the
                    way.
                </Description>
                <BackgroundLeft />
                <BackgroundRight />
            </Background>
            <ExploreBlock $hasChosenPairs={hasChosenPairs}>
                <PairSearch>
                    <AssetDropdown
                        assetsList={[searchBase, searchCounter].filter(Boolean)}
                        onUpdate={(assets: ClassicToken[]) => {
                            changeSearch(assets);
                        }}
                        excludeList={[searchBase, searchCounter].filter(Boolean)}
                        label="Search asset by name, domain or issuer"
                        placeholder="AQUA or aqua.network or AQUA:GBNZ...AQUA"
                        disabled={searchBase && searchCounter}
                        withChips
                    />
                </PairSearch>

                <DelegateBlockSmall />

                <Header ref={headerRef}>
                    <ToggleGroupStyled
                        value={sort}
                        onChange={(option: SortTypes) => changeSort(option)}
                        options={options}
                    />
                    {Boolean(pairs.length && pairs.some(pair => Boolean(pair.timestamp))) && (
                        <StatusUpdate>
                            {totalStats ? (
                                <Tooltip
                                    content={
                                        <TotalTooltip>
                                            <TooltipRow>
                                                <span>upvoteICE:</span>
                                                <span>
                                                    <IceLogo />
                                                    {formatBalance(totalUpIce, true)}
                                                </span>
                                            </TooltipRow>
                                            <TooltipRow>
                                                <span>dICE:</span>
                                                <span>
                                                    <DIceLogo />
                                                    {formatBalance(totalDIce, true)}
                                                </span>
                                            </TooltipRow>
                                            <TooltipRow>
                                                <span>downvoteICE:</span>
                                                <span>
                                                    <IceLogo />
                                                    {formatBalance(totalDownIce, true)}
                                                </span>
                                            </TooltipRow>
                                        </TotalTooltip>
                                    }
                                    position={TOOLTIP_POSITION.top}
                                    showOnHover
                                    background={COLORS.white}
                                >
                                    <>
                                        <Dot>·</Dot>
                                        <span>
                                            {formatBalance(totalStats.total_votes_sum, true)} total
                                            in votes
                                            <InfoIcon />
                                        </span>
                                    </>
                                </Tooltip>
                            ) : (
                                <DotsLoader />
                            )}
                            <LastUpdated>
                                Last updated{' '}
                                {getTimeAgoValue(
                                    pairs.find(pair => Boolean(pair.timestamp)).timestamp,
                                )}
                            </LastUpdated>
                        </StatusUpdate>
                    )}
                </Header>
                {!pairsLoading && searchBase && !searchCounter && (
                    <SearchEnabled>
                        {pairs.length ? 'Search results' : 'No markets found'}
                    </SearchEnabled>
                )}
                {sort === SortTypes.yourVotes &&
                    !pairs.length &&
                    StellarService.isClaimableBalancesLoaded &&
                    !pairsLoading && <SearchEnabled>No markets found</SearchEnabled>}
                {searchBase && searchCounter && !pairs.length && (
                    <CreatePair onClick={() => goToMarketPage()}>
                        <Market assets={[searchBase, searchCounter]} mobileVerticalDirections />
                        <Tooltip
                            content={
                                <BeFirst>
                                    <div>&#128293;</div>
                                    <div>Be the first to vote for rewards on this market!</div>
                                </BeFirst>
                            }
                            position={TOOLTIP_POSITION.bottom}
                            isShow={true}
                        >
                            <Button onClick={e => createPair(e)}>create market</Button>
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
                        onPageChange={page => changePage(page)}
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
