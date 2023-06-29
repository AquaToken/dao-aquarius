import * as SorobanClient from 'soroban-client';
import { sha256 } from 'js-sha256';
import binascii from 'binascii';
import { xdr, Asset, Keypair, SorobanRpc } from 'soroban-client';
import SendTransactionResponse = SorobanRpc.SendTransactionResponse;
import { ToastService } from './globalServices';

const SOROBAN_SERVER = 'https://rpc-futurenet.stellar.org:443/';

// SMART CONTACTS IDs
const AMM_SMART_CONTACT_ID = 'f4727d2f7e8619d40ac82174d90955215dad1993bdc8962172eed57ff3aa8972';

const POOL_CONTACT_WASM_HASH = '69ac7846eefb9ebc7f69d2036969fd3621e9152d400171a42c07c9f7cfad4351';

const TOKEN_CONTACT_WASM_HASH = '68f5c739b568664e3c4f4b7787958ce4ba527cc310fb0de0fea707dc1d6bd3c3';

enum AMM_CONTRACT_METHOD {
    GET_OR_CREATE_POOL = 'get_or_create_pool',
    DEPOSIT = 'sf_deposit',
    SHARE_ID = 'share_id',
    ESTIMATE_SWAP_OUT = 'estimate_swap_out',
    WITHDRAW = 'sf_withdrw',
    SWAP = 'swap_out',
}

enum ASSET_CONTRACT_METHOD {
    GET_ALLOWANCE = 'allowance',
    INCREASE_ALLOWANCE = 'increase_allowance',
    DECREASE_ALLOWANCE = 'decrease_allowance',
    GET_BALANCE = 'balance',
}

const FEE = '100';

export default class SorobanServiceClass {
    server: SorobanClient.Server | null = null;
    keypair: Keypair | null = null;

    constructor() {
        this.startServer();
    }

