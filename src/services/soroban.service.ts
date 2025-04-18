import * as StellarSdk from '@stellar/stellar-sdk';
import { xdr, Asset, Keypair, BASE_FEE, StrKey } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';
import binascii from 'binascii';
import { sha256 } from 'js-sha256';

import { CONTRACTS } from 'constants/soroban';

import { getAssetString } from 'helpers/assets';
import { getEnv, getNetworkPassphrase } from 'helpers/env';
import { SorobanErrorHandler, SorobanPrepareTxErrorHandler } from 'helpers/error-handler';
import { getSorobanUrl } from 'helpers/url';

import { PoolRewardsInfo } from 'types/amm';

import RestoreContractModal from 'web/modals/RestoreContractModal';

import { ModalService, ToastService } from './globalServices';

const AMM_SMART_CONTACT_ID = CONTRACTS[getEnv()].amm;
const BATCH_SMART_CONTACT_ID = CONTRACTS[getEnv()].batch;

enum AMM_CONTRACT_METHOD {
    GET_POOLS = 'get_pools',
    INIT_CONSTANT_POOL = 'init_standard_pool',
    INIT_STABLESWAP_POOL = 'init_stableswap_pool',
    DEPOSIT = 'deposit',
    SHARE_ID = 'share_id',
    ESTIMATE_SWAP_ROUTED = 'estimate_swap_routed',
    WITHDRAW = 'withdraw',
    SWAP = 'swap',
    SWAP_CHAINED = 'swap_chained',
    SWAP_CHAINED_RECEIVE = 'swap_chained_strict_receive',
    GET_RESERVES = 'get_reserves',
    POOL_TYPE = 'pool_type',
    FEE_FRACTION = 'get_fee_fraction',
    GET_REWARDS_INFO = 'get_rewards_info',
    GET_INFO = 'get_info',
    GET_USER_REWARD = 'get_user_reward',
    GET_TOTAL_SHARES = 'get_total_shares',
    CLAIM = 'claim',
    GET_STABLE_CREATION_FEE = 'get_stable_pool_payment_amount',
    GET_CONSTANT_CREATION_FEE = 'get_standard_pool_payment_amount',
    GET_CREATION_FEE_TOKEN = 'get_init_pool_payment_token',
    GET_INIT_POOL_DESTINATION = 'get_init_pool_payment_address',
}

enum BATCH_CONTRACT_METHOD {
    batch = 'batch',
}

enum ASSET_CONTRACT_METHOD {
    GET_ALLOWANCE = 'allowance',
    APPROVE_ALLOWANCE = 'approve',
    GET_BALANCE = 'balance',
    NAME = 'name',
    TRANSFER = 'transfer',
    BURN = 'burn',
}

// First stellar account:)
const ACCOUNT_FOR_SIMULATE = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';

export enum CONTRACT_STATUS {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    NOT_FOUND = 'not_found',
}

export enum POOL_TYPE {
    stable = 'stable',
    constant = 'constant_product',
    classic = 'classic',
}

export default class SorobanServiceClass {
    server: StellarSdk.rpc.Server | null = null;
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

    processResponse(
        response: StellarSdk.rpc.Api.SendTransactionResponse,
        tx: StellarSdk.Transaction,
    ) {
        if (response.status === 'DUPLICATE') {
            return this.getTx(response.hash, tx);
        }
        if (response.status !== 'PENDING') {
            throw new Error(SorobanErrorHandler(response.errorResult.result().switch().name));
        }
        return this.getTx(response.hash, tx);
    }

