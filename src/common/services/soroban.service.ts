import * as SorobanClient from 'soroban-client';
import { sha256 } from 'js-sha256';
import binascii from 'binascii';
import { xdr, Asset, Keypair, SorobanRpc } from 'soroban-client';
import SendTransactionResponse = SorobanRpc.SendTransactionResponse;
import { ModalService, ToastService } from './globalServices';
import SuccessModal from '../../pages/amm/SuccessModal/SuccessModal';

const SOROBAN_SERVER = 'https://rpc-futurenet.stellar.org:443/';

// SMART CONTACTS IDs
const AMM_SMART_CONTACT_ID = '275936a642c3bb8594f0175e16cbac664415e0dcff2440e71b53833616cf51bd';

const POOL_CONTACT_WASM_HASH = '588c9c473cf5ada4716d9a039b5cc0ae75077aa26e17bbccf300af0e271c8aef';

const TOKEN_CONTACT_WASM_HASH = '9fb6e88690366661fa27537bdc02f4f0275dc1d259f95b8455132d43492bccd6';

enum AMM_CONTRACT_METHOD {
    GET_OR_CREATE_POOL = 'get_or_create_pool',
    DEPOSIT = 'sf_deposit',
    SHARE_ID = 'share_id',
    ESTIMATE_SWAP_OUT = 'estimate_swap_out',
    WITHDRAW = 'sf_withdrw',
    SWAP = 'swap_out',
    GET_RESERVES = 'get_reserves',
}

enum ASSET_CONTRACT_METHOD {
    GET_ALLOWANCE = 'allowance',
    APPROVE_ALLOWANCE = 'approve',
    GET_BALANCE = 'balance',
}

