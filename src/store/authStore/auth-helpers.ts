import { LS_LAST_AUTH_DATA } from 'constants/local-storage';

import { LoginTypes, SavedAuthData } from 'store/authStore/types';

export function saveToLS(pubKey: string, loginType: LoginTypes, walletKitId = '') {
    const stringified = JSON.stringify({ pubKey, loginType, walletKitId });
    localStorage.setItem(LS_LAST_AUTH_DATA, stringified);
}

export function clearSavedAuthData() {
    localStorage.removeItem(LS_LAST_AUTH_DATA);
}

export function getSavedAuthData(): SavedAuthData {
    return JSON.parse(localStorage.getItem(LS_LAST_AUTH_DATA)) || {};
}
