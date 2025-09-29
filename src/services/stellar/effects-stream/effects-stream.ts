import * as StellarSdk from '@stellar/stellar-sdk';

import { formatBalance } from 'helpers/format-number';

import EventService from 'services/event.service';
import { ToastService } from 'services/globalServices';
import ClaimableBalances from 'services/stellar/claimable-balances/claimable-balances';
import { StellarEvents, StellarPayload } from 'services/stellar/events/events';
import Horizon from 'services/stellar/horizon/horizon';
import Payments from 'services/stellar/payments/payments';

export default class EffectsStream {
    private readonly horizon: Horizon;
    private readonly event: EventService<StellarEvents, StellarPayload>;
    private readonly cb: ClaimableBalances;
    private readonly payments: Payments;

    closeEffectsStream: () => void | null = null;

    constructor(
        horizon: Horizon,
        event: EventService<StellarEvents, StellarPayload>,
        cb: ClaimableBalances,
        payments: Payments,
    ) {
        this.horizon = horizon;
        this.event = event;
        this.cb = cb;
        this.payments = payments;
    }

    start(publicKey: string) {
        this.cb.getClaimableBalances(publicKey);

        this.closeEffectsStream = this.horizon.server
            .effects()
            .forAccount(publicKey)
            .cursor('now')
            .stream({
                onmessage: (res: StellarSdk.Horizon.ServerApi.EffectRecord) => {
                    if (
                        res.type === 'claimable_balance_sponsorship_created' ||
                        res.type === 'claimable_balance_sponsorship_removed' ||
                        res.type === 'claimable_balance_sponsorship_updated' ||
                        res.type === 'claimable_balance_created' ||
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        res.type === 'claimable_balance_claimant_created'
                    ) {
                        this.cb.getClaimableBalances(publicKey);
                    }
                    if (
                        (res as unknown as StellarSdk.Horizon.ServerApi.EffectRecord).type ===
                        'account_debited'
                    ) {
                        const { amount, asset_type, asset_code } = res as unknown as {
                            amount: string;
                            asset_type: string;
                            asset_code: string;
                        };

                        ToastService.showSuccessToast(
                            `Payment sent: ${formatBalance(Number(amount))} ${
                                asset_type === 'native' ? 'XLM' : asset_code
                            }`,
                        );
                    }

                    if (
                        (res as unknown as StellarSdk.Horizon.ServerApi.EffectRecord).type ===
                        'account_credited'
                    ) {
                        this.payments.debouncedUpdatePayments(publicKey);
                        const { amount, asset_type, asset_code } = res as unknown as {
                            amount: string;
                            asset_type: string;
                            asset_code: string;
                        };

                        if (!Number(amount)) {
                            return;
                        }

                        ToastService.showSuccessToast(
                            `Payment received: ${formatBalance(Number(amount))} ${
                                asset_type === 'native' ? 'XLM' : asset_code
                            }`,
                        );
                    }
                },
            });
    }

    stop(): void {
        if (this.closeEffectsStream) {
            this.closeEffectsStream();
            this.cb.clearClaimableBalances();
            this.payments.clearPayments();
            this.event.trigger({ type: StellarEvents.claimableUpdate });
        }
    }
}
