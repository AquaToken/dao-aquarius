import * as StellarSdk from '@stellar/stellar-sdk';
import { FeeBumpTransaction, Memo, MemoType } from '@stellar/stellar-sdk';

import { TESTNET_DISTRIBUTION_AMOUNTS } from 'constants/assets';
import { ENV_TESTNET } from 'constants/env';
import { BASE_FEE } from 'constants/stellar';
import {
    DELEGATE_MARKER_KEY,
    MARKET_KEY_MARKER_DOWN,
    MARKET_KEY_MARKER_UP,
} from 'constants/stellar-accounts';

import { getAssetFromString } from 'helpers/assets';
import { getEnv, getNetworkPassphrase } from 'helpers/env';

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

    async createTestnetAssetsDistributeTx(
        account: AccountService,
    ): Promise<StellarSdk.Transaction> {
        if (getEnv() !== ENV_TESTNET) {
            throw new Error('Testnet faucet is testnet-only');
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const TESTNET_ASSETS_ISSUER_SECRET = process.variable.TESTNET_ASSETS_ISSUER_SECRET;

        const issuerKp = StellarSdk.Keypair.fromSecret(TESTNET_ASSETS_ISSUER_SECRET);
        const issuerPub = issuerKp.publicKey();

        const operations: StellarSdk.xdr.Operation[] = [];

        TESTNET_DISTRIBUTION_AMOUNTS.forEach(([assetString, amount]) => {
            const asset = getAssetFromString(assetString) as ClassicToken;

            // Add trustline (safe even if already exists)
            operations.push(
                StellarSdk.Operation.changeTrust({
                    asset,
                }),
            );

            // Send configured amount from issuer
            operations.push(
                StellarSdk.Operation.payment({
                    source: issuerPub,
                    destination: account.accountId(),
                    asset,
                    amount,
                }),
            );
        });

        const tx = await this.buildTx(account, operations);
        tx.sign(issuerKp);
        return tx;
    }
}
