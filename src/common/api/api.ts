import { Asset } from '@stellar/stellar-sdk';
import axios from 'axios';
import { AssetDetails } from './types';

const STELLAR_EXPERT_API_URL = 'https://api.stellar.expert/';
export const getAssetDetails = (asset: Asset): Promise<AssetDetails> => {
    return axios
        .get<{ _embedded: { records: AssetDetails[] } }>(
            `${STELLAR_EXPERT_API_URL}explorer/public/asset?search=${asset.issuer}`,
        )
        .then(({ data }) => {
            return data._embedded.records.find((details) => {
                const [code, issuer] = details.asset.split('-');
                return code === asset.code && issuer === asset.issuer;
            });
        });
};
