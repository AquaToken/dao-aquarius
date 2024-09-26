import * as StellarSdk from '@stellar/stellar-sdk';
import { Horizon } from '@stellar/stellar-sdk';

export type Asset = StellarSdk.Asset;

export type PoolClassic = Horizon.ServerApi.LiquidityPoolRecord;
export type PoolClassicReserves = Horizon.HorizonApi.Reserve;

export type ClaimableBalance = Horizon.ServerApi.ClaimableBalanceRecord & {
    last_modified_time?: string;
};

export type TransactionRecord = Horizon.ServerApi.TransactionRecord;

export type Transaction = StellarSdk.Transaction;

export type TxFailed = StellarSdk.Horizon.HorizonApi.ErrorResponseData.TransactionFailed;

export type Int128Parts = StellarSdk.xdr.Int128Parts;
