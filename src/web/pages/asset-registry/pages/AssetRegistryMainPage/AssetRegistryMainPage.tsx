import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
    getRegistryMyVotesRequest,
    getRegistryAssetMarketStatsRequest,
    getRegistryAssetsRequest,
    getRegistryVoteHistoryRequest,
    getUpcomingRegistryVotesRequest,
} from 'api/asset-registry';
import { getRewards, RewardsSort } from 'api/rewards';

import { getEnvClassicAssetData } from 'helpers/assets';
import { convertLocalDateToUTCIgnoringTimezone, getDateString } from 'helpers/date';
import { createAsset } from 'helpers/token';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { Option } from 'types/option';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import Search from 'assets/icons/actions/icon-search-16.svg';

import { Input } from 'basics/inputs';

import { PageContainer } from 'styles/commonPageStyles';
import { COLORS } from 'styles/style-constants';

import { Rewards } from 'pages/vote/api/types';

import {
    FilterGroup,
    FilterSelect,
    MainSection,
    SearchInputWrap,
    Title,
    Toolbar,
} from './AssetRegistryMainPage.styled';
import {
    AssetRegistryFilter,
    RegistryAsset,
    RegistryAssetMarketStatsMap,
    RegistryAssetProposalType,
    RegistryProposalPreview,
    UpcomingVoteData,
} from './AssetRegistryMainPage.types';
import AssetRegistryContent from './components/AssetRegistryContent/AssetRegistryContent';
import AssetRegistryMigrationStatus from './components/AssetRegistryMigrationStatus/AssetRegistryMigrationStatus';

const FILTER_OPTIONS: Option<AssetRegistryFilter>[] = [
    { label: 'All', value: AssetRegistryFilter.all },
    { label: 'Whitelisted', value: AssetRegistryFilter.whitelisted },
    { label: 'Revoked', value: AssetRegistryFilter.revoked },
    { label: 'My Votes', value: AssetRegistryFilter.myVotes },
    { label: 'History', value: AssetRegistryFilter.history },
];

const aqua = getEnvClassicAssetData('aqua');
const usdc = getEnvClassicAssetData('usdc');

const DEFAULT_REGISTRY_ASSETS: RegistryAsset[] = [
    {
        asset_code: 'XLM',
        asset_issuer: null,
        asset_contract_address: null,
        whitelisted: true,
        proposals: [],
    },
    {
        asset_code: aqua.code,
        asset_issuer: aqua.issuer,
        asset_contract_address: null,
        whitelisted: true,
        proposals: [],
    },
    {
        asset_code: usdc.code,
        asset_issuer: usdc.issuer,
        asset_contract_address: null,
        whitelisted: true,
        proposals: [],
    },
];

const getRegistryAssetId = (asset: RegistryAsset) =>
    `${asset.asset_code ?? 'unknown'}:${asset.asset_issuer ?? 'native'}`;

const getRewardsAssetId = (code: string, issuer: string) =>
    code === 'XLM' && !issuer ? 'XLM:native' : `${code}:${issuer}`;

