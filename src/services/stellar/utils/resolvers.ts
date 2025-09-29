import * as StellarSdk from '@stellar/stellar-sdk';
import axios from 'axios';

import { StellarToml } from 'types/stellar';

export function resolveToml(homeDomain: string): Promise<StellarToml> {
    return StellarSdk.StellarToml.Resolver.resolve(homeDomain);
}

export async function getFederation(homeDomain: string, accountId: string): Promise<string> {
    const toml = await resolveToml(homeDomain);
    if (!toml.FEDERATION_SERVER) {
        throw new Error('Federation server not exists');
    }
    const server = toml.FEDERATION_SERVER;

    const params = new URLSearchParams();
    params.append('q', accountId);
    params.append('type', 'id');
    const result = await axios.get<{ stellar_address: string }>(server, { params });

    return result.data?.stellar_address;
}
