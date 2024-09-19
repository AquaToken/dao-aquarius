// =================================== CONSTANTS ===============================================

import { AQUA_NETWORK_URL } from './urls';

export const METADATA = {
    name: 'Aquarius',
    description: 'Aquarius - liquidity management layer for Stellar',
    url: AQUA_NETWORK_URL,
    icons: [`${AQUA_NETWORK_URL}/favicon.png`],
};

export const PUBNET = 'stellar:pubnet';

export const STELLAR_METHODS = {
    SIGN_AND_SUBMIT: 'stellar_signAndSubmitXDR',
    SIGN: 'stellar_signXDR',
};

export const REQUIRED_NAMESPACES = {
    stellar: {
        chains: [PUBNET],
        methods: Object.values(STELLAR_METHODS),
        events: [],
    },
};

export const INTERNET_CONNECTION_ERROR =
    'Make sure you are connected to the internet and try again.';
export const SESSION_TIMEOUT_ERROR = 'Session failed to settle after 300 seconds';
export const PAIRING_TIMEOUT_ERROR = 'Pairing failed to settle after 300 seconds';
export const CLIENT_TIMEOUT_MESSAGE = 'Connection timeout';
export const CONNECTION_REJECTED_MESSAGE = 'Connection cancelled by the user';
export const CONNECTION_TIMEOUT_ERROR =
    'Connection could not be established. Please try connecting again.';

export const CONNECTION_TIMEOUT = 60000;
