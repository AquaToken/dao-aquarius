import * as StellarSdk from '@stellar/stellar-sdk';
import { Keypair, rpc, xdr } from '@stellar/stellar-sdk';

import { BASE_FEE } from 'constants/stellar';

import { getNetworkPassphrase } from 'helpers/env';
import { SorobanErrorHandler, SorobanPrepareTxErrorHandler } from 'helpers/error-handler';
import { getSorobanUrl } from 'helpers/url';

import { ModalService } from 'services/globalServices';

import RestoreContractModal from 'web/modals/RestoreContractModal';

export default class Connection {
    private server: StellarSdk.rpc.Server | null = null;
    private keypair: Keypair | null = null;

    constructor() {
        this.startServer();
    }

    startServer(): void {
        this.server = new rpc.Server(getSorobanUrl());
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

    pollTx<T>(
        hash: string,
    ): Promise<
        T | rpc.Api.GetFailedTransactionResponse | rpc.Api.GetMissingTransactionResponse | xdr.ScVal
    > {
        return this.server
            .pollTransaction(hash, {
                attempts: 30,
                sleepStrategy: () => 2000,
            })
            .then(res => {
                if (res.status === 'SUCCESS') {
                    return res.returnValue;
                }
                throw new Error(
                    'Transaction failed because of timeout. Please make another attempt.',
                );
            });
    }

    processResponse(response: rpc.Api.SendTransactionResponse) {
        if (response.status === 'TRY_AGAIN_LATER') {
            throw new Error('Try again later');
        }
        if (response.status === 'DUPLICATE') {
            return this.pollTx(response.hash);
        }
        if (response.status !== 'PENDING') {
            throw new Error(SorobanErrorHandler(response.errorResult.result().switch().name));
        }
        return this.pollTx(response.hash);
    }

    async tryRestore(tx: StellarSdk.Transaction) {
        const sim = await this.server.simulateTransaction(tx);

        if (!(sim as StellarSdk.rpc.Api.SimulateTransactionRestoreResponse).restorePreamble) {
            return Promise.resolve();
        }

        const account = await this.server.getAccount(tx.source);
        let fee = parseInt(BASE_FEE);

        fee += parseInt(
            (sim as StellarSdk.rpc.Api.SimulateTransactionRestoreResponse).restorePreamble
                .minResourceFee,
        );

        const restoreTx = new StellarSdk.TransactionBuilder(account, { fee: fee.toString() })
            .setNetworkPassphrase(getNetworkPassphrase())
            .setSorobanData(
                (
                    sim as StellarSdk.rpc.Api.SimulateTransactionRestoreResponse
                ).restorePreamble.transactionData.build(),
            )
            .addOperation(StellarSdk.Operation.restoreFootprint({}))
            .setTimeout(StellarSdk.TimeoutInfinite)
            .build();

        ModalService.openModal(RestoreContractModal, { tx: restoreTx });

        return Promise.reject({ message: 'Something expired' });
    }

    async buildSmartContractTx(
        publicKey: string,
        contractId: string,
        method: string,
        ...args: xdr.ScVal[]
    ) {
        const acc = await this.server.getAccount(publicKey);
        const contract = new StellarSdk.Contract(contractId);
        const builtTx = new StellarSdk.TransactionBuilder(acc, {
            fee: BASE_FEE,
            networkPassphrase: getNetworkPassphrase(),
        });
        if (args) {
            builtTx.addOperation(contract.call(method, ...args));
        } else {
            builtTx.addOperation(contract.call(method));
        }
        return builtTx.setTimeout(StellarSdk.TimeoutInfinite).build();
    }

    buildSmartContractTxFromOp(publicKey, operation) {
        return this.server.getAccount(publicKey).then(acc => {
            const builtTx = new StellarSdk.TransactionBuilder(acc, {
                fee: BASE_FEE,
                networkPassphrase: getNetworkPassphrase(),
            });

            builtTx.addOperation(operation);

            return builtTx.setTimeout(StellarSdk.TimeoutInfinite).build();
        });
    }

    signWithSecret(tx: StellarSdk.Transaction) {
        tx.sign(this.keypair);
        return tx;
    }

    getAccount(publicKey: string) {
        return this.server.getAccount(publicKey);
    }

    async submitTx(tx: StellarSdk.Transaction) {
        const res = await this.server.sendTransaction(tx);
        return await this.processResponse(res);
    }

    simulateTx(
        tx: StellarSdk.Transaction,
    ): Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse> {
        return this.server.simulateTransaction(
            tx,
        ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>;
    }

    prepareTransaction(tx: StellarSdk.Transaction) {
        return this.tryRestore(tx).then(() =>
            this.server.prepareTransaction(tx).catch(err => {
                throw SorobanPrepareTxErrorHandler(err);
            }),
        );
    }

    getLedgerEntries(...args: xdr.LedgerKey[]) {
        return this.server.getLedgerEntries(...args);
    }
}
