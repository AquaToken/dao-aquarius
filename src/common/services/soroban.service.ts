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
import { ModalService, SorobanService, ToastService } from './globalServices';
import RestoreContractModal from '../modals/RestoreContractModal/RestoreContractModal';

const SOROBAN_SERVER = 'https://soroban-testnet.stellar.org:443';
export const AMM_SMART_CONTACT_ID = 'CBWWK4RPMA5MPKKJJSR2PBKXGXBJQ6SDX5T7V4LDZCJU4V7BNJXVFY4L';

enum AMM_CONTRACT_METHOD {
    GET_POOLS = 'get_pools',
    INIT_CONSTANT_POOL = 'init_standard_pool',
    INIT_STABLESWAP_POOL = 'init_stableswap_pool',
    DEPOSIT = 'deposit',
    SHARE_ID = 'share_id',
    ESTIMATE_SWAP = 'estimate_swap',
    WITHDRAW = 'withdraw',
    SWAP = 'swap',
    GET_RESERVES = 'get_reserves',
    POOL_TYPE = 'pool_type',
    FEE_FRACTION = 'get_fee_fraction',
    GET_REWARDS_INFO = 'get_rewards_info',
    GET_USER_REWARD = 'get_user_reward',
    CLAIM = 'claim',
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
const AQUA = new SorobanClient.Asset('AQUA', issuerKeypair.publicKey());

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
                        asset: AQUA,
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
                .addOperation(
                    SorobanClient.Operation.payment({
                        destination: accountId,
                        asset: AQUA,
                        amount: '1000000',
                    }),
                )
                .setTimeout(SorobanClient.TimeoutInfinite)
                .build();

