import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { getRegistryAssetMarketStatsRequest, getRegistryAssetsRequest } from 'api/asset-registry';

import { ASSETS_ENV_DATA } from 'constants/assets';

import { getEnv } from 'helpers/env';

import { Option } from 'types/option';

import Search from 'assets/icons/actions/icon-search-16.svg';

import { Input } from 'basics/inputs';

import { PageContainer } from 'styles/commonPageStyles';
import { COLORS } from 'styles/style-constants';

import {
    FilterGroup,
    MainSection,
    SearchInputWrap,
    Title,
    Toolbar,
} from './AssetRegistryMainPage.styled';
import {
    AssetRegistryFilter,
    RegistryAsset,
    RegistryAssetMarketStatsMap,
    RegistryAssetOnchainExecutionStatus,
    RegistryAssetProposalStatus,
    RegistryAssetProposalType,
    UpcomingVoteData,
} from './AssetRegistryMainPage.types';
import AssetRegistryContent from './components/AssetRegistryContent/AssetRegistryContent';

const FILTER_OPTIONS: Option<AssetRegistryFilter>[] = [
    { label: 'All', value: AssetRegistryFilter.all },
    { label: 'Whitelisted', value: AssetRegistryFilter.whitelisted },
    { label: 'Revoked', value: AssetRegistryFilter.revoked },
];

const { aqua, usdc } = ASSETS_ENV_DATA[getEnv()];

const DEFAULT_REGISTRY_ASSETS: RegistryAsset[] = [
    {
        asset_code: 'XLM',
        asset_issuer: null,
        asset_contract_address: null,
        whitelisted: true,
        proposals: [],
    },
    {
        asset_code: aqua.aquaCode,
        asset_issuer: aqua.aquaIssuer,
        asset_contract_address: null,
        whitelisted: true,
        proposals: [],
    },
    {
        asset_code: usdc.usdcCode,
        asset_issuer: usdc.usdcIssuer,
        asset_contract_address: null,
        whitelisted: true,
        proposals: [],
    },
];

const getRegistryAssetId = (asset: RegistryAsset) =>
    `${asset.asset_code ?? 'unknown'}:${asset.asset_issuer ?? 'native'}`;

const MOCK_UPCOMING_VOTES: UpcomingVoteData[] = [
    {
        id: 'queue-1',
        startsAt: 'Starts May 4, 00:00 UTC',
        assetCode: 'sUSD',
        assetIssuer: 'GCHW7CWI7GMIYQYFXMFJNJX5645XGWIINIAEQK3SABQO6CAYL5T7JYIH',
        type: 'ADD_ASSET',
    },
    {
        id: 'queue-2',
        startsAt: 'Starts May 11, 00:00 UTC',
        assetCode: 'USDP',
        assetIssuer: 'GDTEQF6YGCKLIBD37RJZE5GTL3ZY6CBQIKH7COAW654SYEBE6XJJOLOW',
        type: 'ADD_ASSET',
    },
    {
        id: 'queue-3',
        startsAt: 'Starts May 18, 00:00 UTC',
        assetCode: 'AQUAmb',
        assetIssuer: 'GDXF6SYWIQOKOZ7BACXHBFBLQZEIH25KOTTLWQK35GO3JKRNIFHHGBPC',
        type: 'ADD_ASSET',
    },
    {
        id: 'queue-4',
        startsAt: 'Starts May 25, 00:00 UTC',
        assetCode: 'yXLM',
        assetIssuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
        type: 'ADD_ASSET',
    },
    {
        id: 'queue-5',
        startsAt: 'Starts Jun 1, 00:00 UTC',
        assetCode: 'ESP',
        assetIssuer: 'GD2JVUJNJFJTV3P3DACOQNILC2HDHDQAIX76UNUCMAAKCCT7MVW4OFEW',
        type: 'ADD_ASSET',
    },
    {
        id: 'queue-6',
        startsAt: 'Starts Jun 8, 00:00 UTC',
        assetCode: 'RAYO',
        assetIssuer: 'GBPDJLJ23JEKXV5VVDD3FVNPW5XRRZPK6PCHWRIKM2STZ57423B6IXSQ',
        type: 'ADD_ASSET',
    },
    {
        id: 'queue-7',
        startsAt: 'Starts Jun 15, 00:00 UTC',
        assetCode: 'SHX',
        assetIssuer: 'GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH',
        type: 'ADD_ASSET',
    },
    {
        id: 'queue-8',
        startsAt: 'Starts Jun 22, 00:00 UTC',
        assetCode: 'ETH',
        assetIssuer: 'GBFXOHVAS43OIWNIO7XLRJAHT3BICFEIKOJLZVXNT572MISM4CMGSOCC',
        type: 'ADD_ASSET',
    },
    {
        id: 'queue-9',
        startsAt: 'Starts Jun 29, 00:00 UTC',
        assetCode: 'yUSDC',
        assetIssuer: 'GDGTVWSM4MGS4T7Z6W4RPWOCHE2I6RDFCIFZGS3DOA63LWQTRNZNTTFF',
        type: 'ADD_ASSET',
    },
    {
        id: 'queue-10',
        startsAt: 'Starts Jul 6, 00:00 UTC',
        assetCode: 'XRF',
        assetIssuer: 'GCHI6I3X62ND5XUMWINNNKXS2HPYZWKFQBZZYBSMHJ4MIP2XJXSZTXRF',
        type: 'ADD_ASSET',
    },
];

