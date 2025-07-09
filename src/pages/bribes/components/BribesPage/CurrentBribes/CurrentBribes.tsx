import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { MarketRoutes } from 'constants/routes';

import { getAssetString } from 'helpers/assets';
import { convertLocalDateToUTCIgnoringTimezone, getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { ModalService, StellarService } from 'services/globalServices';

import PageLoader from 'web/basics/loaders/PageLoader';
import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import Asset from 'basics/Asset';
import AssetLogo from 'basics/AssetLogo';
import Market from 'basics/Market';
import Pagination from 'basics/Pagination';
import Table from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { getPairsWithBribes } from 'pages/vote/api/api';
import BribesModal from 'pages/vote/components/MainPage/BribesModal/BribesModal';

const Container = styled.div``;

const LoaderContainer = styled.div`
    ${flexAllCenter};
    margin: 5rem 0;
`;

const Apy = styled.span`
    border-bottom: 0.1rem dashed ${COLORS.purple};
    line-height: 2rem;
`;

const PAGE_SIZE = 20;

const CurrentBribes = () => {
    const [bribes, setBribes] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pending, setPending] = useState(true);

    const history = useHistory();

    const { processNewAssets } = useAssetsStore();

    const processAssets = bribes => {
        const assets = bribes.reduce((acc, item) => {
            const rewardAssets = item.aggregated_bribes.map(agr =>
                StellarService.createAsset(agr.asset_code, agr.asset_issuer),
            );
            return [
                ...acc,
                { code: item.asset1_code, issuer: item.asset1_issuer },
                { code: item.asset2_code, issuer: item.asset2_issuer },
                ...rewardAssets,
            ];
        }, []);

        processNewAssets(assets);
    };

    const goToMarketPage = (asset1, asset2) => {
        history.push(`${MarketRoutes.main}/${getAssetString(asset1)}/${getAssetString(asset2)}`);
    };

    useEffect(() => {
        setPending(true);
        getPairsWithBribes(PAGE_SIZE, page).then(res => {
            setBribes(res.pairs);
            setTotal(res.count);
            processAssets(res.pairs);
            setPending(false);
        });
    }, [page]);

    if (!bribes) {
        return (
            <LoaderContainer>
                <PageLoader />
            </LoaderContainer>
        );
    }

    return (
        <Container>
            <Table
                pending={pending}
                head={[
                    { children: 'Market', flexSize: 3 },
                    { children: 'Bribes APY' },
                    { children: 'Reward assets' },
                    { children: 'Rewards per day(AQUA)' },
                    { children: 'Period' },
                ]}
                body={bribes.map(bribe => {
                    const startUTC = convertLocalDateToUTCIgnoringTimezone(
                        new Date(bribe.aggregated_bribes[0].start_at),
                    );
                    const stopUTC = convertLocalDateToUTCIgnoringTimezone(
                        new Date(bribe.aggregated_bribes[0].stop_at),
                    );
                    const base = StellarService.createAsset(bribe.asset1_code, bribe.asset1_issuer);
                    const counter = StellarService.createAsset(
                        bribe.asset2_code,
                        bribe.asset2_issuer,
                    );

                    const { sum, rewardAssets } = bribe.aggregated_bribes.reduce(
                        (acc, bribe) => {
                            acc.sum += Number(bribe.daily_aqua_equivalent);
                            acc.rewardAssets.push(
                                StellarService.createAsset(bribe.asset_code, bribe.asset_issuer),
                            );
                            return acc;
                        },
                        { sum: 0, rewardAssets: [] },
                    );

                    const apy = (sum / Number(bribe.upvote_value) + 1) ** 365 - 1;

                    return {
                        onRowClick: () => goToMarketPage(base, counter),
                        key: bribe.account_id,
                        rowItems: [
                            {
                                flexSize: 3,
                                children: (
                                    <Market
                                        assets={[base, counter]}
                                        mobileVerticalDirections
                                        withoutLink
                                    />
                                ),
                            },
                            {
                                children: (
                                    <Apy
                                        onClick={e => {
                                            e.stopPropagation();
                                            ModalService.openModal(BribesModal, { pair: bribe });
                                        }}
                                    >
                                        {formatBalance(+(apy * 100).toFixed(2), true)}%
                                    </Apy>
                                ),
                                label: 'Bribe APY:',
                            },
                            {
                                children: (
                                    <>
                                        {rewardAssets.map(rewardAsset => (
                                            <Tooltip
                                                key={getAssetString(rewardAsset)}
                                                content={<Asset asset={rewardAsset} inRow />}
                                                position={TOOLTIP_POSITION.top}
                                                background={COLORS.white}
                                                showOnHover
                                            >
                                                <AssetLogo asset={rewardAsset} />
                                            </Tooltip>
                                        ))}
                                    </>
                                ),
                                label: 'Reward assets:',
                            },
                            {
                                children: `${formatBalance(sum, true)} AQUA`,
                                label: 'Rewards per day(AQUA)',
                            },
                            {
                                children: `${getDateString(startUTC.getTime(), {
                                    withoutYear: true,
                                })} - ${getDateString(stopUTC.getTime() - 1)}`,
                                label: 'Period:',
                            },
                        ],
                    };
                })}
            />
            <Pagination
                pageSize={PAGE_SIZE}
                totalCount={total}
                onPageChange={setPage}
                currentPage={page}
                itemName="bribes"
            />
        </Container>
    );
};

export default CurrentBribes;
