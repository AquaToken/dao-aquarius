import * as StellarSdk from '@stellar/stellar-sdk';
import axios from 'axios';

import { ALL_ICE_ASSETS } from 'constants/assets';

import { getAssetString } from 'helpers/assets';
import { getNetworkPassphrase } from 'helpers/env';
import { getIceApproveEndpoint } from 'helpers/ice';

import { ClassicToken } from 'types/token';

export const processIceTx = async (
    tx: StellarSdk.Transaction,
    asset: ClassicToken,
): Promise<StellarSdk.Transaction> => {
    if (!ALL_ICE_ASSETS.includes(getAssetString(asset))) {
        return tx;
    }

    const endpoint = getIceApproveEndpoint(asset);

    const { data } = await axios.post<{ status: string; tx: string }>(endpoint, {
        tx: tx.toEnvelope().toXDR('base64'),
    });

    if (data.status !== 'revised') {
        throw new Error('Incorrect status');
    }
    return new StellarSdk.Transaction(data.tx, getNetworkPassphrase());
};
