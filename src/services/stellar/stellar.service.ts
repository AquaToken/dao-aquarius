import EventService from 'services/event.service';
import Account from 'services/stellar/account/account';
import ClaimableBalances from 'services/stellar/claimable-balances/claimable-balances';
import EffectsStream from 'services/stellar/effects-stream/effects-stream';
import { StellarEvents, StellarPayload } from 'services/stellar/events/events';
import Horizon from 'services/stellar/horizon/horizon';
import Operation from 'services/stellar/operation/operation';
import Payments from 'services/stellar/payments/payments';
import Price from 'services/stellar/price/price';
import Transaction from 'services/stellar/transaction/transaction';

export default class StellarServiceClass {
    horizon: Horizon;
    account: Account;
    event: EventService<StellarEvents, StellarPayload> = new EventService();
    tx: Transaction;
    op: Operation;
    price: Price;
    cb: ClaimableBalances;
    payments: Payments;
    effectsStream: EffectsStream;

    constructor() {
        this.horizon = new Horizon();

        this.account = new Account(this.horizon, this.event);

        this.op = new Operation();

        this.tx = new Transaction(this.horizon, this.account, this.event, this.op);

        this.price = new Price(this.horizon);

        this.cb = new ClaimableBalances(this.horizon, this.event);

        this.payments = new Payments(this.horizon, this.event);

        this.effectsStream = new EffectsStream(this.horizon, this.event, this.cb, this.payments);
    }
}
