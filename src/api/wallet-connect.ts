import axios from 'axios';

import { Listings } from 'types/wallet-connect';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const registryUrl = `https://explorer-api.walletconnect.com/v3/wallets?projectId=${process.variable.WALLET_CONNECT_PROJECT_ID}`;

const WALLETS_PRIORITY = {
    'lobstr wallet': 1,
    freighter: 2,
};

export const getWalletsList = () =>
    axios.get<{ listings: Listings }>(registryUrl).then(({ data }) =>
        Object.values(data.listings)
            .filter(
                wallet => wallet.versions.includes('2') && wallet.chains.includes('stellar:pubnet'),
            )
            .sort((a, b) => {
                const pa = WALLETS_PRIORITY[a.name.toLowerCase()] || 99;
                const pb = WALLETS_PRIORITY[b.name.toLowerCase()] || 99;
                return pa - pb;
            }),
    );
