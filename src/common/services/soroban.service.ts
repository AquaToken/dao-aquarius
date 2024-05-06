import * as StellarSdk from '@stellar/stellar-sdk';
import { sha256 } from 'js-sha256';
import binascii from 'binascii';
import { xdr, Asset, Keypair, BASE_FEE, StrKey } from '@stellar/stellar-sdk';
import SendTransactionResponse = StellarSdk.SorobanRpc.Api.SendTransactionResponse;
import SimulateTransactionSuccessResponse = StellarSdk.SorobanRpc.Api.SimulateTransactionSuccessResponse;
import { ModalService, SorobanService, ToastService } from './globalServices';
import RestoreContractModal from '../modals/RestoreContractModal/RestoreContractModal';

const SOROBAN_SERVER = 'https://soroban-testnet.stellar.org:443';
export const AMM_SMART_CONTACT_ID = 'CB7S3KMZ2GP46YU72WJKXFMSFLUB3MZYQL3LSIZMYTQTXIAS2EXUEANC';

enum AMM_CONTRACT_METHOD {
    GET_POOLS = 'get_pools',
    INIT_CONSTANT_POOL = 'init_standard_pool',
    INIT_STABLESWAP_POOL = 'init_stableswap_pool',
    DEPOSIT = 'deposit',
    SHARE_ID = 'share_id',
    ESTIMATE_SWAP_ROUTED = 'estimate_swap_routed',
    WITHDRAW = 'withdraw',
    SWAP = 'swap',
    GET_RESERVES = 'get_reserves',
    POOL_TYPE = 'pool_type',
    FEE_FRACTION = 'get_fee_fraction',
    GET_REWARDS_INFO = 'get_rewards_info',
    GET_INFO = 'get_info',
    GET_USER_REWARD = 'get_user_reward',
    GET_TOTAL_SHARES = 'get_total_shares',
    CLAIM = 'claim',
}

enum ASSET_CONTRACT_METHOD {
    GET_ALLOWANCE = 'allowance',
    APPROVE_ALLOWANCE = 'approve',
    GET_BALANCE = 'balance',
    NAME = 'name',
}

const ACCOUNT_FOR_SIMULATE = 'GCWUCUPZL3OEIKS4ATWSFRZNQC5X4JS3MVFNUZBKYFNJKIMHNMFEF33H';

const issuerKeypair = StellarSdk.Keypair.fromSecret(
    'SBPQCB4DOUQ26OC43QNAA3ODZOGECHJUVHDHYRHKYPL4SA22RRYGHQCX',
);
const USDT = new StellarSdk.Asset('USDT', issuerKeypair.publicKey());
const USDC = new StellarSdk.Asset('USDC', issuerKeypair.publicKey());
const ETH = new StellarSdk.Asset('ETH', issuerKeypair.publicKey());
const BTC = new StellarSdk.Asset('BTC', issuerKeypair.publicKey());
const AQUA = new StellarSdk.Asset('AQUA', issuerKeypair.publicKey());

export enum CONTRACT_STATUS {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    NOT_FOUND = 'not_found',
}

export default class SorobanServiceClass {
    server: StellarSdk.SorobanRpc.Server | null = null;
    keypair: Keypair | null = null;
    assetsCache = new Map<string, Asset>();

