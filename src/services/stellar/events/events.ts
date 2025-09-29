import * as StellarSdk from '@stellar/stellar-sdk';

export enum StellarEvents {
    accountStream = 'account stream',
    handleAccountUpdate = 'handle account update',
    claimableUpdate = 'claimable update',
    paymentsHistoryUpdate = 'payments history update',
}

export type StellarPayload = {
    account?: StellarSdk.Horizon.AccountResponse | StellarSdk.Horizon.ServerApi.AccountRecord;
};
