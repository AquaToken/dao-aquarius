import { Asset } from '@stellar/stellar-sdk';
import axios from 'axios';

import { STELLAR_EXPERT_API_URL } from 'constants/urls';

import type { ExpertAssetData } from 'types/api-stellar-expert';

export const getAssetDetails = (asset: Asset): Promise<ExpertAssetData> =>
    axios
        .get<{ _embedded: { records: ExpertAssetData[] } }>(
            `${STELLAR_EXPERT_API_URL}explorer/public/asset?search=${asset.issuer}`,
        )
        .then(({ data }) =>
            data._embedded.records.find(details => {
                const [code, issuer] = details.asset.split('-');
                return code === asset.code && issuer === asset.issuer;
            }),
        );
