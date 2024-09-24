// Constants
const WC_CURRENT_WALLET_ALIAS = 'WC_APP';
const WC_DEEP_LINK_HISTORY_ALIAS = 'WC_DEEP_LINK_APPS';
const WC_INDEXED_DB_ALIAS = 'WALLET_CONNECT_V2_INDEXED_DB';
const WC_SESSION_ALIAS = 'wc@2:client:0.3:session';
const WC_STORE_NAME = 'keyvaluestorage';

const hasWalletConnectDB = async (): Promise<boolean> => {
    try {
        const databases = await indexedDB.databases();
        return databases.some(({ name }) => name === WC_INDEXED_DB_ALIAS);
    } catch {
        return false;
    }
};

const openWalletConnectDB = async (): Promise<IDBDatabase> => {
    const hasDB = await hasWalletConnectDB();

    if (!hasDB) {
        return Promise.reject();
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(WC_INDEXED_DB_ALIAS, 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject();
    });
};

const getFromWalletConnectDB = async (key: string): Promise<any> => {
    try {
        const db = await openWalletConnectDB();

        const store = db.transaction(WC_STORE_NAME, 'readonly').objectStore(WC_STORE_NAME);

        return new Promise((resolve) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    } catch {
        return null;
    }
};

// Checking whether there is a saved session in the WalletConnect storage before client initialization
export const sessionExistsInStorage = async (): Promise<boolean> => {
    const sessionList = JSON.parse(await getFromWalletConnectDB(WC_SESSION_ALIAS)) || [];

    return Boolean(sessionList.length);
};

function getLocalStorage(): Storage | undefined {
    let res: Storage | undefined = undefined;
    if (typeof window !== 'undefined' && typeof window['localStorage'] !== 'undefined') {
        res = window['localStorage'];
    }
    return res;
}

// Deep Link functional
// Save wallet data connected via Deep Link
export const saveCurrentWallet = (name, uri) => {
    const focusUri = uri.split('?')[0];
    const LS = getLocalStorage();
    if (LS) {
        LS.setItem(
            WC_CURRENT_WALLET_ALIAS,
            JSON.stringify({
                name,
                uri: focusUri,
            }),
        );
    }
};

// Deep Link functional
// Get wallet data connected via Deep Link if exists
export const getCurrentWallet = () => {
    const LS = getLocalStorage();
    if (!LS) {
        return null;
    }
    return JSON.parse(LS.getItem(WC_CURRENT_WALLET_ALIAS) || 'null');
};

// Deep Link functional
// Clear wallet data
export const clearCurrentWallet = () => {
    const LS = getLocalStorage();
    if (LS) {
        LS.removeItem(WC_CURRENT_WALLET_ALIAS);
    }
};

// Deep Link functional
// The method used during confirming the transaction. If there is a saved wallet, open it.
export const openCurrentWalletIfExist = () => {
    const currentWallet = getCurrentWallet();
    if (currentWallet) {
        window.open(currentWallet.uri, '_blank');
    }
};

// Deep Link functional
// Get connection history by deep link.
// The history is saved as js Map, where is the key is the pairingId, the value is the wallet data
const getDeepLinkHistory = () => {
    const LS = getLocalStorage();
    if (!LS) {
        return new Map();
    }

    return new Map(JSON.parse(LS.getItem(WC_DEEP_LINK_HISTORY_ALIAS) || '[]'));
};

// Deep Link functional
// Set connection history by deep link.
const setDeepLinkHistory = (list) => {
    const LS = getLocalStorage();
    if (!LS) {
        return;
    }

    LS.setItem(WC_DEEP_LINK_HISTORY_ALIAS, JSON.stringify(Array.from(list.entries())));
};

// Deep Link functional
// If there is the current wallet, we save the new item to the history
export const savePairingToDeepLinkHistory = (topic: string) => {
    const currentWallet = getCurrentWallet();

    if (!currentWallet) {
        return;
    }
    const history = getDeepLinkHistory();
    history.set(topic, JSON.stringify(currentWallet));
    setDeepLinkHistory(history);
};

// Deep Link functional
// Get the wallet data from the history by the pairing id
export const getWalletFromDeepLinkHistory = (topic) => {
    const history = getDeepLinkHistory();

    return history.has(topic) ? JSON.parse(history.get(topic)) : null;
};

// Method for sending the URI to the wallet using custom postMessage if the dapp is open in the WebView
// It is used for the functionality of auto-connection with the LOBSTR wallet
export const sendUriToWalletWebView = (URI) => {
    const stringify = JSON.stringify(URI);

    try {
        // IOS
        // @ts-ignore
        if (window.webkit) {
            // @ts-ignore
            window.webkit.messageHandlers.submitToiOS.postMessage(stringify);
        }

        // android
        // @ts-ignore
        if (window.android) {
            // @ts-ignore
            window.android.postMessage(stringify);
        }

        // web logger
        console.log(stringify);
    } catch (e) {
        // do nothing
    }
};