const FEE = '1000';

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
            'SBPQCB4DOUQ26OC43QNAA3ODZOGECHJUVHDHYRHKYPL4SA22RRYGHQCX',
        );
        const USDT = new SorobanClient.Asset('USDT', issuerKeypair.publicKey());
        const USDC = new SorobanClient.Asset('USDC', issuerKeypair.publicKey());
        const ETH = new SorobanClient.Asset('ETH', issuerKeypair.publicKey());
        const BTC = new SorobanClient.Asset('BTC', issuerKeypair.publicKey());

        return this.server
            .getAccount(this.keypair.publicKey())
            .then((acc) => {
                const transaction = new SorobanClient.TransactionBuilder(acc, {
                    fee: FEE,
                    networkPassphrase: SorobanClient.Networks.FUTURENET,
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
                                    asset: USDT,
                                    amount: '10000',
                                }),
                            )
                            .addOperation(
                                SorobanClient.Operation.payment({
                                    destination: this.keypair.publicKey(),
                                    asset: USDC,
                                    amount: '10000',
                                }),
                            )
                            .addOperation(
                                SorobanClient.Operation.payment({
                                    destination: this.keypair.publicKey(),
                                    asset: ETH,
                                    amount: '10000',
                                }),
                            )
                            .addOperation(
                                SorobanClient.Operation.payment({
                                    destination: this.keypair.publicKey(),
                                    asset: BTC,
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
                    const result = xdr.TransactionMeta.fromXDR(
                        Buffer.from(res.resultMetaXdr, 'base64'),
                    );

                    // @ts-ignore
                    resolver(result.value().sorobanMeta().returnValue());
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
        const networkId: Buffer = Buffer.from(sha256.arrayBuffer(SorobanClient.Networks.FUTURENET));

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

    checkContractDeployed(contractId: string): Promise<boolean> {
        const contractIdBuffer: Buffer = Buffer.from(binascii.unhexlify(contractId), 'ascii');

        const ledgerKey: xdr.LedgerKey = xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
                contract: xdr.ScAddress.scAddressTypeContract(contractIdBuffer),
                key: xdr.ScVal.scvLedgerKeyContractInstance(),
                durability: xdr.ContractDataDurability.persistent(),
                bodyType: xdr.ContractEntryBodyType.dataEntry(),
            }),
        );

        return this.server
            .getLedgerEntries([ledgerKey])
            .then(({ entries }) => {
                return Boolean(entries?.length);
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
            .then((res) => res.value().value().toString('hex'));
    }

    getPoolShareId(poolId: string) {
        return this.buildSmartContactTx(
            this.keypair.publicKey(),
            poolId,
            AMM_CONTRACT_METHOD.SHARE_ID,
        )
            .then((tx) => this.server.simulateTransaction(tx))
            .then((res) => {
                if (res.results) {
                    const xdr = res.results[0].xdr;

                    let scVal = SorobanClient.xdr.ScVal.fromXDR(Buffer.from(xdr, 'base64'));

                    return scVal.address().contractId().toString('hex');
                }

                throw new Error('getPoolShareId error');
            });
    }

    getTokenBalance(token: Asset | string, where: string) {
        return this.buildSmartContactTx(
            this.keypair.publicKey(),
            typeof token === 'string' ? token : this.getAssetContractId(token),
            ASSET_CONTRACT_METHOD.GET_BALANCE,
            SorobanClient.StrKey.isValidEd25519PublicKey(where)
                ? this.publicKeyToScVal(where)
                : this.hashToAddressScVal(where),
        )
            .then((tx) => this.server.simulateTransaction(tx))
            .then(({ results }) => {
                if (results) {
                    const xdr = results[0].xdr;

                    let scVal = SorobanClient.xdr.ScVal.fromXDR(Buffer.from(xdr, 'base64'));

                    return this.i128ToInt(scVal.i128());
                }

                return null;
            });
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

    giveAllowance(poolId: string, asset: Asset | string, amount: string) {
        return this.buildSmartContactTx(
            this.keypair.publicKey(),
            typeof asset === 'string' ? asset : this.getAssetContractId(asset),
            ASSET_CONTRACT_METHOD.APPROVE_ALLOWANCE,
            this.publicKeyToScVal(this.keypair.publicKey()),
            this.hashToAddressScVal(poolId),
            this.amountToScVal(amount),
            xdr.ScVal.scvU32(2 ** 20),
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
                return this.processResponse(res);
            });
    }

    getPoolPrice(a: Asset, b: Asset) {
        const idA = this.getAssetContractId(a);
        const idB = this.getAssetContractId(b);
        const [base, counter] = idA > idB ? [b, a] : [a, b];

        return this.buildSmartContactTx(
            this.keypair.publicKey(),
            AMM_SMART_CONTACT_ID,
            AMM_CONTRACT_METHOD.GET_RESERVES,
            this.assetToScVal(base),
            this.assetToScVal(counter),
        )
            .then((tx) => {
                return this.simulateTx(tx);
            })
            .then(({ results }) => {
                if (results) {
                    const xdr = results[0].xdr;

                    // @ts-ignore
                    const [baseAmount, counterAmount] = SorobanClient.xdr.ScVal.fromXDR(
                        Buffer.from(xdr, 'base64'),
                    ).value();

                    const baseAmountInt = this.i128ToInt(baseAmount.i128());
                    const counterAmountInt = this.i128ToInt(counterAmount.i128());

                    return this.getAssetContractId(base) === idA
                        ? baseAmountInt / counterAmountInt
                        : counterAmountInt / baseAmountInt;
                }

                throw new Error('getPoolReserves fail');
            });
    }

    deposit(poolId: string, a: Asset, b: Asset, aAmount: string, bAmount: string) {
        const idA = this.getAssetContractId(a);
        const idB = this.getAssetContractId(b);

        const [base, counter] = idA > idB ? [b, a] : [a, b];
        const [baseAmount, counterAmount] = idA > idB ? [bAmount, aAmount] : [aAmount, bAmount];

        return this.giveAllowance(poolId, base, baseAmount)
            .then(() => this.giveAllowance(poolId, counter, counterAmount))
            .then(() =>
                this.buildSmartContactTx(
                    this.keypair.publicKey(),
                    AMM_SMART_CONTACT_ID,
                    AMM_CONTRACT_METHOD.DEPOSIT,
                    this.publicKeyToScVal(this.keypair.publicKey()),
                    this.assetToScVal(base),
                    this.assetToScVal(counter),
                    this.amountToScVal(baseAmount),
                    this.amountToScVal('0'),
                    this.amountToScVal(counterAmount),
                    this.amountToScVal('0'),
                ),
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
                const [baseAmount, counterAmount] = res.value();

                ModalService.confirmAllModals();

                ModalService.openModal(SuccessModal, {
                    base,
                    counter,
                    baseAmount: this.i128ToInt(baseAmount.value()),
                    counterAmount: this.i128ToInt(counterAmount.value()),
                    title: 'Success deposit',
                });
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

        return this.giveAllowance(poolId, shareId, shareAmount)
            .then(() =>
                this.buildSmartContactTx(
                    this.keypair.publicKey(),
                    AMM_SMART_CONTACT_ID,
                    AMM_CONTRACT_METHOD.WITHDRAW,
                    this.publicKeyToScVal(this.keypair.publicKey()),
                    this.assetToScVal(base),
                    this.assetToScVal(counter),
                    this.amountToScVal(shareAmount),
                    this.amountToScVal(baseAmount),
                    this.amountToScVal(counterAmount),
                ),
            )
            .then((tx) => this.server.prepareTransaction(tx))
            .then((prepared) => {
                prepared.sign(this.keypair);

                return this.server.sendTransaction(prepared);
            })
            .then((res) => this.processResponse(res))
            .then((res) => {
                const [baseAmount, counterAmount] = res.value();

                ModalService.confirmAllModals();

                ModalService.openModal(SuccessModal, {
                    base,
                    counter,
                    baseAmount: this.i128ToInt(baseAmount.value()),
                    counterAmount: this.i128ToInt(counterAmount.value()),
                    title: 'Success withdraw',
                });
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

        return this.giveAllowance(poolId, base, maxBaseAmount)
            .then(() =>
                this.buildSmartContactTx(
                    this.keypair.publicKey(),
                    AMM_SMART_CONTACT_ID,
                    AMM_CONTRACT_METHOD.SWAP,
                    this.publicKeyToScVal(this.keypair.publicKey()),
                    this.assetToScVal(base),
                    this.assetToScVal(counter),
                    this.amountToScVal(amount),
                    this.amountToScVal(maxBaseAmount),
                ),
            )
            .then((tx) => this.server.prepareTransaction(tx))
            .then((prepared) => {
                prepared.sign(this.keypair);

                return this.server.sendTransaction(prepared);
            })
            .then((res) => this.processResponse(res))
            .then((res) => {
                ModalService.openModal(SuccessModal, {
                    base,
                    counter,
                    baseAmount: this.i128ToInt(res.value()),
                    counterAmount: Number(amount),
                    title: 'Success swap',
                    isSwap: true,
                });
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

    boolToScVal(value: boolean): xdr.ScVal {
        return xdr.ScVal.scvBool(value);
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
