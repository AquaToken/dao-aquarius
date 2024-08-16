import axios from 'axios';
import { ListResponse } from '../../../pages/vote/api/types';
import { Asset } from '../types';

const assetsListUrl = 'https://fed.stellarterm.com/issuer_orgs/';
const assetsInfoUrl = 'https://assets.aqua.network/api/v1/assets/';

export const getAssetsRequest = () => {
    return axios.get<{ issuer_orgs: any[] }>(assetsListUrl).then(({ data }) => {
        const issuerOrgs = data.issuer_orgs;

        return issuerOrgs.reduce((acc, anchor) => {
            anchor.assets.forEach((asset) => {
                if (!asset.disabled && !anchor.disabled && !asset.unlisted) {
                    acc.push(asset);
                }
            });

            return acc;
        }, []);
    });
};

export const getAssetsInfo = async (
    assets: Array<{ code: string; issuer: string }>,
    batchSize: number = 100,
): Promise<Asset[]> => {
    // Function to fetch a batch of assets
    const fetchBatch = async (batch: Array<{ code: string; issuer: string }>) => {
        const params = new URLSearchParams();
        batch.forEach((asset) => params.append('asset', `${asset.code}:${asset.issuer}`));

        const { data } = await axios.get<ListResponse<Asset>>(assetsInfoUrl, { params });
        return data.results;
    };

    // Split assets into batches and fetch all batches concurrently
    const results = await Promise.all(
        assets
            .reduce((batches, _, i) => {
                if (i % batchSize === 0) batches.push([]);
                batches[batches.length - 1].push(assets[i]);
                return batches;
            }, [] as Array<Array<{ code: string; issuer: string }>>)
            .map(fetchBatch),
    );

    // Combine the results into a single array
    return results.flat();
};