    constructor() {
        this.startServer();
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

    getAddTrustTx(accountId: string) {
        return this.server.getAccount(accountId).then((acc) => {
            return new StellarSdk.TransactionBuilder(acc, {
                fee: BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(
                    StellarSdk.Operation.changeTrust({
                        asset: USDC,
                    }),
                )
                .addOperation(
                    StellarSdk.Operation.changeTrust({
                        asset: USDT,
                    }),
                )
                .addOperation(
                    StellarSdk.Operation.changeTrust({
                        asset: AQUA,
                    }),
                )
                .addOperation(
                    StellarSdk.Operation.changeTrust({
                        asset: BTC,
                    }),
                )
                .addOperation(
                    StellarSdk.Operation.changeTrust({
                        asset: ETH,
                    }),
                )
                .setTimeout(StellarSdk.TimeoutInfinite)
                .build();
        });
    }

    getTestAssets(accountId) {
        return this.server.getAccount(issuerKeypair.publicKey()).then((issuer) => {
            const transaction = new StellarSdk.TransactionBuilder(issuer, {
                fee: BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: accountId,
                        asset: USDT,
                        amount: '10000',
                    }),
                )
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: accountId,
                        asset: USDC,
                        amount: '10000',
                    }),
                )
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: accountId,
                        asset: ETH,
                        amount: '10000',
                    }),
                )
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: accountId,
                        asset: BTC,
                        amount: '10000',
                    }),
                )
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: accountId,
                        asset: AQUA,
                        amount: '1000000',
                    }),
                )
                .setTimeout(StellarSdk.TimeoutInfinite)
                .build();

            transaction.sign(issuerKeypair);
            return this.submitTx(transaction);
        });
    }

    processResponse(response: SendTransactionResponse, tx: StellarSdk.Transaction) {
        if (response.status === 'DUPLICATE') {
            return this.getTx(response.hash, tx);
        }
        if (response.status !== 'PENDING') {
            ToastService.showErrorToast(response.status);

            throw new Error(response.status);
        }
        return this.getTx(response.hash, tx);
    }

    getTx(hash: string, tx: StellarSdk.Transaction, resolver?: (value?: any) => void) {
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

    async tryRestore(tx: StellarSdk.Transaction) {
        const sim = await this.server.simulateTransaction(tx);

        // @ts-ignore
        if (!sim.restorePreamble) {
            return;
        }

        const account = await this.server.getAccount(tx.source);
        let fee = parseInt(BASE_FEE);
        // @ts-ignore
        fee += parseInt(sim.restorePreamble.minResourceFee);

        const restoreTx = new StellarSdk.TransactionBuilder(account, { fee: fee.toString() })
            .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
            // @ts-ignore
            .setSorobanData(sim.restorePreamble.transactionData.build())
            .addOperation(StellarSdk.Operation.restoreFootprint({}))
            .setTimeout(StellarSdk.TimeoutInfinite)
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
        const networkId: Buffer = Buffer.from(sha256.arrayBuffer(StellarSdk.Networks.TESTNET));

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
        return StellarSdk.StrKey.encodeContract(Buffer.from(binascii.unhexlify(hash), 'ascii'));
    }

    getAssetContractId(asset: Asset): string {
        const hash = this.getAssetContractHash(asset);

        return this.getContactIdFromHash(hash);
    }
    getAssetFromContractId(id: string): Promise<Asset> {
        if (this.assetsCache.has(id)) {
            return Promise.resolve(this.assetsCache.get(id));
        }
        return (
            this.buildSmartContactTx(ACCOUNT_FOR_SIMULATE, id, ASSET_CONTRACT_METHOD.NAME)
                .then((tx) => this.simulateTx(tx))
                // @ts-ignore
                .then(({ result }) => {
                    const [code, issuer] = result.retval.value().toString().split(':');
                    const asset = issuer
                        ? new StellarSdk.Asset(code, issuer)
                        : StellarSdk.Asset.native();

                    this.assetsCache.set(id, asset);

                    return asset;
                })
        );
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

        return this.server
            .getLedgerEntries(contractKey)
            .then(({ entries, latestLedger }) => {
                if (!entries?.length) {
                    return {
                        status: CONTRACT_STATUS.NOT_FOUND,
                        ledgersBeforeExpire: 0,
                    };
                }

                const [entry] = entries;

                // @ts-ignore
                const contractExp = entry.liveUntilLedgerSeq;

                return {
                    status:
                        contractExp > latestLedger
                            ? CONTRACT_STATUS.ACTIVE
                            : CONTRACT_STATUS.EXPIRED,
                    ledgersBeforeExpire: Math.max(contractExp - latestLedger, 0),
                };
            })
            .catch((e) => {
                console.log(e);
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
                const tx = new StellarSdk.TransactionBuilder(acc, {
                    fee: BASE_FEE,
                    networkPassphrase: StellarSdk.Networks.TESTNET,
                });

                tx.addOperation(
                    StellarSdk.Operation.createStellarAssetContract({
                        asset,
                    }),
                );

                return tx.setTimeout(StellarSdk.TimeoutInfinite).build();
            })
            .then((tx) => this.server.prepareTransaction(tx));
    }

    restoreAssetContractTx(publicKey: string, asset: Asset) {
        const contractId = this.getAssetContractId(asset);

        const contract = new StellarSdk.Contract(contractId);

        return this.server
            .getAccount(publicKey)
            .then((acc) => {
                return new StellarSdk.TransactionBuilder(acc, {
                    fee: BASE_FEE,
                    networkPassphrase: StellarSdk.Networks.TESTNET,
                })
                    .addOperation(StellarSdk.Operation.restoreFootprint({}))
                    .setSorobanData(
                        new StellarSdk.SorobanDataBuilder()
                            .setReadWrite([contract.getFootprint()])
                            .build(),
                    )
                    .setTimeout(StellarSdk.TimeoutInfinite)
                    .build();
            })
            .then((tx) => this.server.prepareTransaction(tx));
    }

    bumpAssetContractTx(publicKey: string, asset: Asset) {
        const contractId = this.getAssetContractId(asset);

        const contract = new StellarSdk.Contract(contractId);

        return this.server
            .getAccount(publicKey)
            .then((acc) => {
                return new StellarSdk.TransactionBuilder(acc, {
                    fee: BASE_FEE,
                    networkPassphrase: StellarSdk.Networks.TESTNET,
                })
                    .addOperation(
                        StellarSdk.Operation.extendFootprintTtl({
                            extendTo: 500000,
                        }),
                    )
                    .setSorobanData(
                        new StellarSdk.SorobanDataBuilder()
                            .setReadOnly([contract.getFootprint()])
                            .build(),
                    )
                    .setTimeout(StellarSdk.TimeoutInfinite)
                    .build();
            })
            .then((tx) => this.server.prepareTransaction(tx));
    }

    getPools(base: Asset, counter: Asset): Promise<null | Array<any>> {
        const [aId, bId] = this.orderTokenIDS(base, counter);

        return this.buildSmartContactTx(
            ACCOUNT_FOR_SIMULATE,
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
            new StellarSdk.XdrLargeInt('u128', Number(a).toFixed()).toU128(),
            this.amountToUint32(fee * 100),
            this.amountToUint32(0),
        ).then((tx) => this.server.prepareTransaction(tx));
    }

    getPoolShareId(poolId: string) {
        return this.buildSmartContactTx(ACCOUNT_FOR_SIMULATE, poolId, AMM_CONTRACT_METHOD.SHARE_ID)
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
                        const key = val.key().value().toString();
                        if (key === 'exp_at' || key === 'last_time') {
                            acc[key] = this.i128ToInt(val.val().value()) * 1e7;
                            return acc;
                        }
                        acc[key] = this.i128ToInt(val.val().value());
                        return acc;
                    }, {});
                }

                throw new Error('getPoolRewards error');
            });
    }

    getPoolInfo(accountId: string, poolId: string) {
        return this.buildSmartContactTx(accountId, poolId, AMM_CONTRACT_METHOD.GET_INFO)
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
                        acc[val.key().value().toString()] =
                            typeof val.val().value() === 'number'
                                ? val.val().value()
                                : val.val().value().hi
                                ? this.i128ToInt(val.val().value())
                                : val.val().value().toString();

                        return acc;
                    }, {});
                }

                throw new Error('getPoolRewards error');
            });
    }

    getTotalShares(poolId: string) {
        return this.buildSmartContactTx(
            ACCOUNT_FOR_SIMULATE,
            poolId,
            AMM_CONTRACT_METHOD.GET_TOTAL_SHARES,
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

                throw new Error('getTotalShares error');
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
        return this.getPoolShareId(poolId)
            .then((shareHash) => {
                return Promise.all([
                    this.getContactIdFromHash(shareHash),
                    this.getTokenBalance(this.getContactIdFromHash(shareHash), accountId),
                    this.getTokenBalance(base, poolId),
                    this.getTokenBalance(counter, poolId),
                    this.getPoolRewards(accountId, base, counter, poolId),
                    this.getPoolInfo(accountId, poolId),
                    this.getTotalShares(poolId),
                ]);
            })
            .then(
                ([shareId, share, baseAmount, counterAmount, rewardsData, info, totalShares]) => ({
                    id: poolId,
                    bytes: poolBytes,
                    base,
                    counter,
                    share,
                    shareId,
                    baseAmount,
                    counterAmount,
                    rewardsData,
                    info,
                    totalShares,
                }),
            );
    }

    getTokenBalance(token: Asset | string, where: string) {
        return this.buildSmartContactTx(
            ACCOUNT_FOR_SIMULATE,
            typeof token === 'string' ? token : this.getAssetContractId(token),
            ASSET_CONTRACT_METHOD.GET_BALANCE,
            StellarSdk.StrKey.isValidEd25519PublicKey(where)
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
        poolHash: string,
        a: Asset,
        b: Asset,
        aAmount: string,
        bAmount: string,
    ) {
        const idA = this.getAssetContractId(a);
        const idB = this.getAssetContractId(b);

        const [baseAmount, counterAmount] = idA > idB ? [bAmount, aAmount] : [aAmount, bAmount];
        const [base, counter] = idA > idB ? [b, a] : [a, b];

        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.DEPOSIT,
            this.publicKeyToScVal(accountId),
            this.scValToArray([this.assetToScVal(base), this.assetToScVal(counter)]),
            this.hashToScVal(poolHash),
            this.scValToArray([
                this.amountToUint128(baseAmount),
                this.amountToUint128(counterAmount),
            ]),
            this.amountToUint128('0'),
        ).then((tx) => {
            console.log(tx.toEnvelope().toXDR('base64'));
            return this.server.prepareTransaction(tx);
        });
    }

    getWithdrawTx(accountId: string, poolHash: string, shareAmount: string, a: Asset, b: Asset) {
        const idA = this.getAssetContractId(a);
        const idB = this.getAssetContractId(b);
        const [base, counter] = idA > idB ? [b, a] : [a, b];
        return this.buildSmartContactTx(
            accountId,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.WITHDRAW,
            this.publicKeyToScVal(accountId),
            this.scValToArray([this.assetToScVal(base), this.assetToScVal(counter)]),
            this.hashToScVal(poolHash),
            this.amountToUint128(shareAmount),
            this.scValToArray([
                this.amountToUint128('0.0000001'),
                this.amountToUint128('0.0000001'),
            ]),
        ).then((tx) => this.server.prepareTransaction(tx));
    }

    estimateSwap(base: Asset, counter: Asset, amount: string) {
        const idA = this.getAssetContractId(base);
        const idB = this.getAssetContractId(counter);

        const [a, b] = idA > idB ? [counter, base] : [base, counter];

        return this.buildSmartContactTx(
            ACCOUNT_FOR_SIMULATE,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.ESTIMATE_SWAP_ROUTED,
            this.scValToArray([this.assetToScVal(a), this.assetToScVal(b)]),
            this.assetToScVal(base),
            this.assetToScVal(counter),
            this.amountToUint128(amount),
        )
            .then((tx) => {
                return this.server.simulateTransaction(
                    tx,
                ) as Promise<SimulateTransactionSuccessResponse>;
            })
            .then(({ result }) => {
                if (result) {
                    // @ts-ignore
                    return result.retval.value();
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
            const contract = new StellarSdk.Contract(contactId);

            const builtTx = new StellarSdk.TransactionBuilder(acc, {
                fee: BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            });

            if (args) {
                builtTx.addOperation(contract.call(method, ...args));
            } else {
                builtTx.addOperation(contract.call(method));
            }

            return builtTx.setTimeout(StellarSdk.TimeoutInfinite).build();
        });
    }

    signWithSecret(tx: StellarSdk.Transaction) {
        tx.sign(this.keypair);
        return tx;
    }

    submitTx(tx: StellarSdk.Transaction) {
        return this.server.sendTransaction(tx).then((res) => this.processResponse(res, tx));
    }

    simulateTx(tx: StellarSdk.Transaction) {
        return this.server.simulateTransaction(tx);
    }

    private startServer(): void {
        this.server = new StellarSdk.SorobanRpc.Server(SOROBAN_SERVER);
    }

    contractIdToScVal(contractId) {
        return StellarSdk.Address.contract(StrKey.decodeContract(contractId)).toScVal();
    }

    scValToArray(array: xdr.ScVal[]): xdr.ScVal {
        return xdr.ScVal.scvVec(array);
    }

    private assetToScVal(asset: Asset): xdr.ScVal {
        return xdr.ScVal.scvAddress(
            StellarSdk.Address.contract(
                StrKey.decodeContract(this.getAssetContractId(asset)),
            ).toScAddress(),
        );
    }

    private publicKeyToScVal(pubkey: string): xdr.ScVal {
        return xdr.ScVal.scvAddress(StellarSdk.Address.fromString(pubkey).toScAddress());
    }

    amountToUint32(amount: number): xdr.ScVal {
        return xdr.ScVal.scvU32(amount);
    }

    amountToToInt128(amount: string): xdr.ScVal {
        return new StellarSdk.XdrLargeInt('u128', (Number(amount) * 1e7).toFixed()).toI128();
    }

    amountToUint128(amount: string): xdr.ScVal {
        return new StellarSdk.XdrLargeInt('u128', (Number(amount) * 1e7).toFixed()).toU128();
    }

    bytesToScVal(bytes: Buffer): xdr.ScVal {
        return xdr.ScVal.scvBytes(bytes);
    }

    hashToScVal(hash: string): xdr.ScVal {
        return xdr.ScVal.scvBytes(Buffer.from(binascii.unhexlify(hash), 'ascii'));
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
