import * as StellarSdk from '@stellar/stellar-sdk';

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

    private loadNotes(payments) {
        chunkFunction<
            | (StellarSdk.Horizon.ServerApi.PaymentOperationRecord & { memo: string })
            | (StellarSdk.Horizon.ServerApi.InvokeHostFunctionOperationRecord & { memo: string }),
            void
        >(payments, payment =>
            payment.transaction().then(({ memo }) => {
                payment.memo = memo;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            }),
        );
    }

    private processPayments(payments) {
        const filtered = payments.filter(
            ({ from }) =>
                from === AMM_REWARDS_KEY || from === SDEX_REWARDS_KEY || from === BRIBE_REWARDS_KEY,
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