    getTx(
        hash: string,
        tx: StellarSdk.Transaction,
        resolver?: (value?: unknown) => void,
        rejecter?: () => void,
    ) {
        return this.server.getTransaction(hash).then(res => {
            if (res.status === 'SUCCESS') {
                if (resolver) {
                    resolver(res.returnValue);
                }
                return;
            }

            if (res.status === 'FAILED') {
                if (rejecter) {
                    rejecter();
                }
                ToastService.showErrorToast('Transaction was failed');
                return;
            }

            if (resolver) {
                return setTimeout(() => this.getTx(hash, tx, resolver, rejecter), 1000);
            }

            return new Promise((resolve, reject) => {
                setTimeout(() => this.getTx(hash, tx, resolve, reject), 1000);
            });
        });
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

    getAsset(code, issuer): Asset {
        if (!issuer) {
            return Asset.native();
        }

        return new Asset(code, issuer);
    }

    getAssetContractHash(asset: Asset): string {
        const networkId: Buffer = Buffer.from(sha256.arrayBuffer(getNetworkPassphrase()));

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
        return this.buildSmartContactTx(ACCOUNT_FOR_SIMULATE, id, ASSET_CONTRACT_METHOD.NAME)
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                const [code, issuer] = (result.retval.value() as unknown).toString().split(':');
                const asset = issuer
                    ? new StellarSdk.Asset(code, issuer)
                    : StellarSdk.Asset.native();

                this.assetsCache.set(id, asset);

                return asset;
            });
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

                const contractExp = entry.liveUntilLedgerSeq;

