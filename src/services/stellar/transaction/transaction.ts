import * as StellarSdk from '@stellar/stellar-sdk';
import { FeeBumpTransaction, Memo, MemoType } from '@stellar/stellar-sdk';

import { BASE_FEE } from 'constants/stellar';
import {
    DELEGATE_MARKER_KEY,
    MARKET_KEY_MARKER_DOWN,
    MARKET_KEY_MARKER_UP,
} from 'constants/stellar-accounts';

import { getNetworkPassphrase } from 'helpers/env';

import AccountService from 'services/account.service';
import EventService from 'services/event.service';
import Account from 'services/stellar/account/account';
import { StellarEvents, StellarPayload } from 'services/stellar/events/events';
import Horizon from 'services/stellar/horizon/horizon';
import Operation from 'services/stellar/operation/operation';

import { ClassicToken } from 'types/token';

export default class Transaction {
    private readonly horizon: Horizon;
    private readonly account: Account;
    private readonly event: EventService<StellarEvents, StellarPayload>;
    private readonly op: Operation;

    constructor(
        horizon: Horizon,
        account: Account,
        event: EventService<StellarEvents, StellarPayload>,
        op: Operation,
    ) {
        this.horizon = horizon;
        this.account = account;
        this.event = event;
        this.op = op;
    }

    async buildTx(
        account: StellarSdk.Account,
        operations: StellarSdk.xdr.Operation | StellarSdk.xdr.Operation[],
        memo?: StellarSdk.Memo,
    ) {
        const newAccount = await this.account.loadAccount(account.accountId());

        this.event.trigger({ type: StellarEvents.handleAccountUpdate, account: newAccount });

        const tx = new StellarSdk.TransactionBuilder(newAccount, {
            fee: BASE_FEE,
            networkPassphrase: getNetworkPassphrase(),
        }).setTimeout(StellarSdk.TimeoutInfinite);

        if (Array.isArray(operations)) {
            operations.forEach(op => {
                tx.addOperation(op);
            });
        } else {
            tx.addOperation(operations);
        }

        if (memo) {
            tx.addMemo(memo);
        }

        return tx.build();
    }

    buildTxFromXdr(
        xdr: string,
    ): StellarSdk.Transaction<Memo<MemoType>, StellarSdk.Operation[]> | FeeBumpTransaction {
        return StellarSdk.TransactionBuilder.fromXDR(xdr, getNetworkPassphrase());
    }

    createMemo(type: MemoType, value): Memo {
        return new StellarSdk.Memo(type, value);
    }

    submitTx(tx: StellarSdk.Transaction) {
        return this.horizon.server.submitTransaction(tx);
    }

    async createMarketKeyTx(
        sourceAccountId: string,
        asset1: ClassicToken,
        asset2: ClassicToken,
        totalAmount: number,
    ) {
        const updatedAccount = await this.account.loadAccount(sourceAccountId);
        const marketKeyUp = StellarSdk.Keypair.random();
        const marketKeyDown = StellarSdk.Keypair.random();

        const transactionBuilder = new StellarSdk.TransactionBuilder(updatedAccount, {
            fee: BASE_FEE,
            networkPassphrase: getNetworkPassphrase(),
        });

        this.op.getCreateMarketKeyOps(
            transactionBuilder,
            marketKeyUp.publicKey(),
            asset1,
            asset2,
            totalAmount / 2,
            MARKET_KEY_MARKER_UP,
        );
        this.op.getCreateMarketKeyOps(
            transactionBuilder,
            marketKeyDown.publicKey(),
            asset1,
            asset2,
            totalAmount / 2,
            MARKET_KEY_MARKER_DOWN,
        );

        transactionBuilder.setTimeout(StellarSdk.TimeoutInfinite);

        const transaction = transactionBuilder.build();

        transaction.sign(marketKeyUp);
        transaction.sign(marketKeyDown);

        return transaction;
    }

    createDelegateTx(
        account: AccountService,
        token: ClassicToken,
        delegateDestination: string,
        amount: string,
    ) {
        return this.buildTx(
            account,
            StellarSdk.Operation.createClaimableBalance({
                source: account.accountId(),
                amount: amount.toString(),
                asset: token,
                claimants: [
                    new StellarSdk.Claimant(
                        account.accountId(),
                        StellarSdk.Claimant.predicateNot(
                            StellarSdk.Claimant.predicateBeforeAbsoluteTime(
                                ((Date.now() + 25 * 60 * 60 * 1000) / 1000).toFixed(), // 25 hours
                            ),
                        ),
                    ),
                    new StellarSdk.Claimant(
                        delegateDestination,
                        StellarSdk.Claimant.predicateNot(
                            StellarSdk.Claimant.predicateUnconditional(),
                        ),
                    ),
                    new StellarSdk.Claimant(
                        DELEGATE_MARKER_KEY,
                        StellarSdk.Claimant.predicateNot(
                            StellarSdk.Claimant.predicateUnconditional(),
                        ),
                    ),
                ],
            }),
        );
    }
}