    loginWithSecret(secretKey: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                this.keypair = SorobanClient.Keypair.fromSecret(secretKey);

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

    getTestAssets() {
        const issuerKeypair = SorobanClient.Keypair.fromSecret(
            'SCVKX7O35CLACSVJZ6K6VHMGOU5YNEZFU7ORQ2RSL446UHC2PHRRDL3I',
        );
        const A = new SorobanClient.Asset('A', issuerKeypair.publicKey());
        const B = new SorobanClient.Asset('B', issuerKeypair.publicKey());
        const FRS1 = new SorobanClient.Asset(
            'FRS1',
            'GC6HLY2JXKXYXUU3XYC63O2RJNH4E3GEW26ABTHDF6AF6MY32B5QRISO',
        );
        const SND1 = new SorobanClient.Asset(
            'SND1',
            'GC6HLY2JXKXYXUU3XYC63O2RJNH4E3GEW26ABTHDF6AF6MY32B5QRISO',
        );
        return this.server
            .getAccount(this.keypair.publicKey())
            .then((acc) => {
                const transaction = new SorobanClient.TransactionBuilder(acc, {
                    fee: FEE,
                    networkPassphrase: SorobanClient.Networks.FUTURENET,
                })
                    .addOperation(
                        SorobanClient.Operation.changeTrust({
                            asset: A,
                        }),
                    )
                    .addOperation(
                        SorobanClient.Operation.changeTrust({
                            asset: B,
                        }),
                    )
                    .addOperation(
                        SorobanClient.Operation.changeTrust({
                            asset: FRS1,
                        }),
                    )
                    .addOperation(
                        SorobanClient.Operation.changeTrust({
                            asset: SND1,
                        }),
                    )
                    .setTimeout(SorobanClient.TimeoutInfinite)
                    .build();
                transaction.sign(this.keypair);
                return this.server.sendTransaction(transaction);
            })
            .then((res) => {
                return this.processResponse(res);
            })
            .then(() => {
                return this.server
                    .getAccount(issuerKeypair.publicKey())
                    .then((issuer) => {
                        const transaction = new SorobanClient.TransactionBuilder(issuer, {
                            fee: FEE,
                            networkPassphrase: SorobanClient.Networks.FUTURENET,
                        })
                            .addOperation(
                                SorobanClient.Operation.payment({
                                    destination: this.keypair.publicKey(),
                                    asset: A,
                                    amount: '10000',
                                }),
                            )
                            .addOperation(
                                SorobanClient.Operation.payment({
                                    destination: this.keypair.publicKey(),
                                    asset: B,
                                    amount: '10000',
                                }),
                            )
                            .addOperation(
                                SorobanClient.Operation.payment({
                                    destination: this.keypair.publicKey(),
                                    asset: FRS1,
                                    amount: '10000',
                                }),
                            )
                            .addOperation(
                                SorobanClient.Operation.payment({
                                    destination: this.keypair.publicKey(),
                                    asset: SND1,
                                    amount: '10000',
                                }),
                            )
                            .setTimeout(SorobanClient.TimeoutInfinite)
                            .build();

                        transaction.sign(issuerKeypair);
                        return this.server.sendTransaction(transaction);
                    })
                    .then((res) => this.processResponse(res))
                    .catch(function (error) {
                        console.error('Error!', error);
                    });
            });
    }

    processResponse(response: SendTransactionResponse) {
        if (response.status === 'DUPLICATE') {
            return this.getTx(response.hash);
        }
        if (response.status !== 'PENDING') {
            console.log(response);
            return ToastService.showErrorToast(response.status);
        }
        return this.getTx(response.hash);
    }

    getTx(hash: string, resolver?: (value?: any) => void) {
        return this.server.getTransaction(hash).then((res) => {
            console.log('TX', res);
            if (res.status === 'SUCCESS') {
                if (resolver) {
                    resolver(res.resultXdr);
                }
                return;
            }

            if (res.status === 'FAILED') {
                if (resolver) {
                    resolver();
                }
                return ToastService.showErrorToast('Transaction was failed');
            }

            if (resolver) {
                return setTimeout(() => this.getTx(hash, resolver), 1000);
            }

            return new Promise((resolve) => {
                setTimeout(() => this.getTx(hash, resolve), 1000);
            });
        });
    }

    getAsset(code, issuer): Asset {
        if (!issuer) {
            return Asset.native();
        }

        return new Asset(code, issuer);
    }

    getAssetContractId(asset: Asset): string {
        const networkHash: Buffer = Buffer.from(
            sha256.arrayBuffer(SorobanClient.Networks.FUTURENET),
        );

        const fromAsset: xdr.HashIdPreimageFromAsset = new xdr.HashIdPreimageFromAsset({
            asset: asset.toXDRObject(),
            networkId: networkHash,
        });

        const data: xdr.HashIdPreimage =
            xdr.HashIdPreimage.envelopeTypeContractIdFromAsset(fromAsset);

        return sha256(data.toXDR());
    }

    checkContactDeployed(contractId: string): Promise<boolean> {
        const contractIdBuffer: Buffer = Buffer.from(binascii.unhexlify(contractId), 'ascii');

        const ledgerKey: xdr.LedgerKey = xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
                contractId: contractIdBuffer,
                key: xdr.ScVal.scvLedgerKeyContractExecutable(),
            }),
        );

        return this.server
            .getLedgerEntries([ledgerKey])
            .then(({ entries }) => {
                return Boolean(entries.length);
            })
            .catch(() => {
                return false;
            });
    }

    getPoolId(base: Asset, counter: Asset) {
        const [aId, bId] = this.orderTokenIDS(base, counter);

        return this.buildSmartContactTx(
            this.keypair.publicKey(),
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.GET_OR_CREATE_POOL,
            this.hashToScVal(POOL_CONTACT_WASM_HASH),
            this.hashToScVal(TOKEN_CONTACT_WASM_HASH),
            this.hashToAddressScVal(aId),
            this.hashToAddressScVal(bId),
        )
            .then((tx) => this.server.prepareTransaction(tx))
            .then((prepared) => {
                prepared.sign(this.keypair);
                return this.submitTx(
                    prepared as SorobanClient.Transaction<
                        SorobanClient.Memo<SorobanClient.MemoType>,
                        SorobanClient.Operation[]
                    >,
                );
            })
            .then((res) => this.processResponse(res))
            .then((res) => {
                const result = xdr.TransactionResult.fromXDR(Buffer.from(res, 'base64'));

                return result
                    .result()
                    .value()[0]
                    .value()
                    .value()
                    .value()[0]
                    .value()
                    .value()
                    .toString('hex');
            });
    }

    getPoolShareId(poolId: string) {
        return this.buildSmartContactTx(
            this.keypair.publicKey(),
            poolId,
            AMM_CONTRACT_METHOD.SHARE_ID,
        )
            .then((tx) => this.server.simulateTransaction(tx))
            .then(({ results }) => {
                if (results) {
                    const xdr = results[0].xdr;

                    let scVal = SorobanClient.xdr.ScVal.fromXDR(Buffer.from(xdr, 'base64'));

                    return scVal.address().contractId().toString('hex');
                }

                throw new Error('getPoolShareId error');
            });
    }

    getTokenBalance(token: Asset | string, where: string) {
        return (
            this.buildSmartContactTx(
                this.keypair.publicKey(),
                typeof token === 'string' ? token : this.getAssetContractId(token),
                ASSET_CONTRACT_METHOD.GET_BALANCE,
                SorobanClient.StrKey.isValidEd25519PublicKey(where)
                    ? this.publicKeyToScVal(where)
                    : this.hashToAddressScVal(where),
            )
                // .then((tx) => {
                //     return this.server.prepareTransaction(tx);
                // })
                // .then((prepared) => {
                //     prepared.sign(this.keypair);
                //     return this.submitTx(
                //         prepared as SorobanClient.Transaction<
                //             SorobanClient.Memo<SorobanClient.MemoType>,
                //             SorobanClient.Operation[]
                //         >,
                //     );
                // })
                // .then((res) => this.processResponse(res))
                // .then((res) => {
                //     const result = xdr.TransactionResult.fromXDR(Buffer.from(res, 'base64'));
                //
                //     const i128 = result.result().value()[0].value().value().value()[0].value();
                //
                //     return this.i128ToInt(i128);
                // });
                .then((tx) => this.server.simulateTransaction(tx))
                .then(({ results }) => {
                    if (results) {
                        const xdr = results[0].xdr;

                        let scVal = SorobanClient.xdr.ScVal.fromXDR(Buffer.from(xdr, 'base64'));

                        return this.i128ToInt(scVal.i128());
                    }

                    return null;
                })
        );
    }

    getPoolAllowance(poolId: string, token: Asset | string) {
        return this.buildSmartContactTx(
            this.keypair.publicKey(),
            typeof token === 'string' ? token : this.getAssetContractId(token),
            ASSET_CONTRACT_METHOD.GET_ALLOWANCE,
            this.publicKeyToScVal(this.keypair.publicKey()),
            this.hashToAddressScVal(poolId),
        )
            .then((tx) => {
                console.log(tx);
                return this.simulateTx(tx);
            })
            .then(({ results }) => {
                if (results) {
                    const xdr = results[0].xdr;

                    let scVal = SorobanClient.xdr.ScVal.fromXDR(Buffer.from(xdr, 'base64'));

                    return this.i128ToInt(scVal.i128());
                }

                throw new Error('getPoolAllowance fail');
            });
    }

    giveAllowance(poolId: string, asset: Asset, amount: string) {
        return this.buildSmartContactTx(
            this.keypair.publicKey(),
            this.getAssetContractId(asset),
            ASSET_CONTRACT_METHOD.INCREASE_ALLOWANCE,
            this.publicKeyToScVal(this.keypair.publicKey()),
            this.hashToAddressScVal(poolId),
            this.amountToScVal(amount),
        )
            .then((tx) => {
                return this.server.prepareTransaction(tx);
            })
            .then((prepared) => {
                prepared.sign(this.keypair);
                return this.submitTx(
                    prepared as SorobanClient.Transaction<
                        SorobanClient.Memo<SorobanClient.MemoType>,
                        SorobanClient.Operation[]
                    >,
                );
            })
            .then((res) => {
                console.log(res);
            });
    }

    deposit(poolId: string, a: Asset, b: Asset, aAmount: string, bAmount: string) {
        const idA = this.getAssetContractId(a);
        const idB = this.getAssetContractId(b);

        const [base, counter] = idA > idB ? [b, a] : [a, b];
        const [baseAmount, counterAmount] = idA > idB ? [bAmount, aAmount] : [aAmount, bAmount];

        return Promise.all([
            this.getPoolAllowance(poolId, base),
            this.getPoolAllowance(poolId, counter),
        ])
            .then(([baseAllowance, counterAllowance]) => {
                const baseHostFunction = new xdr.HostFunction({
                    args: xdr.HostFunctionArgs.hostFunctionTypeInvokeContract([
                        this.hashToScVal(this.getAssetContractId(base)),
                        this.stringToScVal(
                            +baseAllowance < +baseAmount
                                ? ASSET_CONTRACT_METHOD.INCREASE_ALLOWANCE
                                : ASSET_CONTRACT_METHOD.DECREASE_ALLOWANCE,
                        ),
                        this.publicKeyToScVal(this.keypair.publicKey()),
                        this.hashToAddressScVal(poolId),
                        this.amountToScVal(baseAmount),
                    ]),
                    auth: [],
                });

                const counterHostFunction = new xdr.HostFunction({
                    args: xdr.HostFunctionArgs.hostFunctionTypeInvokeContract([
                        this.hashToScVal(this.getAssetContractId(counter)),
                        this.stringToScVal(
                            +counterAllowance < +counterAmount
                                ? ASSET_CONTRACT_METHOD.INCREASE_ALLOWANCE
                                : ASSET_CONTRACT_METHOD.DECREASE_ALLOWANCE,
                        ),
                        this.publicKeyToScVal(this.keypair.publicKey()),
                        this.hashToAddressScVal(poolId),
                        this.amountToScVal(counterAmount),
                    ]),
                    auth: [],
                });

                return [baseHostFunction, counterHostFunction];
            })
            .then((hostFunctions) => {
                // const auth = new xdr.ContractAuth({
                //     addressWithNonce: null,
                //     signatureArgs: [],
                //     rootInvocation: new xdr.AuthorizedInvocation({
                //         contractId: Buffer.from(binascii.unhexlify(AMM_SMART_CONTACT_ID), 'ascii'),
                //         functionName: AMM_CONTRACT_METHOD.DEPOSIT,
                //         args: [
                //             this.publicKeyToScVal(this.keypair.publicKey()),
                //             this.assetToScVal(base),
                //             this.assetToScVal(counter),
                //             this.amountToScVal(baseAmount),
                //             this.amountToScVal(baseAmount),
                //             this.amountToScVal(counterAmount),
                //             this.amountToScVal(counterAmount),
                //         ],
                //         subInvocations: [
                //             new xdr.AuthorizedInvocation({
                //                 contractId: Buffer.from(binascii.unhexlify(poolId), 'ascii'),
                //                 functionName: 'deposit',
                //                 args: [
                //                     this.publicKeyToScVal(this.keypair.publicKey()),
                //                     this.amountToScVal(baseAmount),
                //                     this.amountToScVal(baseAmount),
                //                     this.amountToScVal(counterAmount),
                //                     this.amountToScVal(counterAmount),
                //                 ],
                //                 subInvocations: [],
                //             }),
                //         ],
                //     }),
                // });

                const op = SorobanClient.Operation.invokeHostFunctions({
                    functions: [
                        ...hostFunctions,
                        new xdr.HostFunction({
                            args: xdr.HostFunctionArgs.hostFunctionTypeInvokeContract([
                                this.hashToScVal(AMM_SMART_CONTACT_ID),
                                this.stringToScVal(AMM_CONTRACT_METHOD.DEPOSIT),
                                this.publicKeyToScVal(this.keypair.publicKey()),
                                this.assetToScVal(base),
                                this.assetToScVal(counter),
                                this.amountToScVal(baseAmount),
                                this.amountToScVal('0'),
                                this.amountToScVal(counterAmount),
                                this.amountToScVal('0'),
                            ]),
                            auth: [],
                        }),
                    ],
                });

                return [op];
            })
            .then((ops) => {
                return this.buildTxFromOps(this.keypair.publicKey(), ops);
            })
            .then((tx) => {
                console.log('TX', tx);
                return this.server.prepareTransaction(tx);
            })
            .then((prepared) => {
                console.log(prepared);
                prepared.sign(this.keypair);

                return this.server.sendTransaction(prepared);
            })
            .then((res) => {
                return this.processResponse(res);
            })
            .then((res) => {
                console.log('DEPOSIT COMPLETED', res);
            });
    }

    withdraw(
        poolId: string,
        a: Asset,
        b: Asset,
        aAmount: string,
        bAmount: string,
        shareId: string,
        shareAmount: string,
    ) {
        const idA = this.getAssetContractId(a);
        const idB = this.getAssetContractId(b);

        const [base, counter] = idA > idB ? [b, a] : [a, b];
        const [baseAmount, counterAmount] = idA > idB ? [bAmount, aAmount] : [aAmount, bAmount];

        return this.getPoolAllowance(poolId, shareId)
            .then((allowance) => {
                return new xdr.HostFunction({
                    args: xdr.HostFunctionArgs.hostFunctionTypeInvokeContract([
                        this.hashToScVal(shareId),
                        this.stringToScVal(
                            +allowance < +shareAmount
                                ? ASSET_CONTRACT_METHOD.INCREASE_ALLOWANCE
                                : ASSET_CONTRACT_METHOD.DECREASE_ALLOWANCE,
                        ),
                        this.publicKeyToScVal(this.keypair.publicKey()),
                        this.hashToAddressScVal(poolId),
                        this.amountToScVal(shareAmount),
                    ]),
                    auth: [],
                });
            })
            .then((hostFunction) => {
                const op = SorobanClient.Operation.invokeHostFunctions({
                    functions: [
                        hostFunction,
                        new xdr.HostFunction({
                            args: xdr.HostFunctionArgs.hostFunctionTypeInvokeContract([
                                this.hashToScVal(AMM_SMART_CONTACT_ID),
                                this.stringToScVal(AMM_CONTRACT_METHOD.WITHDRAW),
                                this.publicKeyToScVal(this.keypair.publicKey()),
                                this.assetToScVal(base),
                                this.assetToScVal(counter),
                                this.amountToScVal(shareAmount),
                                this.amountToScVal(baseAmount),
                                this.amountToScVal(counterAmount),
                            ]),
                            auth: [],
                        }),
                    ],
                });
                return [op];
            })
            .then((ops) => {
                return this.buildTxFromOps(this.keypair.publicKey(), ops);
            })
            .then((tx) => {
                return this.server.prepareTransaction(tx);
            })
            .then((prepared) => {
                prepared.sign(this.keypair);

                return this.server.sendTransaction(prepared);
            })
            .then((res) => {
                return this.processResponse(res);
            })
            .then((res) => {
                console.log('WITHDRAW COMPLETED', res);
            });
    }

    getSwapEstimatedAmount(sell: Asset, buy: Asset, amount: string) {
        return this.buildSmartContactTx(
            this.keypair.publicKey(),
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.ESTIMATE_SWAP_OUT,
            this.assetToScVal(sell),
            this.assetToScVal(buy),
            this.amountToScVal(amount),
        )
            .then((tx) => this.server.simulateTransaction(tx))
            .then(({ results }) => {
                if (results) {
                    const xdr = results[0].xdr;

                    let scVal = SorobanClient.xdr.ScVal.fromXDR(Buffer.from(xdr, 'base64'));

                    console.log(scVal.i128());
                    return this.i128ToInt(scVal.i128());
                }

                throw new Error('getSwapEstimatedAmount error');
            });
    }

    swapAssets(
        poolId: string,
        base: Asset,
        counter: Asset,
        amount: string,
        estimatedAmount: string,
    ) {
        const SLIPPAGE = 0.01; // 1%

        const maxBaseAmount = ((1 + SLIPPAGE) * Number(estimatedAmount)).toFixed(7);

        return this.getPoolAllowance(poolId, counter)
            .then((allowance) => {
                return new xdr.HostFunction({
                    args: xdr.HostFunctionArgs.hostFunctionTypeInvokeContract([
                        this.hashToScVal(this.getAssetContractId(base)),
                        this.stringToScVal(
                            +allowance < +maxBaseAmount
                                ? ASSET_CONTRACT_METHOD.INCREASE_ALLOWANCE
                                : ASSET_CONTRACT_METHOD.DECREASE_ALLOWANCE,
                        ),
                        this.publicKeyToScVal(this.keypair.publicKey()),
                        this.hashToAddressScVal(poolId),
                        this.amountToScVal(maxBaseAmount),
                    ]),
                    auth: [],
                });
            })
            .then((hostFunction) => {
                const swapFunction = new xdr.HostFunction({
                    args: xdr.HostFunctionArgs.hostFunctionTypeInvokeContract([
                        this.hashToScVal(AMM_SMART_CONTACT_ID),
                        this.stringToScVal(AMM_CONTRACT_METHOD.SWAP),
                        this.publicKeyToScVal(this.keypair.publicKey()),
                        this.assetToScVal(base),
                        this.assetToScVal(counter),
                        this.amountToScVal(amount),
                        this.amountToScVal(maxBaseAmount),
                    ]),
                    auth: [],
                });

                return [hostFunction, swapFunction];
            })
            .then((hostFunctions) => {
                const op = SorobanClient.Operation.invokeHostFunctions({
                    functions: [
                        ...hostFunctions,
                        new xdr.HostFunction({
                            args: xdr.HostFunctionArgs.hostFunctionTypeInvokeContract([
                                this.hashToScVal(this.getAssetContractId(base)),
                                this.stringToScVal(ASSET_CONTRACT_METHOD.DECREASE_ALLOWANCE),
                                this.publicKeyToScVal(this.keypair.publicKey()),
                                this.hashToAddressScVal(poolId),
                                this.amountToScVal('0'),
                            ]),
                            auth: [],
                        }),
                    ],
                });

                return [op];
            })
            .then((ops) => {
                return this.buildTxFromOps(this.keypair.publicKey(), ops);
            })
            .then((tx) => {
                return this.server.prepareTransaction(tx);
            })
            .then((prepared) => {
                prepared.sign(this.keypair);

                return this.server.sendTransaction(prepared);
            })
            .then((res) => {
                return this.processResponse(res);
            })
            .then((res) => {
                console.log('SWAP COMPLETED', res);
            });
    }

    buildSmartContactTx(publicKey, contactId, method, ...args) {
        return this.server.getAccount(publicKey).then((acc) => {
            const contract = new SorobanClient.Contract(contactId);

            const builtTx = new SorobanClient.TransactionBuilder(acc, {
                fee: FEE,
                networkPassphrase: SorobanClient.Networks.FUTURENET,
            });

            if (args) {
                builtTx.addOperation(contract.call(method, ...args));
            } else {
                builtTx.addOperation(contract.call(method));
            }

            return builtTx.setTimeout(SorobanClient.TimeoutInfinite).build();
        });
    }

    buildSmartContractOp(contactId, method, ...args) {
        const contract = new SorobanClient.Contract(contactId);

        return args ? contract.call(method, ...args) : contract.call(method);
    }

    buildTxFromOps(publicKey, ops: any[]) {
        return this.server.getAccount(publicKey).then((acc) => {
            const builtTx = new SorobanClient.TransactionBuilder(acc, {
                fee: FEE,
                networkPassphrase: SorobanClient.Networks.FUTURENET,
            });

            ops.forEach((op) => {
                builtTx.addOperation(op);
            });

            return builtTx.setTimeout(SorobanClient.TimeoutInfinite).build();
        });
    }

    signWithSecret(tx: SorobanClient.Transaction) {
        tx.sign(this.keypair);
        return tx;
    }

    submitTx(tx: SorobanClient.Transaction) {
        return this.server.sendTransaction(tx);
    }

    simulateTx(tx: SorobanClient.Transaction) {
        return this.server.simulateTransaction(tx);
    }

    private startServer(): void {
        this.server = new SorobanClient.Server(SOROBAN_SERVER);
    }

    private hashToScVal(hash: string): xdr.ScVal {
        return xdr.ScVal.scvBytes(Buffer.from(binascii.unhexlify(hash), 'ascii'));
    }

    hashToAddressScVal(hash: string): xdr.ScVal {
        return xdr.ScVal.scvAddress(
            SorobanClient.Address.contract(
                Buffer.from(binascii.unhexlify(hash), 'ascii'),
            ).toScAddress(),
        );
    }

    private assetToScVal(asset: Asset): xdr.ScVal {
        return xdr.ScVal.scvAddress(
            SorobanClient.Address.contract(
                Buffer.from(binascii.unhexlify(this.getAssetContractId(asset)), 'ascii'),
            ).toScAddress(),
        );
    }

    private publicKeyToScVal(pubkey: string): xdr.ScVal {
        return xdr.ScVal.scvAddress(SorobanClient.Address.fromString(pubkey).toScAddress());
    }

    amountToScVal(amount: string): xdr.ScVal {
        const value = (Number(amount) * 1e7).toFixed(0);

        return xdr.ScVal.scvI128(
            new xdr.Int128Parts({
                hi: xdr.Int64.fromString('0'),
                lo: xdr.Uint64.fromString(value),
            }),
        );
    }

    stringToScVal(val: string): xdr.ScVal {
        return SorobanClient.xdr.ScVal.scvSymbol(val);
    }

    i128ToInt(val: xdr.Int128Parts): number {
        // @ts-ignore
        return ((Number(val.hi()._value) << 64) + Number(val.lo()._value)) / 1e7;
    }

    private orderTokenIDS(a: Asset, b: Asset) {
        const idA = this.getAssetContractId(a);
        const idB = this.getAssetContractId(b);

        return idA > idB ? [idB, idA] : [idA, idB];
    }
}
