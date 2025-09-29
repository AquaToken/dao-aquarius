import axios from 'axios';

import { LOBSTR_VAULT_API_URL } from 'constants/api';

export function sentToVault(xdr: string) {
    const headers = { 'Content-Type': 'application/json' };

    return axios.post(LOBSTR_VAULT_API_URL, JSON.stringify({ xdr }), { headers });
}
