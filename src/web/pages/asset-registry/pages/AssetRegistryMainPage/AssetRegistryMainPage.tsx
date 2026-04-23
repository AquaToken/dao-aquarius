import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { getRegistryAssetMarketStatsRequest, getRegistryAssetsRequest } from 'api/asset-registry';

import { ASSETS_ENV_DATA } from 'constants/assets';

import { getEnv } from 'helpers/env';

import { Option } from 'types/option';

import Search from 'assets/icons/actions/icon-search-16.svg';

import { PageContainer } from 'styles/commonPageStyles';
import { COLORS } from 'styles/style-constants';

import {
    FilterGroup,
    MainSection,
    SearchInput,
    Title,
    Toolbar,
} from './AssetRegistryMainPage.styled';
import {
    AssetRegistryFilter,
    RegistryAsset,
    RegistryAssetMarketStatsMap,
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

    const upcomingVotes = useMemo<UpcomingVoteData[]>(
        () => [
            {
                id: 'queue-1',
                queueLabel: 'Queue #1',
                startsAt: 'Starts May 3, 14:00 UTC',
                assetCode: 'USDC',
                actionLabel: 'Whitelist',
                actionVariant: 'whitelisted',
            },
            {
                id: 'queue-2',
                queueLabel: 'Queue #2',
                startsAt: 'Starts May 10, 14:00 UTC',
                assetCode: 'XLM',
                actionLabel: 'Revoke',
                actionVariant: 'revoked',
            },
        ],
        [],
    );

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
                            <SearchInput
                                inputSize="medium"
                                placeholder="Search by token name or address"
                                value={search}
                                onChange={({ target }) => setSearch(target.value)}
                                postfix={<Search />}
                            />
                        </Toolbar>
                    }
                />
            </MainSection>
        </PageContainer>
    );
};

export default AssetRegistryMainPage;