                return {
                    status:
                        contractExp > latestLedger
                            ? CONTRACT_STATUS.ACTIVE
                            : CONTRACT_STATUS.EXPIRED,
                    ledgersBeforeExpire: Math.max(contractExp - latestLedger, 0),
                };
            })
            .catch(e => {
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
            .then(acc => {
                const tx = new StellarSdk.TransactionBuilder(acc, {
                    fee: BASE_FEE,
                    networkPassphrase: getNetworkPassphrase(),
                });

                tx.addOperation(
                    StellarSdk.Operation.createStellarAssetContract({
                        asset,
                    }),
                );

                return tx.setTimeout(StellarSdk.TimeoutInfinite).build();
            })
            .then(tx => this.prepareTransaction(tx));
    }

    // restoreAssetContractTx(publicKey: string, asset: Asset) {
    //     const contractId = this.getAssetContractId(asset);
    //
    //     const contract = new StellarSdk.Contract(contractId);
    //
    //     return this.server
    //         .getAccount(publicKey)
    //         .then(acc =>
    //             new StellarSdk.TransactionBuilder(acc, {
    //                 fee: BASE_FEE,
    //                 networkPassphrase: getNetworkPassphrase(),
    //             })
    //                 .addOperation(StellarSdk.Operation.restoreFootprint({}))
    //                 .setSorobanData(
    //                     new StellarSdk.SorobanDataBuilder()
    //                         .setReadWrite([contract.getFootprint()])
    //                         .build(),
    //                 )
    //                 .setTimeout(StellarSdk.TimeoutInfinite)
    //                 .build(),
    //         )
    //         .then(tx => this.prepareTransaction(tx));
    // }

    // bumpAssetContractTx(publicKey: string, asset: Asset) {
    //     const contractId = this.getAssetContractId(asset);
    //
    //     const contract = new StellarSdk.Contract(contractId);
    //
    //     return this.server
    //         .getAccount(publicKey)
    //         .then(acc =>
    //             new StellarSdk.TransactionBuilder(acc, {
    //                 fee: BASE_FEE,
    //                 networkPassphrase: getNetworkPassphrase(),
    //             })
    //                 .addOperation(
    //                     StellarSdk.Operation.extendFootprintTtl({
    //                         extendTo: 500000,
    //                     }),
    //                 )
    //                 .setSorobanData(
    //                     new StellarSdk.SorobanDataBuilder()
    //                         .setReadOnly([contract.getFootprint()])
    //                         .build(),
    //                 )
    //                 .setTimeout(StellarSdk.TimeoutInfinite)
    //                 .build(),
    //         )
    //         .then(tx => this.prepareTransaction(tx));
    // }

    // getPools(assets: Asset[]): Promise<null | Array<unknown>> {
    //     return this.buildSmartContactTx(
    //         ACCOUNT_FOR_SIMULATE,
    //         AMM_SMART_CONTACT_ID,
    //         AMM_CONTRACT_METHOD.GET_POOLS,
    //         this.scValToArray(this.orderTokens(assets).map(asset => this.assetToScVal(asset))),
    //     )
    //         .then(
    //             tx =>
    //                 this.server.simulateTransaction(
    //                     tx,
    //                 ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
    //         )
    //         .then(res => {
    //             if (!res.result) {
    //                 return [];
    //             }
    //
    //             const hashArray = res.result.retval.value() as Array<unknown>;
    //
    //             if (!hashArray.length) {
    //                 return [];
    //             }
    //
    //             return hashArray.map(item => [
    //                 SorobanService.getContactIdFromHash(item.val().value().value().toString('hex')),
    //                 item.key().value(),
    //             ]);
    //         });
    // }

    getInitConstantPoolTx(accountId: string, base: Asset, counter: Asset, fee: number, createInfo) {
        const args = [
            this.publicKeyToScVal(accountId),
            this.scValToArray(
                this.orderTokens([base, counter]).map(asset => this.assetToScVal(asset)),
            ),
            this.amountToUint32(fee),
        ];

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: AMM_SMART_CONTACT_ID,
            function: AMM_CONTRACT_METHOD.INIT_CONSTANT_POOL,
            args,
            auth: [
                new xdr.SorobanAuthorizationEntry({
                    credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
                    rootInvocation: new xdr.SorobanAuthorizedInvocation({
                        function:
                            xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                new xdr.InvokeContractArgs({
                                    contractAddress:
                                        this.contractIdToScVal(AMM_SMART_CONTACT_ID).address(),
                                    functionName: AMM_CONTRACT_METHOD.INIT_CONSTANT_POOL,
                                    args,
                                }),
                            ),
                        subInvocations: [
                            new xdr.SorobanAuthorizedInvocation({
                                function:
                                    xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                        new xdr.InvokeContractArgs({
                                            functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                                            contractAddress: this.assetToScVal(
                                                createInfo.token,
                                            ).address(),
                                            args: [
                                                this.publicKeyToScVal(accountId),
                                                this.contractIdToScVal(createInfo.destination),
                                                this.amountToInt128(createInfo.constantFee),
                                            ],
                                        }),
                                    ),
                                subInvocations: [],
                            }),
                        ],
                    }),
                }),
            ],
        });

        return this.buildSmartContactTxFromOp(accountId, operation).then(tx =>
            this.prepareTransaction(tx),
        );
    }

    getInitStableSwapPoolTx(accountId: string, assets: Asset[], fee: number, createInfo) {
        const args = [
            this.publicKeyToScVal(accountId),
            this.scValToArray(this.orderTokens(assets).map(asset => this.assetToScVal(asset))),
            this.amountToUint32(fee * 100),
        ];

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: AMM_SMART_CONTACT_ID,
            function: AMM_CONTRACT_METHOD.INIT_STABLESWAP_POOL,
            args,
            auth: [
                new xdr.SorobanAuthorizationEntry({
                    credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
                    rootInvocation: new xdr.SorobanAuthorizedInvocation({
                        function:
                            xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                new xdr.InvokeContractArgs({
                                    contractAddress:
                                        this.contractIdToScVal(AMM_SMART_CONTACT_ID).address(),
                                    functionName: AMM_CONTRACT_METHOD.INIT_STABLESWAP_POOL,
                                    args,
                                }),
                            ),
                        subInvocations: [
                            new xdr.SorobanAuthorizedInvocation({
                                function:
                                    xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                        new xdr.InvokeContractArgs({
                                            functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                                            contractAddress: this.assetToScVal(
                                                createInfo.token,
                                            ).address(),
                                            args: [
                                                this.publicKeyToScVal(accountId),
                                                this.contractIdToScVal(createInfo.destination),
                                                this.amountToInt128(createInfo.stableFee),
                                            ],
                                        }),
                                    ),
                                subInvocations: [],
                            }),
                        ],
                    }),
                }),
            ],
        });

        return this.buildSmartContactTxFromOp(accountId, operation).then(tx =>
            this.prepareTransaction(tx),
        );
    }

    getPoolShareId(poolId: string) {
        return this.buildSmartContactTx(ACCOUNT_FOR_SIMULATE, poolId, AMM_CONTRACT_METHOD.SHARE_ID)
            .then(
                tx =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return (
                        result.retval.value() as {
                            value: () => { toString: (format: string) => string };
                        }
                    )
                        .value()
                        ?.toString('hex') as string;
                }

                throw new Error('getPoolShareId error');
            });
    }

    getPoolRewards(accountId: string, poolId: string): Promise<PoolRewardsInfo> {
        return this.buildSmartContactTx(
            accountId,
            poolId,
            AMM_CONTRACT_METHOD.GET_REWARDS_INFO,
            this.publicKeyToScVal(accountId),
        )
            .then(
                tx =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return (result.retval.value() as unknown[]).reduce((acc, val) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        const key = val.key().value().toString();
                        if (key === 'exp_at' || key === 'last_time') {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            acc[key] = new BigNumber(this.i128ToInt(val.val().value()).toString())
                                .times(1e7)
                                .toNumber();
                            return acc;
                        }
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        acc[key] = this.i128ToInt(val.val().value());
                        return acc;
                    }, {}) as PoolRewardsInfo;
                }

                throw new Error('getPoolRewards error');
            });
    }

    getPoolInfo(accountId: string, poolId: string) {
        return this.buildSmartContactTx(accountId, poolId, AMM_CONTRACT_METHOD.GET_INFO)
            .then(
                tx =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
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
                tx =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return this.i128ToInt(result.retval.value() as StellarSdk.xdr.Int128Parts);
                }

                throw new Error('getTotalShares error');
            });
    }

    // getUserRewardsAmount(accountId: string, poolId: string) {
    //     return this.buildSmartContactTx(
    //         accountId,
    //         poolId,
    //         AMM_CONTRACT_METHOD.GET_USER_REWARD,
    //         this.publicKeyToScVal(accountId),
    //     )
    //         .then(
    //             tx =>
    //                 this.server.simulateTransaction(
    //                     tx,
    //                 ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
    //         )
    //         .then(({ result }) => {
    //             if (result) {
    //                 return this.i128ToInt(result.retval.value() as StellarSdk.xdr.Int128Parts);
    //             }
    //
    //             throw new Error('getUserRewardsAmount error');
    //         });
    // }

    getClaimRewardsTx(accountId: string, poolId: string) {
        return this.buildSmartContactTx(
            accountId,
            poolId,
            AMM_CONTRACT_METHOD.CLAIM,
            this.publicKeyToScVal(accountId),
        ).then(tx => this.prepareTransaction(tx));
    }

    getClaimBatchTx(accountId: string, pools: string[]) {
        const batches = pools.map(pool =>
            this.scValToArray([
                this.contractIdToScVal(pool),
                xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.CLAIM),
                this.scValToArray([this.publicKeyToScVal(accountId)]),
            ]),
        );

        return this.buildSmartContactTx(
            accountId,
            BATCH_SMART_CONTACT_ID,
            BATCH_CONTRACT_METHOD.batch,
            this.scValToArray([this.publicKeyToScVal(accountId)]),
            this.scValToArray(batches),
            xdr.ScVal.scvBool(false),
        ).then(tx => this.prepareTransaction(tx));
    }

    getCreationFeeToken() {
        return this.buildSmartContactTx(
            ACCOUNT_FOR_SIMULATE,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.GET_CREATION_FEE_TOKEN,
        )
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) =>
                this.getAssetFromContractId(
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    this.getContactIdFromHash(result.retval.value().value().toString('hex')),
                ),
            );
    }

    getCreationFee(type: POOL_TYPE) {
        return this.buildSmartContactTx(
            ACCOUNT_FOR_SIMULATE,
            AMM_SMART_CONTACT_ID,
            type === POOL_TYPE.constant
                ? AMM_CONTRACT_METHOD.GET_CONSTANT_CREATION_FEE
                : AMM_CONTRACT_METHOD.GET_STABLE_CREATION_FEE,
        )
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => this.i128ToInt(result.retval.value() as xdr.Int128Parts));
    }

    getCreationFeeAddress() {
        return this.buildSmartContactTx(
            ACCOUNT_FOR_SIMULATE,
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.GET_INIT_POOL_DESTINATION,
        )
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) =>
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                StellarSdk.StrKey.encodeContract(result.retval.value().value()),
            );
    }

    getCreationFeeInfo() {
        return Promise.all([
            this.getCreationFeeToken(),
            this.getCreationFee(POOL_TYPE.constant),
            this.getCreationFee(POOL_TYPE.stable),
            this.getCreationFeeAddress(),
        ]).then(([token, constantFee, stableFee, destination]) => ({
            token,
            constantFee,
            stableFee,
            destination,
        }));
    }

    // getPoolData(accountId: string, base: Asset, counter: Asset, [poolId, poolBytes]) {
    //     return this.getPoolShareId(poolId)
    //         .then(shareHash =>
    //             Promise.all([
    //                 this.getContactIdFromHash(shareHash),
    //                 this.getTokenBalance(this.getContactIdFromHash(shareHash), accountId),
    //                 this.getTokenBalance(base, poolId),
    //                 this.getTokenBalance(counter, poolId),
    //                 this.getPoolRewards(accountId, poolId),
    //                 this.getPoolInfo(accountId, poolId),
    //                 this.getTotalShares(poolId),
    //             ]),
    //         )
    //         .then(
    //             ([shareId, share, baseAmount, counterAmount, rewardsData, info, totalShares]) => ({
    //                 id: poolId,
    //                 bytes: poolBytes,
    //                 base,
    //                 counter,
    //                 share,
    //                 shareId,
    //                 baseAmount,
    //                 counterAmount,
    //                 rewardsData,
    //                 info,
    //                 totalShares,
    //             }),
    //         );
    // }

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
                tx =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return this.i128ToInt(result.retval.value() as xdr.Int128Parts);
                }

                return null;
            });
    }

    getPoolReserves(assets: Asset[], poolId: string) {
        return this.buildSmartContactTx(
            ACCOUNT_FOR_SIMULATE,
            poolId,
            AMM_CONTRACT_METHOD.GET_RESERVES,
        )
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return this.orderTokens(assets).reduce((acc, asset, index) => {
                        acc.set(
                            getAssetString(asset),
                            this.i128ToInt(result.retval.value()[index].value()),
                        );
                        return acc;
                    }, new Map());
                }

                throw new Error('getPoolPrice fail');
            });
    }

    getDepositTx(
        accountId: string,
        poolAddress: string,
        assets: Asset[],
        amounts: Map<string, string>,
    ) {
        const args = [
            this.publicKeyToScVal(accountId),
            this.scValToArray(
                this.orderTokens(assets).map(asset =>
                    this.amountToUint128(amounts.get(getAssetString(asset))),
                ),
            ),
            this.amountToUint128('0.0000001'),
        ];

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: poolAddress,
            function: AMM_CONTRACT_METHOD.DEPOSIT,
            args,
            auth: [
                new xdr.SorobanAuthorizationEntry({
                    credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
                    rootInvocation: new xdr.SorobanAuthorizedInvocation({
                        function:
                            xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                new xdr.InvokeContractArgs({
                                    contractAddress: this.contractIdToScVal(poolAddress).address(),
                                    functionName: AMM_CONTRACT_METHOD.DEPOSIT,
                                    args,
                                }),
                            ),
                        subInvocations: this.orderTokens(assets).map(
                            asset =>
                                new xdr.SorobanAuthorizedInvocation({
                                    function:
                                        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                            new xdr.InvokeContractArgs({
                                                functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                                                contractAddress: this.assetToScVal(asset).address(),
                                                args: [
                                                    this.publicKeyToScVal(accountId),
                                                    this.contractIdToScVal(poolAddress),
                                                    this.amountToInt128(
                                                        amounts.get(getAssetString(asset)),
                                                    ),
                                                ],
                                            }),
                                        ),
                                    subInvocations: [],
                                }),
                        ),
                    }),
                }),
            ],
        });

        return this.buildSmartContactTxFromOp(accountId, operation).then(tx =>
            this.prepareTransaction(tx),
        );
    }

    getWithdrawTx(
        accountId: string,
        poolAddress: string,
        shareAmount: string,
        assets: Asset[],
        shareAddress: string,
    ): Promise<StellarSdk.Transaction> {
        const args = [
            this.publicKeyToScVal(accountId),
            this.amountToUint128(shareAmount),
            this.scValToArray(assets.map(() => this.amountToUint128('0.0000001'))),
        ];

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: poolAddress,
            function: AMM_CONTRACT_METHOD.WITHDRAW,
            args,
            auth: [
                new xdr.SorobanAuthorizationEntry({
                    credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
                    rootInvocation: new xdr.SorobanAuthorizedInvocation({
                        function:
                            xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                new xdr.InvokeContractArgs({
                                    contractAddress: this.contractIdToScVal(poolAddress).address(),
                                    functionName: AMM_CONTRACT_METHOD.WITHDRAW,
                                    args,
                                }),
                            ),
                        subInvocations: [
                            new xdr.SorobanAuthorizedInvocation({
                                function:
                                    xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                        new xdr.InvokeContractArgs({
                                            functionName: ASSET_CONTRACT_METHOD.BURN,
                                            contractAddress:
                                                this.contractIdToScVal(shareAddress).address(),
                                            args: [
                                                this.publicKeyToScVal(accountId),
                                                this.amountToInt128(shareAmount),
                                            ],
                                        }),
                                    ),
                                subInvocations: [],
                            }),
                        ],
                    }),
                }),
            ],
        });

        return this.buildSmartContactTxFromOp(accountId, operation).then(tx =>
            this.prepareTransaction(tx),
        );
    }

    // estimateSwap(base: Asset, counter: Asset, amount: string) {
    //     const idA = this.getAssetContractId(base);
    //     const idB = this.getAssetContractId(counter);
    //
    //     const [a, b] = idA > idB ? [counter, base] : [base, counter];
    //
    //     return this.buildSmartContactTx(
    //         ACCOUNT_FOR_SIMULATE,
    //         AMM_SMART_CONTACT_ID,
    //         AMM_CONTRACT_METHOD.ESTIMATE_SWAP_ROUTED,
    //         this.scValToArray([this.assetToScVal(a), this.assetToScVal(b)]),
    //         this.assetToScVal(base),
    //         this.assetToScVal(counter),
    //         this.amountToUint128(amount),
    //     )
    //         .then(
    //             tx =>
    //                 this.server.simulateTransaction(
    //                     tx,
    //                 ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
    //         )
    //         .then(({ result }) => {
    //             if (result) {
    //                 return result.retval.value();
    //             }
    //             return 0;
    //         });
    // }

    getSwapChainedTx(
        accountId: string,
        base: Asset,
        chainedXDR: string,
        amount: string,
        amountWithSlippage: string,
        isSend: boolean,
    ) {
        const args = [
            this.publicKeyToScVal(accountId),
            xdr.ScVal.fromXDR(chainedXDR, 'base64'),
            this.assetToScVal(base),
            this.amountToUint128(amount),
            this.amountToUint128(amountWithSlippage),
        ];

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: AMM_SMART_CONTACT_ID,
            function: isSend
                ? AMM_CONTRACT_METHOD.SWAP_CHAINED
                : AMM_CONTRACT_METHOD.SWAP_CHAINED_RECEIVE,
            args,
            auth: [
                new xdr.SorobanAuthorizationEntry({
                    credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
                    rootInvocation: new xdr.SorobanAuthorizedInvocation({
                        function:
                            xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                new xdr.InvokeContractArgs({
                                    contractAddress:
                                        this.contractIdToScVal(AMM_SMART_CONTACT_ID).address(),
                                    functionName: isSend
                                        ? AMM_CONTRACT_METHOD.SWAP_CHAINED
                                        : AMM_CONTRACT_METHOD.SWAP_CHAINED_RECEIVE,
                                    args,
                                }),
                            ),
                        subInvocations: [
                            new xdr.SorobanAuthorizedInvocation({
                                function:
                                    xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                        new xdr.InvokeContractArgs({
                                            functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                                            contractAddress: this.assetToScVal(base).address(),
                                            args: [
                                                this.publicKeyToScVal(accountId),
                                                this.contractIdToScVal(AMM_SMART_CONTACT_ID),
                                                this.amountToInt128(
                                                    isSend ? amount : amountWithSlippage,
                                                ),
                                            ],
                                        }),
                                    ),
                                subInvocations: [],
                            }),
                        ],
                    }),
                }),
            ],
        });
        return this.buildSmartContactTxFromOp(accountId, operation).then(tx =>
            this.prepareTransaction(tx),
        );
    }

    buildSmartContactTx(publicKey, contactId, method, ...args) {
        return this.server.getAccount(publicKey).then(acc => {
            const contract = new StellarSdk.Contract(contactId);

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
        });
    }

    buildSmartContactTxFromOp(publicKey, operation) {
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

    submitTx(tx: StellarSdk.Transaction) {
        return this.server.sendTransaction(tx).then(res => this.processResponse(res, tx));
    }

    simulateTx(tx: StellarSdk.Transaction) {
        return this.server.simulateTransaction(tx);
    }

    prepareTransaction(tx: StellarSdk.Transaction) {
        return this.tryRestore(tx).then(() =>
            this.server.prepareTransaction(tx).catch(err => {
                throw SorobanPrepareTxErrorHandler(err);
            }),
        );
    }

    private startServer(): void {
        this.server = new StellarSdk.rpc.Server(getSorobanUrl());
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
        return xdr.ScVal.scvU32(Math.floor(amount));
    }

    amountToInt128(amount: string): xdr.ScVal {
        return new StellarSdk.XdrLargeInt(
            'u128',
            new BigNumber(amount).times(1e7).toFixed(),
        ).toI128();
    }

    amountToUint128(amount: string): xdr.ScVal {
        return new StellarSdk.XdrLargeInt(
            'u128',
            new BigNumber(amount).times(1e7).toFixed(),
        ).toU128();
    }

    bytesToScVal(bytes: Buffer): xdr.ScVal {
        return xdr.ScVal.scvBytes(bytes);
    }

    hashToScVal(hash: string): xdr.ScVal {
        return xdr.ScVal.scvBytes(Buffer.from(binascii.unhexlify(hash), 'ascii'));
    }

    i128ToInt(val: xdr.Int128Parts): string {
        return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            new BigNumber(val.hi()._value)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                .plus(val.lo()._value)
                .div(1e7)
                .toString()
        );
    }

    private orderTokens(assets: Asset[]) {
        for (let i = 0; i < assets.length; i++) {
            for (let j = 0; j < assets.length - 1; j++) {
                const hash1 = parseInt(this.getAssetContractHash(assets[j]), 16);
                const hash2 = parseInt(this.getAssetContractHash(assets[j + 1]), 16);
                if (hash1 > hash2) {
                    const temp = assets[j];
                    assets[j] = assets[j + 1];
                    assets[j + 1] = temp;
                }
            }
        }
        return assets;
    }
}