const AssetRegistryMainPage = () => {
    const [filter, setFilter] = useState(AssetRegistryFilter.all);
    const [search, setSearch] = useState('');
    const [apiRegistryAssets, setApiRegistryAssets] = useState<RegistryAsset[]>([]);
    const [marketStats, setMarketStats] = useState<RegistryAssetMarketStatsMap>({});
    const [isMarketStatsLoading, setIsMarketStatsLoading] = useState(true);

    useEffect(() => {
        let isCancelled = false;

        getRegistryAssetsRequest()
            .then(data => {
                if (!isCancelled) {
                    setApiRegistryAssets(data.results);
                }
            })
            .catch(() => undefined);

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        let isCancelled = false;

        setIsMarketStatsLoading(true);

        getRegistryAssetMarketStatsRequest()
            .then(data => {
                if (!isCancelled) {
                    setMarketStats(data);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    setMarketStats({});
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsMarketStatsLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    const upcomingVotes = useMemo<UpcomingVoteData[]>(() => MOCK_UPCOMING_VOTES, []);

    const items = useMemo(() => {
        const defaultIds = new Set(DEFAULT_REGISTRY_ASSETS.map(getRegistryAssetId));
        const uniqueApiRegistryAssets = apiRegistryAssets.filter(
            asset => !defaultIds.has(getRegistryAssetId(asset)),
        );

        return [...DEFAULT_REGISTRY_ASSETS, ...uniqueApiRegistryAssets];
    }, [apiRegistryAssets]);

    const filteredItems = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return items.filter(item => {
            const matchesFilter =
                filter === AssetRegistryFilter.all
                    ? true
                    : filter === AssetRegistryFilter.whitelisted
                      ? item.whitelisted
                      : !item.whitelisted;

            const matchesSearch =
                !searchValue ||
                item.asset_code?.toLowerCase().includes(searchValue) ||
                item.asset_issuer?.toLowerCase().includes(searchValue);

            return matchesFilter && matchesSearch;
        });
    }, [items, filter, search]);

    return (
        <PageContainer $color={COLORS.gray50}>
            <MainSection>
                <Title>Asset Registry</Title>

                <AssetRegistryContent
                    items={filteredItems}
                    marketStats={marketStats}
                    isMarketStatsLoading={isMarketStatsLoading}
                    upcomingVotes={upcomingVotes}
                    toolbar={
                        <Toolbar>
                            <FilterGroup
                                value={filter}
                                options={FILTER_OPTIONS}
                                onChange={setFilter}
                            />
                            <SearchInputWrap>
                                <Input
                                    inputSize="medium"
                                    placeholder="Search by token name or address"
                                    value={search}
                                    onChange={({ target }) => setSearch(target.value)}
                                    postfix={<Search />}
                                />
                            </SearchInputWrap>
                        </Toolbar>
                    }
                />
            </MainSection>
        </PageContainer>
    );
};

export default AssetRegistryMainPage;
