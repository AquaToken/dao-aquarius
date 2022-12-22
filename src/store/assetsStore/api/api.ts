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

export const getAssetsInfo = (assets) => {
    const params = new URLSearchParams();

    assets.forEach((asset) => {
        params.append('asset', `${asset.code}:${asset.issuer}`);
    });

    return axios
        .get<ListResponse<Asset[]>>(assetsInfoUrl, { params })
        .then(({ data }) => data.results);
};
