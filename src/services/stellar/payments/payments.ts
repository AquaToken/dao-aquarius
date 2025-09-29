import * as StellarSdk from '@stellar/stellar-sdk';

import { getPoolInfo } from 'api/amm';

import { AMM_REWARDS_KEY, BRIBE_REWARDS_KEY, SDEX_REWARDS_KEY } from 'constants/stellar-accounts';

import chunkFunction from 'helpers/chunk-function';
import debounceFunction from 'helpers/debounce-function';

import EventService from 'services/event.service';
import { StellarEvents, StellarPayload } from 'services/stellar/events/events';
import Horizon from 'services/stellar/horizon/horizon';

export default class Payments {
    private readonly horizon: Horizon;
    private readonly event: EventService<StellarEvents, StellarPayload>;

    paymentsHistory = null;
    debouncedUpdatePayments: (accountId: string) => void;
    nextPayments = null;
    loadMorePaymentsPending = false;
    paymentsFullyLoaded = false;
    private poolsRewardsNoteCache = new Map<string, unknown>();

    constructor(horizon: Horizon, event: EventService<StellarEvents, StellarPayload>) {
        this.horizon = horizon;
        this.event = event;

        this.loadMorePayments = this.loadMorePayments.bind(this);
        this.updatePayments = this.updatePayments.bind(this);

        this.debouncedUpdatePayments = debounceFunction(this.updatePayments, 500);
    }

    getPayments(accountId: string, limit: number = 200) {
        if (this.paymentsHistory) {
            return;
        }
        this.horizon.server
            .payments()
            .forAccount(accountId)
            .order('desc')
            .limit(limit)
            .call()
            .then(({ next, records }) => {
                this.nextPayments = next;
                const processed = this.processPayments(records);

                if (!processed.length) {
                    return this.loadMorePayments();
                }

                this.paymentsHistory = processed;

                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            });
    }

    loadMorePayments() {
        if (this.loadMorePaymentsPending || this.paymentsFullyLoaded) {
            return;
        }

        this.loadMorePaymentsPending = true;

        this.nextPayments().then(({ next, records }) => {
            this.nextPayments = next;

            if (!records.length) {
                this.loadMorePaymentsPending = false;
                this.paymentsFullyLoaded = true;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
                return;
            }

            const processed = this.processPayments(records);

            if (!processed.length) {
                this.loadMorePaymentsPending = false;
                return this.loadMorePayments();
            }

            this.paymentsHistory = this.paymentsHistory
                ? [...this.paymentsHistory, ...processed]
                : processed;

            this.loadMorePaymentsPending = false;

            this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
        });
    }

    updatePayments(accountId: string) {
        if (!this.paymentsHistory?.length) {
            return;
        }

        this.horizon.server
            .payments()
            .forAccount(accountId)
            .order('desc')
            .limit(10)
            .call()
            .then(({ records }) => {
                const processed = this.processPayments(records);

                const firstHistoryId = this.paymentsHistory[0].id;

                const recordsFirstCommonIndex = processed.findIndex(
                    record => record.id === firstHistoryId,
                );

                this.paymentsHistory = [
                    ...processed.slice(0, recordsFirstCommonIndex),
                    ...this.paymentsHistory,
                ];

                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            });
    }

