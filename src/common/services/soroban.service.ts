import * as SorobanClient from 'soroban-client';
import { sha256 } from 'js-sha256';
import binascii from 'binascii';
import {
    xdr,
    Asset,
    Keypair,
    SorobanRpc,
    BASE_FEE,
    assembleTransaction,
    StrKey,
} from 'soroban-client';
import SendTransactionResponse = SorobanRpc.SendTransactionResponse;
import SimulateTransactionSuccessResponse = SorobanRpc.SimulateTransactionSuccessResponse;
import { ToastService } from './globalServices';

const SOROBAN_SERVER = 'https://soroban-testnet.stellar.org:443';
const AMM_SMART_CONTACT_ID = 'CD2L4RUBG7LONUH5KNP5UAUHPGBTHFDZW2NNC3MFFSGFC4OGD2RQ2WCO';

enum AMM_CONTRACT_METHOD {
    GET_POOL = 'get_pool',
    INIT_POOL = 'init_pool',
    DEPOSIT = 'deposit',
    SHARE_ID = 'share_id',
    ESTIMATE_SWAP_OUT = 'estimate_swap_out',
    WITHDRAW = 'withdraw',
    SWAP = 'swap_out',
    GET_RESERVES = 'get_reserves',
}

enum ASSET_CONTRACT_METHOD {
    GET_ALLOWANCE = 'allowance',
    APPROVE_ALLOWANCE = 'approve',
    GET_BALANCE = 'balance',
}

const issuerKeypair = SorobanClient.Keypair.fromSecret(
    'SBPQCB4DOUQ26OC43QNAA3ODZOGECHJUVHDHYRHKYPL4SA22RRYGHQCX',
);
const USDT = new SorobanClient.Asset('USDT', issuerKeypair.publicKey());
const USDC = new SorobanClient.Asset('USDC', issuerKeypair.publicKey());
const ETH = new SorobanClient.Asset('ETH', issuerKeypair.publicKey());
const BTC = new SorobanClient.Asset('BTC', issuerKeypair.publicKey());

