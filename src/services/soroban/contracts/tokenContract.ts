import { Asset, StrKey, xdr } from '@stellar/stellar-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';

import {
    ASSET_CONTRACT_METHOD,
    BATCH_CONTRACT_METHOD,
    CONTRACT_STATUS,
    CONTRACTS,
} from 'constants/soroban';
import { BASE_FEE } from 'constants/stellar';
import { ACCOUNT_FOR_SIMULATE } from 'constants/stellar-accounts';

import { getEnv, getNetworkPassphrase } from 'helpers/env';
import { createAsset, createLumen, getTokensFromCache } from 'helpers/token';

import Connection from 'services/soroban/connection/connection';
import {
    contractIdToScVal,
    i128ToInt,
    publicKeyToScVal,
    scValToArray,
} from 'services/soroban/utils/scValHelpers';

import { ClassicToken, Token, TokenType } from 'types/token';

export default class TokenContract {
    tokensCache = new Map<string, Token>();
    private readonly connection: Connection;
    private readonly BATCH_SMART_CONTRACT_ID: string;

    constructor(connection: Connection) {
        this.connection = connection;
        this.BATCH_SMART_CONTRACT_ID = CONTRACTS[getEnv()].batch;

        this.restoreFromCache();
    }

    restoreFromCache() {
        const cached = getTokensFromCache();

        if (cached) {
            cached.forEach(token => {
                this.tokensCache.set(token.contract, token);
            });
        }
    }

    getAssetContractId(asset: Asset): string {
        return asset.contractId(getNetworkPassphrase());
    }

    parseTokenContractId(contractId: string): Promise<Token> {
        if (this.tokensCache.has(contractId)) {
            return Promise.resolve(this.tokensCache.get(contractId));
        }

        if (contractId === createLumen().contractId(getNetworkPassphrase())) {
            const lumen: ClassicToken = createLumen() as ClassicToken;
            lumen.type = TokenType.classic;
            lumen.contract = contractId;
            lumen.decimal = 7;
            return Promise.resolve(lumen);
        }

        const nameCall = scValToArray([
            contractIdToScVal(contractId),
            xdr.ScVal.scvSymbol(ASSET_CONTRACT_METHOD.NAME),
            scValToArray([]),
        ]);

        const symbolCall = scValToArray([
            contractIdToScVal(contractId),
            xdr.ScVal.scvSymbol(ASSET_CONTRACT_METHOD.SYMBOL),
            scValToArray([]),
        ]);

        const decimalCall = scValToArray([
            contractIdToScVal(contractId),
            xdr.ScVal.scvSymbol(ASSET_CONTRACT_METHOD.DECIMALS),
            scValToArray([]),
        ]);

        const batchCalls = scValToArray([nameCall, symbolCall, decimalCall]);

        return this.connection
            .buildSmartContractTx(
                ACCOUNT_FOR_SIMULATE,
                this.BATCH_SMART_CONTRACT_ID,
                BATCH_CONTRACT_METHOD.batch,
                scValToArray([publicKeyToScVal(ACCOUNT_FOR_SIMULATE)]),
                batchCalls,
                xdr.ScVal.scvBool(true),
            )
            .then(
                tx =>
                    this.connection.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                const [name, symbol, decimal] = (
                    result.retval.value() as { value: () => unknown }[]
                ).map(val => val.value().toString());

                const [code, issuer] = name.split(':');

                try {
                    const asset: ClassicToken = createAsset(code, issuer) as ClassicToken;

                    if (asset.contractId(getNetworkPassphrase()) !== contractId) {
                        throw new Error();
                    }

                    asset.type = TokenType.classic;
                    asset.contract = contractId;
                    asset.decimal = 7;

                    return asset;
                } catch {
                    return {
                        type: TokenType.soroban,
                        contract: contractId,
                        name,
                        code: symbol,
                        decimal: Number(decimal),
                    };
                }
            });
    }

    getTokenDecimals(contactId: string): Promise<number> {
        return this.connection
            .buildSmartContractTx(ACCOUNT_FOR_SIMULATE, contactId, ASSET_CONTRACT_METHOD.DECIMALS)
            .then(
                tx =>
                    this.connection.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => Number(result.retval.value()));
    }

    async getTokenBalance(token: Asset | string, where: string) {
        const tokenContact = typeof token === 'string' ? token : this.getAssetContractId(token);
        const tokenDecimals = await this.getTokenDecimals(tokenContact);

        const tx = await this.connection.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            tokenContact,
            ASSET_CONTRACT_METHOD.GET_BALANCE,
            StellarSdk.StrKey.isValidEd25519PublicKey(where)
                ? publicKeyToScVal(where)
                : contractIdToScVal(where),
        );

        const result = (await this.connection.simulateTx(
            tx,
        )) as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse;

        if (result.result) {
            return i128ToInt(result.result.retval, tokenDecimals);
        }

        return null;
    }

    deployAssetContractTx(publicKey: string, asset: Asset) {
        return this.connection
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
            .then(tx => this.connection.prepareTransaction(tx));
    }

    getTokenContractData(
        contractId: string,
    ): Promise<{ status: CONTRACT_STATUS; ledgersBeforeExpire: number }> {
        const contractIdBuffer: Buffer = StrKey.decodeContract(contractId);

        const contractKey: xdr.LedgerKey = xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
                contract: xdr.ScAddress.scAddressTypeContract(
                    contractIdBuffer as unknown as xdr.Hash,
                ),
                key: xdr.ScVal.scvLedgerKeyContractInstance(),
                durability: xdr.ContractDataDurability.persistent(),
            }),
        );

        return this.connection
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

    private getAssetContractHash(asset: Token): string {
        return new StellarSdk.Contract(asset.contract).address().toBuffer().toString('hex');
    }

    orderTokens(assets: Token[]) {
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
