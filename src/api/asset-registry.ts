import axios from 'axios';

import { getGovernanceUrl } from 'helpers/url';

import { RegistryAssetsResponse } from 'web/pages/asset-registry/pages/AssetRegistryMainPage/AssetRegistryMainPage.types';

export const getRegistryAssetsRequest = (): Promise<RegistryAssetsResponse> =>
    axios.get<RegistryAssetsResponse>(`${getGovernanceUrl()}/asset-tokens/`).then(({ data }) => data);
