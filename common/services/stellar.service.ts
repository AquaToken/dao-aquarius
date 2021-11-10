import * as StellarSdk from 'stellar-sdk';
import EventService from './event.service';
import { Horizon } from 'stellar-sdk/lib/horizon_api';
import { Memo, MemoType, OperationOptions } from 'stellar-sdk';
import { ToastService } from './globalServices';

enum HORIZON_SERVER {
    stellar = 'https://horizon.stellar.org',
    lobstr = 'https://horizon.stellar.lobstr.co',
}

const FEE = 100000;
const TRANSACTION_TIMEOUT = 60 * 60 * 24 * 30;

export enum StellarEvents {
    accountStream = 'account stream',
    handleAccountUpdate = 'handle account update',
}

export const AQUA_CODE = 'AQUA';
export const AQUA_ISSUER = 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';

export enum THRESHOLDS {
    LOW = 'low_threshold',
    MED = 'med_threshold',
    HIGH = 'high_threshold',
    MULTIPLE = 'multiple',
    UNKNOWN = 'unknown',
}

export const THRESHOLD_ORDER = {
    [THRESHOLDS.LOW]: 1,
    [THRESHOLDS.MED]: 2,
    [THRESHOLDS.HIGH]: 3,
};

export const OP_THRESHOLDS = {
    [THRESHOLDS.LOW]: ['allowTrust', 'inflation', 'bumpSequence', 'setTrustLineFlags'],
    [THRESHOLDS.MED]: [
        'createAccount',
        'payment',
        'pathPayment',
        'pathPaymentStrictSend',
        'pathPaymentStrictReceive',
        'manageBuyOffer',
        'manageSellOffer',
        'createPassiveSellOffer',
        'changeTrust',
        'manageData',
        'createClaimableBalance',
        'claimClaimableBalance',
        'beginSponsoringFutureReserves',
        'endSponsoringFutureReserves',
        'revokeSponsorship',
        'clawback',
        'clawbackClaimableBalance',
    ],
    [THRESHOLDS.HIGH]: ['accountMerge'],
    [THRESHOLDS.MULTIPLE]: ['setOptions'], // med or high
};

export default class StellarServiceClass {
    server: StellarSdk.Server | null = null;
    event: EventService = new EventService();
    closeStream: () => void | null = null;
    private keypair: StellarSdk.Keypair | null = null;

    constructor() {
        this.startHorizonServer();
    }

    loginWithSecret(secretKey: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                this.keypair = StellarSdk.Keypair.fromSecret(secretKey);

                resolve(this.keypair.publicKey());
            } catch (e) {
                reject(e);
            }
        });
    }

    logoutWithSecret() {
        if (this.keypair) {
            this.keypair = null;
        }
    }

    async buildTx(
        account: StellarSdk.Account,
        operations: StellarSdk.xdr.Operation | StellarSdk.xdr.Operation[],
        memo?: StellarSdk.Memo,
    ) {
        const newAccount = await this.loadAccount(account.accountId());

        this.event.trigger({ type: StellarEvents.handleAccountUpdate, account: newAccount });

        const tx = new StellarSdk.TransactionBuilder(newAccount, {
            fee: FEE.toString(),
            networkPassphrase: StellarSdk.Networks.PUBLIC,
        }).setTimeout(TRANSACTION_TIMEOUT);

        if (Array.isArray(operations)) {
            operations.forEach((op) => {
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

    createMemo(type: MemoType, value): Memo {
        return new StellarSdk.Memo(type, value);
    }

    signAndSubmit(
        tx: StellarSdk.Transaction,
        account: Partial<Horizon.AccountResponse>,
    ): Promise<Horizon.SubmitTransactionResponse> {
        tx.sign(this.keypair);
        if (this.isMoreSignaturesNeeded(tx, account)) {
            ToastService.showErrorToast('Accounts with multisig are not supported yet');
            return Promise.reject();
        }
        return this.server.submitTransaction(tx);
    }

    submitXDR(xdr: string): Promise<Horizon.SubmitTransactionResponse> {
        const tx = new StellarSdk.Transaction(xdr, StellarSdk.Networks.PUBLIC);
        return this.server.submitTransaction(tx);
    }

    isMoreSignaturesNeeded(tx: StellarSdk.Transaction, account: Partial<Horizon.AccountResponse>) {
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

            if (usedThreshold === [THRESHOLDS.UNKNOWN]) {
                throw new Error('unknown operation');
            }

            if (usedThreshold === [THRESHOLDS.MULTIPLE]) {
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
            (signer) => signer.key === account.account_id,
        ).weight;

        return (
            masterKeyWeight <
            account.thresholds[transactionThreshold as keyof Horizon.AccountThresholds]
        );
    }

    private startHorizonServer(): void {
        this.server = new StellarSdk.Server(HORIZON_SERVER.stellar);
    }

    loadAccount(publicKey: string): Promise<StellarSdk.AccountResponse> {
        if (!this.server) {
            throw new Error("Horizon server isn't started");
        }
        return this.server.loadAccount(publicKey);
    }

    resolveFederationServer(homeDomain: string): Promise<string> {
        return StellarSdk.StellarTomlResolver.resolve(homeDomain).then((toml) => {
            if (!toml.FEDERATION_SERVER) {
                throw new Error('Federation server not exists');
            }

            return toml.FEDERATION_SERVER;
        });
    }

    startAccountStream(publicKey: string): void {
        this.closeStream = this.server
            .accounts()
            .accountId(publicKey)
            .cursor('now')
            .stream({
                onmessage: (result) => {
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
        prevBalances: Horizon.BalanceLineAsset[],
        newBalances: Horizon.BalanceLineAsset[],
    ): boolean {
        if (prevBalances.length !== newBalances.length) {
            return true;
        }

        return prevBalances.reduce((acc, balance) => {
            if (acc) {
                return acc;
            }
            const hasNewEqualBalance = newBalances.find(
                (newBalance) =>
                    newBalance.asset_code === balance.asset_code &&
                    newBalance.asset_issuer === balance.asset_issuer &&
                    newBalance.balance === balance.balance &&
                    newBalance.buying_liabilities === balance.buying_liabilities &&
                    newBalance.selling_liabilities === balance.selling_liabilities,
            );
            return hasNewEqualBalance ? acc : true;
        }, false);
    }

    createVoteOperation(publicKey, marketKey, amount, timestamp) {
        const time = Math.ceil(timestamp / 1000);
        return StellarSdk.Operation.createClaimableBalance({
            source: publicKey,
            amount: amount.toString(),
            asset: new StellarSdk.Asset(AQUA_CODE, AQUA_ISSUER),
            claimants: [
                new StellarSdk.Claimant(
                    marketKey,
                    StellarSdk.Claimant.predicateNot(StellarSdk.Claimant.predicateUnconditional()),
                ),
                new StellarSdk.Claimant(
                    publicKey,
                    StellarSdk.Claimant.predicateNot(
                        StellarSdk.Claimant.predicateBeforeAbsoluteTime(time.toString()),
                    ),
                ),
            ],
        });
    }

    createBurnAquaOperation(amount: string) {
        return StellarSdk.Operation.payment({
            amount,
            asset: new StellarSdk.Asset(AQUA_CODE, AQUA_ISSUER),
            destination: AQUA_ISSUER,
        });
    }
}
