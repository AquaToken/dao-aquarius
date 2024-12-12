import axios from 'axios';

import { API_URL_STELLAR_EXPERT } from 'constants/api';

import type { ExpertAssetData } from 'types/api-stellar-expert';
import { Asset } from 'types/stellar';

export const getAssetDetails = (asset: Asset): Promise<ExpertAssetData> =>
    axios
        .get<{ _embedded: { records: ExpertAssetData[] } }>(
            `${API_URL_STELLAR_EXPERT}explorer/public/asset?search=${asset.issuer ?? 'XLM'}`,
        )
        .then(({ data }) =>
            data._embedded.records.find(details => {
                const [code, issuer] = details.asset.split('-');
                return code === asset.code && issuer === asset.issuer;
            }),
        );