            transaction.sign(issuerKeypair);
            return this.submitTx(transaction);
        });
    }

    processResponse(response: SendTransactionResponse, tx: SorobanClient.Transaction) {
        if (response.status === 'DUPLICATE') {
            return this.getTx(response.hash, tx);
        }
        if (response.status !== 'PENDING') {
            ToastService.showErrorToast(response.status);

            throw new Error(response.status);
        }
        return this.getTx(response.hash, tx);
    }

    getTx(hash: string, tx: SorobanClient.Transaction, resolver?: (value?: any) => void) {
        return this.server.getTransaction(hash).then((res) => {
            console.log('TX', res);
            if (res.status === 'SUCCESS') {
                if (resolver) {
                    resolver(res.returnValue);
                }
                return;
            }

            if (res.status === 'FAILED') {
                this.tryRestore(tx);
                if (resolver) {
                    resolver();
                }
                return ToastService.showErrorToast('Transaction was failed');
            }

            if (resolver) {
                return setTimeout(() => this.getTx(hash, tx, resolver), 1000);
            }

            return new Promise((resolve) => {
                setTimeout(() => this.getTx(hash, tx, resolve), 1000);
            });
        });
    }

    async tryRestore(tx: SorobanClient.Transaction) {
        const sim = await this.server.simulateTransaction(tx);

        // @ts-ignore
        if (!sim.restorePreamble) {
            return;
        }

        const account = await this.server.getAccount(tx.source);
        let fee = parseInt(BASE_FEE);
        // @ts-ignore
        fee += parseInt(sim.restorePreamble.minResourceFee);

        const restoreTx = new SorobanClient.TransactionBuilder(account, { fee: fee.toString() })
            .setNetworkPassphrase(SorobanClient.Networks.TESTNET)
            // @ts-ignore
            .setSorobanData(sim.restorePreamble.transactionData.build())
            .addOperation(SorobanClient.Operation.restoreFootprint({}))
            .setTimeout(SorobanClient.TimeoutInfinite)
            .build();

        ModalService.openModal(RestoreContractModal, { tx: restoreTx });
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
                return assembleTransaction(tx, SorobanClient.Networks.TESTNET, result).build();
            });
    }

    getPools(accountId: string, base: Asset, counter: Asset): Promise<null | Array<any>> {
        const [aId, bId] = this.orderTokenIDS(base, counter);

        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.GET_POOLS,
            this.scValToArray([this.contractIdToScVal(aId), this.contractIdToScVal(bId)]),
        )
            .then(
                (tx) =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<SimulateTransactionSuccessResponse>,
            )
            .then((res) => {
                if (!res.result) {
                    return [];
                }

                const hashArray = res.result.retval.value() as Array<any>;

                if (!hashArray.length) {
                    return [];
                }

                return hashArray.map((item) => [
                    SorobanService.getContactIdFromHash(item.val().value().value().toString('hex')),
                    item.key().value(),
                ]);
            });
    }

    getInitConstantPoolTx(accountId: string, base: Asset, counter: Asset, fee: number) {
        const [aId, bId] = this.orderTokenIDS(base, counter);

        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.INIT_CONSTANT_POOL,
            this.publicKeyToScVal(accountId),
            this.scValToArray([this.contractIdToScVal(aId), this.contractIdToScVal(bId)]),
            this.amountToUint32(fee),
        ).then((tx) => this.server.prepareTransaction(tx));
    }

    getInitStableSwapPoolTx(
        accountId: string,
        base: Asset,
        counter: Asset,
        a: number,
        fee: number,
    ) {
        const [aId, bId] = this.orderTokenIDS(base, counter);

        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.INIT_STABLESWAP_POOL,
            this.publicKeyToScVal(accountId),
            this.scValToArray([this.contractIdToScVal(aId), this.contractIdToScVal(bId)]),
            this.amountToUint128(a.toFixed(7)),
            this.amountToUint32(fee * 100),
            this.amountToUint32(0),
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

    getPoolType(accountId, poolId: string) {
        return this.buildSmartContactTx(accountId, poolId, AMM_CONTRACT_METHOD.POOL_TYPE)
            .then(
                (tx) =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    // @ts-ignore
                    return result.retval.value().toString();
                }

                throw new Error('getPoolType error');
            });
    }

    getPoolFee(accountId, poolId: string) {
        return this.buildSmartContactTx(accountId, poolId, AMM_CONTRACT_METHOD.FEE_FRACTION)
            .then(
                (tx) =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    // @ts-ignore
                    return result.retval.value().toString();
                }

                throw new Error('getPoolFee error');
            });
    }

    getPoolRewards(accountId: string, base: Asset, counter: Asset, poolId: string) {
        return this.buildSmartContactTx(
            accountId,
            poolId,
            AMM_CONTRACT_METHOD.GET_REWARDS_INFO,
            this.publicKeyToScVal(accountId),
        )
            .then(
                (tx) =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    // @ts-ignore
                    return result.retval.value().reduce((acc, val) => {
                        acc[val.key().value().toString()] = this.i128ToInt(val.val().value());
                        return acc;
                    }, {});
                }

                throw new Error('getPoolRewards error');
            });
    }

    getUserRewardsAmount(accountId: string, poolId: string) {
        return this.buildSmartContactTx(
            accountId,
            poolId,
            AMM_CONTRACT_METHOD.GET_USER_REWARD,
            this.publicKeyToScVal(accountId),
        )
            .then(
                (tx) =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    // @ts-ignore
                    return this.i128ToInt(result.retval.value());
                }

                throw new Error('getUserRewardsAmount error');
            });
    }

    claimRewards(accountId: string, poolId: string) {
        return this.buildSmartContactTx(
            accountId,
            poolId,
            AMM_CONTRACT_METHOD.CLAIM,
            this.publicKeyToScVal(accountId),
        ).then((tx) => this.server.prepareTransaction(tx));
    }

    getPoolData(accountId: string, base: Asset, counter: Asset, [poolId, poolBytes]) {
        return this.getPoolShareId(accountId, poolId)
            .then((shareHash) => {
                return Promise.all([
                    this.getContactIdFromHash(shareHash),
                    this.getTokenBalance(
                        accountId,
                        this.getContactIdFromHash(shareHash),
                        accountId,
                    ),
                    this.getTokenBalance(accountId, base, poolId),
                    this.getTokenBalance(accountId, counter, poolId),
                    this.getPoolType(accountId, poolId),
                    this.getPoolRewards(accountId, base, counter, poolId),
                    this.getPoolFee(accountId, poolId),
                ]);
            })
            .then(([shareId, share, baseAmount, counterAmount, type, rewardsData, fee]) => ({
                id: poolId,
                bytes: poolBytes,
                base,
                counter,
                share,
                shareId,
                baseAmount,
                counterAmount,
                type,
                rewardsData,
                fee,
            }));
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
                this.publicKeyToScVal(accountId),
                this.contractIdToScVal(poolId),
                this.amountToToInt128(amount),
                xdr.ScVal.scvU32(sequence + 477533),
            ).then((tx) => {
                return this.server.prepareTransaction(tx);
            });
        });
    }

    getPoolPrice(accountId: string, a: Asset, b: Asset, poolId: string) {
        const idA = this.getAssetContractId(a);
        const idB = this.getAssetContractId(b);
        const [base] = idA > idB ? [b, a] : [a, b];

        return this.buildSmartContactTx(accountId, poolId, AMM_CONTRACT_METHOD.GET_RESERVES)
            .then((tx) => {
                return this.simulateTx(tx) as Promise<SimulateTransactionSuccessResponse>;
            })
            .then(({ result }) => {
                if (result) {
                    // @ts-ignore
                    const [baseAmount, counterAmount] = result.retval.value();

                    const baseAmountInt = this.i128ToInt(baseAmount.value());
                    const counterAmountInt = this.i128ToInt(counterAmount.value());

                    return this.getAssetContractId(base) === idA
                        ? baseAmountInt / counterAmountInt
                        : counterAmountInt / baseAmountInt;
                }

                throw new Error('getPoolPrice fail');
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

        const [baseAmount, counterAmount] = idA > idB ? [bAmount, aAmount] : [aAmount, bAmount];

        return this.buildSmartContactTx(
            accountId,
            poolId,
            AMM_CONTRACT_METHOD.DEPOSIT,
            this.publicKeyToScVal(accountId),
            this.scValToArray([
                this.amountToUint128(baseAmount),
                this.amountToUint128(counterAmount),
            ]),
        ).then((tx) => this.server.prepareTransaction(tx));
    }

    getWithdrawTx(accountId: string, poolId: string, shareAmount: string) {
        return this.buildSmartContactTx(
            accountId,
            poolId,
            AMM_CONTRACT_METHOD.WITHDRAW,
            this.publicKeyToScVal(accountId),
            this.amountToUint128(shareAmount),
            this.scValToArray([
                this.amountToUint128('0.0000001'),
                this.amountToUint128('0.0000001'),
            ]),
        ).then((tx) => this.server.prepareTransaction(tx));
    }

    getSwapEstimatedAmount(
        accountId: string,
        base: Asset,
        counter: Asset,
        pools: [string, Buffer][],
        amount: string,
    ) {
        return Promise.all(
            pools.map(([poolId, poolBytes]) =>
                this.getSwapEstimatedAmountForPool(
                    accountId,
                    base,
                    counter,
                    poolBytes,
                    poolId,
                    amount,
                ),
            ),
        ).then((amounts) => {
            const index = amounts.indexOf(Math.max(...amounts));
            return {
                pool: pools[index],
                amount: amounts[index],
            };
        });
    }

    getSwapEstimatedAmountForPool(
        accountId: string,
        base: Asset,
        counter: Asset,
        poolBytes: Buffer,
        poolId: string,
        amount: string,
    ) {
        const idA = this.getAssetContractId(base);
        const idB = this.getAssetContractId(counter);

        const [a, b] = idA > idB ? [counter, base] : [base, counter];

        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.ESTIMATE_SWAP,
            this.scValToArray([this.assetToScVal(a), this.assetToScVal(b)]),
            this.assetToScVal(base),
            this.assetToScVal(counter),
            this.bytesToScVal(poolBytes),
            this.amountToUint128(amount),
        )
            .then((tx) => {
                return this.server.simulateTransaction(
                    tx,
                ) as Promise<SimulateTransactionSuccessResponse>;
            })
            .then(({ result }) => {
                if (result) {
                    return this.i128ToInt(result.retval.value() as xdr.Int128Parts);
                }

                return 0;
            });
    }

    getSwapTx(
        accountId: string,
        poolBytes: Buffer,
        base: Asset,
        counter: Asset,
        amount: string,
        minCounterAmount: string,
    ) {
        const idA = this.getAssetContractId(base);
        const idB = this.getAssetContractId(counter);

        const [a, b] = idA > idB ? [counter, base] : [base, counter];

        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.SWAP,
            this.publicKeyToScVal(accountId),
            this.scValToArray([this.assetToScVal(a), this.assetToScVal(b)]),
            this.assetToScVal(base),
            this.assetToScVal(counter),
            this.bytesToScVal(poolBytes),
            this.amountToUint128(amount),
            this.amountToUint128(minCounterAmount),
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
        return this.server.sendTransaction(tx).then((res) => this.processResponse(res, tx));
    }

    simulateTx(tx: SorobanClient.Transaction) {
        return this.server.simulateTransaction(tx);
    }

    private startServer(): void {
        this.server = new SorobanClient.Server(SOROBAN_SERVER);
    }

    contractIdToScVal(contractId) {
        return SorobanClient.Address.contract(StrKey.decodeContract(contractId)).toScVal();
    }

    scValToArray(array: xdr.ScVal[]): xdr.ScVal {
        return xdr.ScVal.scvVec(array);
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

    amountToUint32(amount: number): xdr.ScVal {
        return xdr.ScVal.scvU32(amount);
    }

    amountToToInt128(amount: string): xdr.ScVal {
        return new SorobanClient.XdrLargeInt('u128', (Number(amount) * 1e7).toFixed()).toI128();
    }

    amountToUint128(amount: string): xdr.ScVal {
        return new SorobanClient.XdrLargeInt('u128', (Number(amount) * 1e7).toFixed()).toU128();
    }

    bytesToScVal(bytes: Buffer): xdr.ScVal {
        return xdr.ScVal.scvBytes(bytes);
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