export enum CONTRACT_STATUS {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    NOT_FOUND = 'not_found',
}

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

    getAddTrustTx(accountId: string) {
        return this.server.getAccount(accountId).then((acc) => {
            return new SorobanClient.TransactionBuilder(acc, {
                fee: BASE_FEE,
                networkPassphrase: SorobanClient.Networks.TESTNET,
            })
                .addOperation(
                    SorobanClient.Operation.changeTrust({
                        asset: USDC,
                    }),
                )
                .addOperation(
                    SorobanClient.Operation.changeTrust({
                        asset: USDT,
                    }),
                )
                .addOperation(
                    SorobanClient.Operation.changeTrust({
                        asset: BTC,
                    }),
                )
                .addOperation(
                    SorobanClient.Operation.changeTrust({
                        asset: ETH,
                    }),
                )
                .setTimeout(SorobanClient.TimeoutInfinite)
                .build();
        });
    }

    getTestAssets(accountId) {
        return this.server.getAccount(issuerKeypair.publicKey()).then((issuer) => {
            const transaction = new SorobanClient.TransactionBuilder(issuer, {
                fee: BASE_FEE,
                networkPassphrase: SorobanClient.Networks.TESTNET,
            })
                .addOperation(
                    SorobanClient.Operation.payment({
                        destination: accountId,
                        asset: USDT,
                        amount: '10000',
                    }),
                )
                .addOperation(
                    SorobanClient.Operation.payment({
                        destination: accountId,
                        asset: USDC,
                        amount: '10000',
                    }),
                )
                .addOperation(
                    SorobanClient.Operation.payment({
                        destination: accountId,
                        asset: ETH,
                        amount: '10000',
                    }),
                )
                .addOperation(
                    SorobanClient.Operation.payment({
                        destination: accountId,
                        asset: BTC,
                        amount: '10000',
                    }),
                )
                .setTimeout(SorobanClient.TimeoutInfinite)
                .build();

            transaction.sign(issuerKeypair);
            return this.submitTx(transaction);
        });
    }

    processResponse(response: SendTransactionResponse) {
        if (response.status === 'DUPLICATE') {
            return this.getTx(response.hash);
        }
        if (response.status !== 'PENDING') {
            ToastService.showErrorToast(response.status);

            throw new Error(response.status);
        }
        return this.getTx(response.hash);
    }

    getTx(hash: string, resolver?: (value?: any) => void) {
        return this.server.getTransaction(hash).then((res) => {
            console.log('TX', res);
            if (res.status === 'SUCCESS') {
                if (resolver) {
                    resolver(res.returnValue);
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

    getAssetContractHash(asset: Asset): string {
        const networkId: Buffer = Buffer.from(sha256.arrayBuffer(SorobanClient.Networks.TESTNET));

        const contractIdPreimage: xdr.ContractIdPreimage =
            xdr.ContractIdPreimage.contractIdPreimageFromAsset(asset.toXDRObject());

        const hashIdPreimageContractId = new xdr.HashIdPreimageContractId({
            networkId,
            contractIdPreimage,
        });

        const data: xdr.HashIdPreimage =
            xdr.HashIdPreimage.envelopeTypeContractId(hashIdPreimageContractId);

        return sha256(data.toXDR());
    }

    getContactIdFromHash(hash) {
        return SorobanClient.StrKey.encodeContract(Buffer.from(binascii.unhexlify(hash), 'ascii'));
    }

    getAssetContractId(asset: Asset): string {
        const hash = this.getAssetContractHash(asset);

        return this.getContactIdFromHash(hash);
    }

    getContractData(
        contractId: string,
    ): Promise<{ status: CONTRACT_STATUS; ledgersBeforeExpire: number }> {
        const contractIdBuffer: Buffer = StrKey.decodeContract(contractId);

        const contractKey: xdr.LedgerKey = xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
                contract: xdr.ScAddress.scAddressTypeContract(contractIdBuffer),
                key: xdr.ScVal.scvLedgerKeyContractInstance(),
                durability: xdr.ContractDataDurability.persistent(),
            }),
        );

        const ledgerKey: xdr.LedgerKey = xdr.LedgerKey.expiration(
            new xdr.LedgerKeyExpiration({
                keyHash: Buffer.from(binascii.unhexlify(sha256(contractKey.toXDR())), 'ascii'),
            }),
        );

        return this.server
            .getLedgerEntries(ledgerKey)
            .then(({ entries, latestLedger }) => {
                if (!entries?.length) {
                    return {
                        status: CONTRACT_STATUS.NOT_FOUND,
                        ledgersBeforeExpire: 0,
                    };
                }

                const [entry] = entries;

                console.log();

                // @ts-ignore
                const contractExp = entry.val.value().expirationLedgerSeq();

                return {
                    status:
                        contractExp > latestLedger
                            ? CONTRACT_STATUS.ACTIVE
                            : CONTRACT_STATUS.EXPIRED,
                    ledgersBeforeExpire: Math.max(contractExp - latestLedger, 0),
                };
            })
            .catch(() => {
                return {
                    status: CONTRACT_STATUS.NOT_FOUND,
                    ledgersBeforeExpire: 0,
                };
            });
    }

    deployAssetContractTx(publicKey: string, asset: Asset) {
        return this.server
            .getAccount(publicKey)
            .then((acc) => {
                const tx = new SorobanClient.TransactionBuilder(acc, {
                    fee: BASE_FEE,
                    networkPassphrase: SorobanClient.Networks.TESTNET,
                });

                tx.addOperation(
                    SorobanClient.Operation.invokeHostFunction({
                        func: xdr.HostFunction.hostFunctionTypeCreateContract(
                            new xdr.CreateContractArgs({
                                contractIdPreimage:
                                    xdr.ContractIdPreimage.contractIdPreimageFromAsset(
                                        asset.toXDRObject(),
                                    ),
                                executable: xdr.ContractExecutable.contractExecutableToken(),
                            }),
                        ),
                        auth: [],
                    }),
                );

                return tx.setTimeout(SorobanClient.TimeoutInfinite).build();
            })
            .then((tx) => this.server.prepareTransaction(tx));
    }

    restoreAssetContractTx(publicKey: string, asset: Asset) {
        const contractId = this.getAssetContractId(asset);

        const contact = new SorobanClient.Contract(contractId);

        return this.server
            .getAccount(publicKey)
            .then((acc) => {
                return new SorobanClient.TransactionBuilder(acc, {
                    fee: BASE_FEE,
                    networkPassphrase: SorobanClient.Networks.TESTNET,
                })
                    .addOperation(SorobanClient.Operation.restoreFootprint({}))
                    .setSorobanData(
                        new SorobanClient.SorobanDataBuilder()
                            .setReadWrite([contact.getFootprint()[1]])
                            .build(),
                    )
                    .setTimeout(SorobanClient.TimeoutInfinite)
                    .build();
            })
            .then((tx) => this.simulateManually(tx));
    }

    bumpAssetContractTx(publicKey: string, asset: Asset) {
        const contractId = this.getAssetContractId(asset);

        const contact = new SorobanClient.Contract(contractId);

        return this.server
            .getAccount(publicKey)
            .then((acc) => {
                return new SorobanClient.TransactionBuilder(acc, {
                    fee: BASE_FEE,
                    networkPassphrase: SorobanClient.Networks.TESTNET,
                })
                    .addOperation(
                        SorobanClient.Operation.bumpFootprintExpiration({
                            ledgersToExpire: 500000,
                        }),
                    )
                    .setSorobanData(
                        new SorobanClient.SorobanDataBuilder()
                            .setReadOnly([contact.getFootprint()[1]])
                            .build(),
                    )
                    .setTimeout(SorobanClient.TimeoutInfinite)
                    .build();
            })
            .then((tx) => this.simulateManually(tx));
    }

    // TODO: the transaction simulation is broken in the SDK,
    //  you will need to remove it after the fix is released
    simulateManually(tx): Promise<SorobanClient.Transaction> {
        const xdr = tx.toXDR();

        let requestObject = {
            jsonrpc: '2.0',
            method: 'simulateTransaction',
            id: 0,
            params: {
                transaction: xdr,
            },
        };

        return fetch(SOROBAN_SERVER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestObject),
        })
            .then((res) => res.json())
            .then(({ result }) => {
                console.log(result);
                return assembleTransaction(tx, SorobanClient.Networks.TESTNET, result).build();
            });
    }

    getPoolId(
        accountId: string,
        base: Asset,
        counter: Asset,
    ): Promise<SimulateTransactionSuccessResponse> {
        const [aId, bId] = this.orderTokenIDS(base, counter);

        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.GET_POOL,
            this.contractIdToScVal(aId),
            this.contractIdToScVal(bId),
        ).then(
            (tx) =>
                this.server.simulateTransaction(tx) as Promise<SimulateTransactionSuccessResponse>,
        );
    }

    getInitPoolTx(accountId: string, base: Asset, counter: Asset) {
        const [aId, bId] = this.orderTokenIDS(base, counter);

        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.INIT_POOL,
            this.contractIdToScVal(aId),
            this.contractIdToScVal(bId),
        ).then((tx) => this.server.prepareTransaction(tx));
    }

    getPoolShareId(accountId, poolId: string) {
        return this.buildSmartContactTx(accountId, poolId, AMM_CONTRACT_METHOD.SHARE_ID)
            .then(
                (tx) =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    // @ts-ignore
                    return result.retval.value().value().toString('hex');
                }

                throw new Error('getPoolShareId error');
            });
    }

    getTokenBalance(accountId, token: Asset | string, where: string) {
        return this.buildSmartContactTx(
            accountId,
            typeof token === 'string' ? token : this.getAssetContractId(token),
            ASSET_CONTRACT_METHOD.GET_BALANCE,
            SorobanClient.StrKey.isValidEd25519PublicKey(where)
                ? this.publicKeyToScVal(where)
                : this.contractIdToScVal(where),
        )
            .then(
                (tx) =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return this.i128ToInt(result.retval.value() as xdr.Int128Parts);
                }

                return null;
            });
    }

    getGiveAllowanceTx(accountId: string, poolId: string, asset: Asset | string, amount: string) {
        return this.server.getLatestLedger().then(({ sequence }) => {
            return this.buildSmartContactTx(
                accountId,
                typeof asset === 'string' ? asset : this.getAssetContractId(asset),
                ASSET_CONTRACT_METHOD.APPROVE_ALLOWANCE,
                this.publicKeyToScVal(this.keypair.publicKey()),
                this.contractIdToScVal(poolId),
                this.amountToScVal(amount),
                xdr.ScVal.scvU32(sequence + 477533),
            ).then((tx) => {
                return this.server.prepareTransaction(tx);
            });
        });
    }

    getPoolPrice(accountId: string, a: Asset, b: Asset) {
        const idA = this.getAssetContractId(a);
        const idB = this.getAssetContractId(b);
        const [base, counter] = idA > idB ? [b, a] : [a, b];

        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.GET_RESERVES,
            this.assetToScVal(base),
            this.assetToScVal(counter),
        )
            .then((tx) => {
                return this.simulateTx(tx) as Promise<SimulateTransactionSuccessResponse>;
            })
            .then(({ result }) => {
                if (result) {
                    // @ts-ignore
                    const [baseAmount, counterAmount] = result.retval.value();

                    const baseAmountInt = this.i128ToInt(baseAmount.i128());
                    const counterAmountInt = this.i128ToInt(counterAmount.i128());

                    return this.getAssetContractId(base) === idA
                        ? baseAmountInt / counterAmountInt
                        : counterAmountInt / baseAmountInt;
                }

                throw new Error('getPoolReserves fail');
            });
    }

    getDepositTx(
        accountId: string,
        poolId: string,
        a: Asset,
        b: Asset,
        aAmount: string,
        bAmount: string,
    ) {
        const idA = this.getAssetContractId(a);
        const idB = this.getAssetContractId(b);

        const [base, counter] = idA > idB ? [b, a] : [a, b];
        const [baseAmount, counterAmount] = idA > idB ? [bAmount, aAmount] : [aAmount, bAmount];

        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.DEPOSIT,
            this.publicKeyToScVal(this.keypair.publicKey()),
            this.assetToScVal(base),
            this.assetToScVal(counter),
            this.amountToScVal(baseAmount),
            this.amountToScVal('0'),
            this.amountToScVal(counterAmount),
            this.amountToScVal('0'),
        ).then((tx) => this.server.prepareTransaction(tx));
    }

    getWithdrawTx(
        accountId: string,
        poolId: string,
        base: Asset,
        counter: Asset,
        baseAmount: string,
        counterAmount: string,
        shareId: string,
        shareAmount: string,
    ) {
        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.WITHDRAW,
            this.publicKeyToScVal(this.keypair.publicKey()),
            this.assetToScVal(base),
            this.assetToScVal(counter),
            this.amountToScVal(shareAmount),
            this.amountToScVal(baseAmount),
            this.amountToScVal(counterAmount),
        ).then((tx) => this.server.prepareTransaction(tx));
    }

    getSwapEstimatedAmount(accountId: string, sell: Asset, buy: Asset, amount: string) {
        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.ESTIMATE_SWAP_OUT,
            this.assetToScVal(sell),
            this.assetToScVal(buy),
            this.amountToScVal(amount),
        )
            .then(
                (tx) =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return this.i128ToInt(result.retval.value() as xdr.Int128Parts);
                }

                throw new Error('getSwapEstimatedAmount error');
            });
    }

    getSwapTx(
        accountId: string,
        poolId: string,
        base: Asset,
        counter: Asset,
        amount: string,
        maxBaseAmount: string,
    ) {
        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.SWAP,
            this.publicKeyToScVal(this.keypair.publicKey()),
            this.assetToScVal(base),
            this.assetToScVal(counter),
            this.amountToScVal(amount),
            this.amountToScVal(maxBaseAmount),
        ).then((tx) => this.server.prepareTransaction(tx));
    }

    buildSmartContactTx(publicKey, contactId, method, ...args) {
        return this.server.getAccount(publicKey).then((acc) => {
            const contract = new SorobanClient.Contract(contactId);

            const builtTx = new SorobanClient.TransactionBuilder(acc, {
                fee: BASE_FEE,
                networkPassphrase: SorobanClient.Networks.TESTNET,
            });

            if (args) {
                builtTx.addOperation(contract.call(method, ...args));
            } else {
                builtTx.addOperation(contract.call(method));
            }

            return builtTx.setTimeout(SorobanClient.TimeoutInfinite).build();
        });
    }

    signWithSecret(tx: SorobanClient.Transaction) {
        tx.sign(this.keypair);
        return tx;
    }

    submitTx(tx: SorobanClient.Transaction) {
        return this.server.sendTransaction(tx).then((res) => this.processResponse(res));
    }

    simulateTx(tx: SorobanClient.Transaction) {
        return this.server.simulateTransaction(tx);
    }

    private startServer(): void {
        this.server = new SorobanClient.Server(SOROBAN_SERVER);
    }

    contractIdToScVal(contractId) {
        return xdr.ScVal.scvAddress(
            SorobanClient.Address.contract(StrKey.decodeContract(contractId)).toScAddress(),
        );
    }

    private assetToScVal(asset: Asset): xdr.ScVal {
        return xdr.ScVal.scvAddress(
            SorobanClient.Address.contract(
                StrKey.decodeContract(this.getAssetContractId(asset)),
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