const AssetRegistryMainPage = () => {
    const [filter, setFilter] = useState(AssetRegistryFilter.all);
    const [search, setSearch] = useState('');
    const [apiRegistryAssets, setApiRegistryAssets] = useState<RegistryAsset[]>(null);
    const [apiUpcomingVotes, setApiUpcomingVotes] = useState<UpcomingVoteData[]>([]);
    const [isUpcomingVotesLoading, setIsUpcomingVotesLoading] = useState(true);
    const [myVoteProposals, setMyVoteProposals] = useState<RegistryProposalPreview[]>([]);
    const [historyVoteProposals, setHistoryVoteProposals] = useState<RegistryProposalPreview[]>([]);
    const [isMyVotesLoading, setIsMyVotesLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [rewards, setRewards] = useState<Rewards[] | null>(null);
    const [isRewardsLoading, setIsRewardsLoading] = useState(true);
    const [marketStats, setMarketStats] = useState<RegistryAssetMarketStatsMap>({});
    const [isMarketStatsLoading, setIsMarketStatsLoading] = useState(true);
    const { account, isLogged } = useAuthStore();

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
        if (filter !== AssetRegistryFilter.myVotes) {
            return;
        }

        if (!isLogged || !account) {
            setMyVoteProposals([]);
            return;
        }

        let isCancelled = false;

        setIsMyVotesLoading(true);

        getRegistryMyVotesRequest(account.accountId())
            .then(data => {
                if (!isCancelled) {
                    setMyVoteProposals(data);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    setMyVoteProposals([]);
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsMyVotesLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [account, filter, isLogged]);

    useEffect(() => {
        if (filter !== AssetRegistryFilter.history) {
            return;
        }

        if (!isLogged || !account) {
            setHistoryVoteProposals([]);
            return;
        }

        let isCancelled = false;

        setIsHistoryLoading(true);

        getRegistryVoteHistoryRequest(account.accountId())
            .then(data => {
                if (!isCancelled) {
                    setHistoryVoteProposals(data);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    setHistoryVoteProposals([]);
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsHistoryLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [account, filter, isLogged]);

    useEffect(() => {
        let isCancelled = false;

        setIsRewardsLoading(true);

        getRewards(RewardsSort.totalUp)
            .then(data => {
                if (!isCancelled) {
                    setRewards(data);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    setRewards([]);
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsRewardsLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        let isCancelled = false;

        setIsUpcomingVotesLoading(true);

        getUpcomingRegistryVotesRequest()
            .then(data => {
                if (isCancelled) {
                    return;
                }

                const mappedVotes = data
                    .filter(
                        proposal =>
                            proposal.proposal_status === 'DISCUSSION' &&
                            proposal.start_at &&
                            proposal.asset_code,
                    )
                    .sort(
                        (a, b) =>
                            new Date(a.start_at ?? 0).getTime() -
                            new Date(b.start_at ?? 0).getTime(),
                    )
                    .map(proposal => {
                        const startAt = convertLocalDateToUTCIgnoringTimezone(
                            new Date(proposal.start_at as string),
                        );

                        return {
                            id: String(proposal.id),
                            startsAt: `Starts ${getDateString(startAt.getTime(), {})}`,
                            assetCode: proposal.asset_code as string,
                            assetIssuer: proposal.asset_issuer ?? '',
                            type: proposal.proposal_type as RegistryAssetProposalType,
                        };
                    });

                setApiUpcomingVotes(mappedVotes);
            })
            .catch(() => {
                if (!isCancelled) {
                    setApiUpcomingVotes([]);
                }
            })
            .finally(() => {
                if (!isCancelled) {
                    setIsUpcomingVotesLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!apiRegistryAssets) return;

        let isCancelled = false;

        setIsMarketStatsLoading(true);

        const allAssetsContracts = [
            ...DEFAULT_REGISTRY_ASSETS,
            ...apiRegistryAssets.filter(({ proposals }) =>
                proposals.some(
                    ({ proposal_status }) =>
                        proposal_status === 'VOTED' || proposal_status === 'VOTING',
                ),
            ),
        ]
            .filter(asset => asset.asset_code)
            .map(
                asset =>
                    asset.asset_contract_address ??
                    createAsset(asset.asset_code as string, asset.asset_issuer ?? '').contract,
            );

        getRegistryAssetMarketStatsRequest(allAssetsContracts)
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
    }, [apiRegistryAssets]);

    const upcomingVotes = useMemo<UpcomingVoteData[]>(() => apiUpcomingVotes, [apiUpcomingVotes]);

    const items = useMemo(() => {
        const defaultIds = new Set(DEFAULT_REGISTRY_ASSETS.map(getRegistryAssetId));
        const uniqueApiRegistryAssets =
            apiRegistryAssets?.filter(
                asset =>
                    !defaultIds.has(getRegistryAssetId(asset)) &&
                    asset.proposals.some(proposal => proposal.proposal_status === 'VOTED'),
            ) ?? [];

        return [...DEFAULT_REGISTRY_ASSETS, ...uniqueApiRegistryAssets];
    }, [apiRegistryAssets]);

    const whitelistedRegistryAssets = useMemo(() => {
        if (!apiRegistryAssets) {
            return [];
        }

        const uniqueAssets = new Map<string, RegistryAsset>();

        DEFAULT_REGISTRY_ASSETS.forEach(asset => {
            uniqueAssets.set(getRegistryAssetId(asset), asset);
        });

        apiRegistryAssets
            .filter(asset => asset.whitelisted)
            .forEach(asset => {
                uniqueAssets.set(getRegistryAssetId(asset), asset);
            });

        return [...uniqueAssets.values()];
    }, [apiRegistryAssets]);

    const whitelistedAssetsIds = useMemo(
        () => new Set(whitelistedRegistryAssets.map(getRegistryAssetId)),
        [whitelistedRegistryAssets],
    );

    const totalAmmRewardsAmount = useMemo(() => {
        if (!rewards) {
            return 0;
        }

        return rewards.reduce((sum, reward) => sum + (reward.daily_amm_reward ?? 0), 0);
    }, [rewards]);

    const whitelistedAmmRewardsAmount = useMemo(() => {
        if (!rewards) {
            return 0;
        }

        return rewards.reduce((sum, { daily_amm_reward, market_key }) => {
            const firstAssetId = getRewardsAssetId(
                market_key.asset1_code,
                market_key.asset1_issuer ?? '',
            );
            const secondAssetId = getRewardsAssetId(
                market_key.asset2_code,
                market_key.asset2_issuer ?? '',
            );

            if (
                !whitelistedAssetsIds.has(firstAssetId) ||
                !whitelistedAssetsIds.has(secondAssetId)
            ) {
                return sum;
            }

            return sum + (daily_amm_reward ?? 0);
        }, 0);
    }, [rewards, whitelistedAssetsIds]);

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

    const onFilterChange = (value: AssetRegistryFilter) => {
        if (
            (value === AssetRegistryFilter.myVotes || value === AssetRegistryFilter.history) &&
            !isLogged
        ) {
            ModalService.openModal(ChooseLoginMethodModal);
            return;
        }

        setFilter(value);
    };

    const isVotesMode =
        filter === AssetRegistryFilter.myVotes || filter === AssetRegistryFilter.history;
    const voteProposals =
        filter === AssetRegistryFilter.myVotes ? myVoteProposals : historyVoteProposals;
    const isVotesLoading =
        filter === AssetRegistryFilter.myVotes ? isMyVotesLoading : isHistoryLoading;

    return (
        <PageContainer $color={COLORS.gray50}>
            <MainSection>
                <AssetRegistryContent
                    topContent={
                        <>
                            <Title>Asset Registry</Title>
                            <AssetRegistryMigrationStatus
                                whitelistedAssetsCount={whitelistedRegistryAssets.length}
                                totalAmmRewardsAmount={totalAmmRewardsAmount}
                                whitelistedAmmRewardsAmount={whitelistedAmmRewardsAmount}
                                isAssetsLoading={!apiRegistryAssets}
                                isRewardsLoading={isRewardsLoading}
                            />
                        </>
                    }
                    items={filteredItems}
                    voteProposals={voteProposals}
                    isVotesMode={isVotesMode}
                    isVotesLoading={isVotesLoading}
                    marketStats={marketStats}
                    isMarketStatsLoading={isMarketStatsLoading}
                    upcomingVotes={upcomingVotes}
                    isUpcomingVotesLoading={isUpcomingVotesLoading}
                    toolbar={
                        <Toolbar>
                            <FilterGroup
                                value={filter}
                                options={FILTER_OPTIONS}
                                onChange={onFilterChange}
                            />

                            <FilterSelect
                                value={filter}
                                options={FILTER_OPTIONS}
                                onChange={onFilterChange}
                            />
                            {!isVotesMode ? (
                                <SearchInputWrap>
                                    <Input
                                        inputSize="medium"
                                        placeholder="Search by token name or address"
                                        value={search}
                                        onChange={({ target }) => setSearch(target.value)}
                                        postfix={<Search />}
                                    />
                                </SearchInputWrap>
                            ) : null}
                        </Toolbar>
                    }
                />
            </MainSection>
        </PageContainer>
    );
};

export default AssetRegistryMainPage;
