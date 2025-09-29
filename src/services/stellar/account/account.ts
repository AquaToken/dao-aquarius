import * as StellarSdk from '@stellar/stellar-sdk';
import { OperationOptions } from '@stellar/stellar-sdk';

import { OP_THRESHOLDS, THRESHOLD_ORDER, THRESHOLDS } from 'constants/stellar';

import { getAquaAssetData } from 'helpers/assets';

import EventService from 'services/event.service';
import { StellarEvents, StellarPayload } from 'services/stellar/events/events';
import Horizon from 'services/stellar/horizon/horizon';

export default class Account {
    private readonly horizon: Horizon;
    private readonly event: EventService<StellarEvents, StellarPayload>;
    private closeStream: () => void | null = null;

    constructor(horizon: Horizon, event: EventService<StellarEvents, StellarPayload>) {
        this.horizon = horizon;
        this.event = event;
    }

    loadAccount(publicKey: string): Promise<StellarSdk.Horizon.AccountResponse> {
        return this.horizon.server.loadAccount(publicKey);
    }

    startAccountStream(publicKey: string): void {
        this.closeStream = this.horizon.server
            .accounts()
            .accountId(publicKey)
            .cursor('now')
            .stream({
                onmessage: result => {
                    this.event.trigger({ type: StellarEvents.accountStream, account: result });
                },
            });
    }

    closeAccountStream(): void {
        if (this.closeStream) {
            this.closeStream();
        }
    }

    balancesHasChanges(
        prevBalances: StellarSdk.Horizon.HorizonApi.BalanceLineAsset[],
        newBalances: StellarSdk.Horizon.HorizonApi.BalanceLineAsset[],
    ): boolean {
        if (prevBalances.length !== newBalances.length) {
            return true;
        }

        return prevBalances.reduce((acc, balance) => {
            if (acc) {
                return acc;
            }
            const hasNewEqualBalance = newBalances.find(
                newBalance =>
                    newBalance.asset_code === balance.asset_code &&
                    newBalance.asset_issuer === balance.asset_issuer &&
                    newBalance.balance === balance.balance &&
                    newBalance.buying_liabilities === balance.buying_liabilities &&
                    newBalance.selling_liabilities === balance.selling_liabilities,
            );
            return hasNewEqualBalance ? acc : true;
        }, false);
    }

    isMoreSignaturesNeeded(
        tx: StellarSdk.Transaction,
        account: Partial<StellarSdk.Horizon.AccountResponse>,
    ) {
        const { operations } = tx;

        const transactionThreshold = operations.reduce((acc, operation) => {
            const { type } = operation;

            let usedThreshold = Object.keys(OP_THRESHOLDS).reduce(
                (used, threshold) => {
                    if (OP_THRESHOLDS[threshold].includes(type)) {
                        return threshold;
                    }
                    return used;
                },
                [THRESHOLDS.UNKNOWN],
            );

            if (usedThreshold === THRESHOLDS.UNKNOWN) {
                throw new Error('unknown operation');
            }

            if (usedThreshold === THRESHOLDS.MULTIPLE) {
                const { masterWeight, lowThreshold, medThreshold, highThreshold, signer } =
                    operation as OperationOptions.SetOptions;
                usedThreshold =
                    masterWeight || lowThreshold || medThreshold || highThreshold || signer
                        ? THRESHOLDS.HIGH
                        : THRESHOLDS.MED;
            }

            return THRESHOLD_ORDER[usedThreshold as THRESHOLDS] > THRESHOLD_ORDER[acc]
                ? usedThreshold
                : acc;
        }, THRESHOLDS.LOW);

        const masterKeyWeight = account.signers.find(
            signer => signer.key === account.account_id,
        ).weight;

        return (
            masterKeyWeight <
            account.thresholds[
                transactionThreshold as keyof StellarSdk.Horizon.HorizonApi.AccountThresholds
            ]
        );
    }

    async getAccountOffers(publicKey: string): Promise<StellarSdk.Horizon.ServerApi.OfferRecord[]> {
        const OFFERS_LIMIT = 200;
        const { records, next } = await this.horizon.server
            .offers()
            .forAccount(publicKey)
            .order('desc')
            .limit(OFFERS_LIMIT)
            .call();

        if (records.length === OFFERS_LIMIT) {
            return this.horizon.nextRequest(records, next, OFFERS_LIMIT);
        }

        return Promise.resolve(records);
    }

    async getLiquidityPoolForAccount(
        id: string,
        limit: number,
    ): Promise<StellarSdk.Horizon.ServerApi.LiquidityPoolRecord[]> {
        const { records, next } = await this.horizon.server
            .liquidityPools()
            .forAccount(id)
            .limit(limit)
            .call();

        if (records.length === limit) {
            return this.horizon.nextRequest(records, next, limit);
        }

        return Promise.resolve(records);
    }

    // TODO: remove this after locker renew
    async getAccountLocks(publicKey: string) {
        const LOCKS_LIMIT = 200;
        const { aquaAssetString } = getAquaAssetData();

        const { records, next } = await this.horizon.server
            .claimableBalances()
            .sponsor(publicKey)
            .order('desc')
            .limit(LOCKS_LIMIT)
            .call();

        const claims =
            records.length === LOCKS_LIMIT
                ? await this.horizon.nextRequest(records, next, LOCKS_LIMIT)
                : records;

        return claims.filter(
            claim =>
                claim.claimants.length === 1 &&
                claim.claimants[0].destination === publicKey &&
                claim.asset === aquaAssetString,
        );
    }
}
