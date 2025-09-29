import * as WalletConnectTypes from '@walletconnect/types';

export enum AuthEvent {
    ledgerLogin = 'ledger-login',
    ledgerLogout = 'ledger-logout',
    walletConnectLogin = 'wallet-connect-login',
    walletConnectLogout = 'wallet-connect-logout',
    lobstrExtensionLogin = 'lobstr-extension-login',
    walletKitLogin = 'wallet-kit-login',
    walletKitLogout = 'wallet-kit-logout',
    walletKitAccountChanged = 'wallet-kit-account-changed',
}

export type AuthPayload = {
    publicKey?: string;
    bipPath?: number;
    metadata?: WalletConnectTypes.CoreTypes.Metadata;
    topic?: string;
    id?: string;
};
