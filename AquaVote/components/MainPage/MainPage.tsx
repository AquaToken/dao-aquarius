import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import BackgroundImageLeft from '../../../common/assets/img/background-left.svg';
import BackgroundImageRight from '../../../common/assets/img/background-right.svg';
import { Breakpoints, COLORS } from '../../../common/styles';
import {
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from '../../../common/mixins';
import ToggleGroup from '../../../common/basics/ToggleGroup';
import Table from './Table/Table';
import FloatingButton from './FloatingButton/FloatingButton';
import SelectedPairsForm from './SelectedPairsForm/SelectedPairsForm';
import { ModalService } from '../../../common/services/globalServices';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import useAuthStore from '../../../common/store/authStore/useAuthStore';
import AssetDropdown from '../AssetDropdown/AssetDropdown';
import Arrows from '../../../common/assets/img/icon-arrows-circle.svg';
import { getFilteredPairsList, getPairsList, SortTypes } from '../../api/api';
import PageLoader from '../../../common/basics/PageLoader';
import useAssetsStore from '../../store/assetsStore/useAssetsStore';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';
import { PairStats } from '../../api/types';
import CreatePairModal from './CreatePairModal/CreatePairModal';
import Pair from '../common/Pair';
import Button from '../../../common/basics/Button';
import { getTimeAgoValue } from '../../../common/helpers/helpers';
import { Option } from '../../../common/basics/Select';
import Pagination from '../../../common/basics/Pagination';

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
`;

const BackgroundLeft = styled(BackgroundImageLeft)`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
`;

const BackgroundRight = styled(BackgroundImageRight)`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
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

const ExploreBlock = styled.div`
    position: relative;
    padding: 0 4rem;
    ${commonMaxWidth};
`;

const PairSearch = styled.div`
    margin-top: -5.5rem;
    height: 17rem;
    background: #ffffff;
    box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4.8rem;
    box-sizing: border-box;
`;

const ArrowsIcon = styled(Arrows)`
    margin: 0 3.6rem;
    min-width: 1.6rem;
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
`;

const Header = styled.header`
    display: flex;
    //justify-content: space-between;
    align-items: center;
    margin: 5.4rem 0;
`;

const TitleHeader = styled.h3`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.titleText};
    margin-right: 3.6rem;
`;

const StatusUpdate = styled.div`
    margin-left: auto;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    white-space: nowrap;
`;

const SearchEnabled = styled.div`
    font-size: 3.6rem;
    line-height: 4.2rem;
    margin-bottom: 3.2rem;
`;

const CreatePair = styled.div`
    ${flexRowSpaceBetween};
    height: 9.6rem;
`;

export const SELECTED_PAIRS_ALIAS = 'selected pairs';

const getCachedChosenPairs = () => JSON.parse(localStorage.getItem(SELECTED_PAIRS_ALIAS) || '[]');

const options: Option<SortTypes>[] = [
    { label: 'Popular', value: SortTypes.popular },
    { label: 'Top 100', value: SortTypes.topVoted },
    { label: 'Top Volume', value: SortTypes.topVolume },
];

const PAGE_SIZE = 10;

const MainPage = (): JSX.Element => {
    const { processNewAssets } = useAssetsStore();
    const [chosenPairs, setChosenPairs] = useState(getCachedChosenPairs());
    const [sort, setSort] = useState(SortTypes.popular);
    const [page, setPage] = useState(1);
    const { isLogged } = useAuthStore();

    const updateChosenPairs = () => {
        setChosenPairs(getCachedChosenPairs());
    };

    const startVote = () => {
        if (isLogged) {
            ModalService.openModal(SelectedPairsForm, {
                pairs: chosenPairs,
                updatePairs: updateChosenPairs,
            }).then(() => {
                setChosenPairs(getCachedChosenPairs());
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    const [searchBase, setSearchBase] = useState(null);
    const [searchCounter, setSearchCounter] = useState(null);
    const [pairsLoading, setPairsLoading] = useState(false);
    const [changePageLoading, setChangePageLoading] = useState(false);
    const [isCounterSearchActive, setIsCounterSearchActive] = useState(false);

    const [pairs, setPairs] = useState(null);
    const [count, setCount] = useState(0);

    const processAssetsFromPairs = (pairs) => {
        const assets = pairs.reduce((acc, item) => {
            return [
                ...acc,
                { code: item.asset1_code, issuer: item.asset1_issuer },
                { code: item.asset2_code, issuer: item.asset2_issuer },
            ];
        }, []);

        processNewAssets(assets);
    };

    useEffect(() => {
        if (sort) {
            setPairsLoading(true);
            getPairsList(sort, PAGE_SIZE, page).then((result) => {
                setPairs(result.pairs);
                setCount(result.count);
                processAssetsFromPairs(result.pairs);
                setPairsLoading(false);
                setChangePageLoading(false);
            });
        }
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

    const changeSort = (sortValue) => {
        setSort(sortValue);
        setPage(1);
        setSearchBase(null);
        setSearchCounter(null);
    };

    const changeBaseSearch = (asset) => {
        setSearchBase(asset);
        setPage(1);
        setSort(null);
    };

    const changeCounterSearch = (asset) => {
        setSearchCounter(asset);
        setPage(1);
        setSort(null);
    };

    const changePage = (page) => {
        setPage(page);
        setChangePageLoading(true);
    };

    if (!pairs) {
        return <PageLoader />;
    }
    const createPair = () => {
        if (isLogged) {
            ModalService.openModal(CreatePairModal, {
                base: searchBase,
                counter: searchCounter,
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {});
    };
    const addToVote = (pair: PairStats) => {
        const updatedPairs = [...chosenPairs, pair];
        setChosenPairs(updatedPairs);
        localStorage.setItem(SELECTED_PAIRS_ALIAS, JSON.stringify(updatedPairs));
    };

    return (
        <MainBlock>
            <Background>
                <Title>Vote For Your Favorite Pairs</Title>
                <Description>
                    Lock your AQUA to create immutable and transparent votes direct on the Stellar
                    blockchain
                </Description>
                <BackgroundLeft />
                <BackgroundRight />
            </Background>
            <ExploreBlock>
                <PairSearch>
                    <AssetDropdown
                        asset={searchBase}
                        onUpdate={changeBaseSearch}
                        exclude={searchCounter}
                    />
                    <ArrowsIcon />
                    <Tooltip
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
                    </Tooltip>
                </PairSearch>
                <Header>
                    <TitleHeader>Explore</TitleHeader>
                    <ToggleGroup
                        value={sort}
                        onChange={(option) => changeSort(option)}
                        options={options}
                    />
                    {Boolean(pairs.length && pairs.some((pair) => Boolean(pair.timestamp))) && (
                        <StatusUpdate>
                            Last updated{' '}
                            {getTimeAgoValue(
                                pairs.find((pair) => Boolean(pair.timestamp)).timestamp,
                            )}
                        </StatusUpdate>
                    )}
                </Header>
                {searchBase && (
                    <SearchEnabled>
                        {pairs.length ? 'Search results' : 'No pair found'}
                    </SearchEnabled>
                )}
                {searchBase && searchCounter && !pairs.length && (
                    <CreatePair>
                        <Pair base={searchBase} counter={searchCounter} />
                        <Button onClick={() => createPair()}>create pair</Button>
                    </CreatePair>
                )}
                <Table
                    pairs={pairs}
                    selectedPairs={chosenPairs}
                    selectPair={addToVote}
                    loading={pairsLoading}
                />
                {(!pairsLoading || changePageLoading) && (
                    <Pagination
                        pageSize={PAGE_SIZE}
                        totalCount={sort === SortTypes.popular ? PAGE_SIZE : count}
                        onPageChange={(page) => changePage(page)}
                        currentPage={page}
                        itemName="pairs"
                    />
                )}
                {chosenPairs.length > 0 && (
                    <FloatingButton onClick={() => startVote()}>
                        {chosenPairs.length}
                    </FloatingButton>
                )}
            </ExploreBlock>
        </MainBlock>
    );
};

export default MainPage;