    private encodePaymentParameterValue(value: string) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return StellarSdk.xdr.ScVal.fromXDR(value, 'base64').value()?.toString?.();
    }

    private getClaimRewardsNote(payment) {
        const poolId = payment.asset_balance_changes[0].from;

        if (this.poolsRewardsNoteCache.has(poolId)) {
            payment.memo = this.poolsRewardsNoteCache.get(poolId);
            this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            return;
        }

        return getPoolInfo(poolId)
            .then(poolInfo => {
                const note = `Rewards for pool: ${poolInfo.tokens
                    .map(({ code }) => code)
                    .join('/')}`;
                this.poolsRewardsNoteCache.set(poolId, note);
                payment.memo = note;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            })
            .catch(() => {
                const note = 'Rewards for unknown pool';
                this.poolsRewardsNoteCache.set(poolId, note);
                payment.memo = note;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            });
    }

    private loadNotes(payments) {
        chunkFunction<
            | (StellarSdk.Horizon.ServerApi.PaymentOperationRecord & { memo: string })
            | (StellarSdk.Horizon.ServerApi.InvokeHostFunctionOperationRecord & { memo: string }),
            void
        >(payments, payment => {
            if (
                payment.type === 'invoke_host_function' &&
                this.isPaymentCalledMethod(payment.parameters, 'claim')
            ) {
                return this.getClaimRewardsNote(payment);
            }

            if (
                payment.type === 'invoke_host_function' &&
                this.isPaymentCalledMethod(payment.parameters, 'batch')
            ) {
                if (
                    payment.parameters.some(({ value }) => {
                        const parsed = StellarSdk.scValToNative(
                            StellarSdk.xdr.ScVal.fromXDR(value, 'base64'),
                        );

                        if (!Array.isArray(parsed)) return false;

                        return parsed.some(arr => arr.includes('withdraw'));
                    })
                ) {
                    return this.getClaimRewardsNote(payment);
                }
                payment.memo = `For ${payment.asset_balance_changes.length} pools`;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
                return;
            }
            return payment.transaction().then(({ memo }) => {
                payment.memo = memo;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            });
        });
    }

    private isPaymentCalledMethod(
        parameters: { value: string; type: string }[],
        methodName: string,
    ): boolean {
        return parameters.some(
            ({ type, value }) =>
                type === 'Sym' && this.encodePaymentParameterValue(value) === methodName,
        );
    }

    private processPayments(payments) {
        const filtered = payments.filter(
            ({ from, type, parameters }) =>
                from === AMM_REWARDS_KEY ||
                from === SDEX_REWARDS_KEY ||
                from === BRIBE_REWARDS_KEY ||
                (type === 'invoke_host_function' &&
                    this.isPaymentCalledMethod(parameters, 'claim')) ||
                (type === 'invoke_host_function' &&
                    this.isPaymentCalledMethod(parameters, 'batch')),
        );

        this.loadNotes(filtered);

        return filtered.map(payment => {
            switch (true) {
                case payment.from === AMM_REWARDS_KEY:
                    payment.title = 'AMM Reward';
                    break;
                case payment.from === SDEX_REWARDS_KEY:
                    payment.title = 'SDEX Reward';
                    break;
                case payment.from === BRIBE_REWARDS_KEY:
                    payment.title = 'Bribe Reward';
                    break;

                case payment.type === 'invoke_host_function' &&
                    this.isPaymentCalledMethod(payment.parameters, 'claim'):
                    payment.title = 'Claim Reward';
                    payment.amount = payment.asset_balance_changes[0].amount;
                    break;
                case payment.type === 'invoke_host_function' &&
                    this.isPaymentCalledMethod(payment.parameters, 'batch'):
                    if (
                        payment.parameters.some(({ value }) => {
                            const parsed = StellarSdk.scValToNative(
                                StellarSdk.xdr.ScVal.fromXDR(value, 'base64'),
                            );

                            if (!Array.isArray(parsed)) return false;

                            return parsed.some(arr => arr.includes('withdraw'));
                        })
                    ) {
                        payment.title = 'Claim Reward';
                        payment.amount =
                            payment.asset_balance_changes[
                                payment.asset_balance_changes.length - 1
                            ].amount;
                        break;
                    }
                    payment.title = 'Claim Rewards';
                    payment.amount = payment.asset_balance_changes.reduce((acc, item) => {
                        acc += Number(item.amount);
                        return acc;
                    }, 0);
                    break;
            }
            return payment;
        });
    }

    clearPayments() {
        this.paymentsFullyLoaded = false;
        this.paymentsHistory = null;
        this.nextPayments = null;
    }
}
