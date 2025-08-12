import { Asset, StrKey, xdr } from '@stellar/stellar-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';

import {
    ASSET_CONTRACT_METHOD,
    BATCH_CONTRACT_METHOD,
    CONTRACT_STATUS,
    CONTRACTS,
} from 'constants/soroban';
import { ACCOUNT_FOR_SIMULATE, BASE_FEE } from 'constants/stellar';

import { getEnv, getNetworkPassphrase } from 'helpers/env';

import { StellarService } from 'services/globalServices';
import {
    buildSmartContractTx,
    simulateTx,
    getAccount,
    prepareTransaction,
} from 'services/soroban/connection/connection';
import {
    contractIdToScVal,
    i128ToInt,
    publicKeyToScVal,
    scValToArray,
} from 'services/soroban/utils/scValHelpers';

import { ClassicToken, Token, TokenType } from 'types/token';

const tokensCache = new Map<string, Token>();

const BATCH_SMART_CONTRACT_ID = CONTRACTS[getEnv()].batch;

export function getAssetContractId(asset: Asset): string {
    return asset.contractId(getNetworkPassphrase());
}

export function parseTokenContractId(contractId: string): Promise<Token> {
    if (tokensCache.has(contractId)) {
        return Promise.resolve(tokensCache.get(contractId));
    }

    if (contractId === StellarService.createLumen().contractId(getNetworkPassphrase())) {
        const lumen: ClassicToken = StellarService.createLumen() as ClassicToken;
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

    return buildSmartContractTx(
        ACCOUNT_FOR_SIMULATE,
        BATCH_SMART_CONTRACT_ID,
        BATCH_CONTRACT_METHOD.batch,
        scValToArray([publicKeyToScVal(ACCOUNT_FOR_SIMULATE)]),
        batchCalls,
        xdr.ScVal.scvBool(true),
    )
        .then(
            tx => simulateTx(tx) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
        )
        .then(({ result }) => {
            const [name, symbol, decimal] = (
                result.retval.value() as { value: () => unknown }[]
            ).map(val => val.value().toString());

            const [code, issuer] = name.split(':');

            try {
                const asset: ClassicToken = StellarService.createAsset(
                    code,
                    issuer,
                ) as ClassicToken;

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

export function getTokenDecimals(contactId: string): Promise<number> {
    return buildSmartContractTx(ACCOUNT_FOR_SIMULATE, contactId, ASSET_CONTRACT_METHOD.DECIMALS)
        .then(
            tx => simulateTx(tx) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
        )
        .then(({ result }) => Number(result.retval.value()));
}

export async function getTokenBalance(token: Asset | string, where: string) {
    const tokenContact = typeof token === 'string' ? token : getAssetContractId(token);
    const tokenDecimals = await getTokenDecimals(tokenContact);

    const tx = await buildSmartContractTx(
        ACCOUNT_FOR_SIMULATE,
        tokenContact,
        ASSET_CONTRACT_METHOD.GET_BALANCE,
        StellarSdk.StrKey.isValidEd25519PublicKey(where)
            ? publicKeyToScVal(where)
            : contractIdToScVal(where),
    );

    const result = (await simulateTx(tx)) as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse;

    if (result.result) {
        return i128ToInt(result.result.retval, tokenDecimals);
    }

    return null;
}

export function deployAssetContractTx(publicKey: string, asset: Asset) {
    return getAccount(publicKey)
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
        .then(tx => prepareTransaction(tx));
}

export function getTokenContractData(
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
                    contractExp > latestLedger ? CONTRACT_STATUS.ACTIVE : CONTRACT_STATUS.EXPIRED,
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

function getAssetContractHash(asset: Token): string {
    return new StellarSdk.Contract(asset.contract).address().toBuffer().toString('hex');
}

export function orderTokens(assets: Token[]) {
    for (let i = 0; i < assets.length; i++) {
        for (let j = 0; j < assets.length - 1; j++) {
            const hash1 = parseInt(getAssetContractHash(assets[j]), 16);
            const hash2 = parseInt(getAssetContractHash(assets[j + 1]), 16);
            if (hash1 > hash2) {
                const temp = assets[j];
                assets[j] = assets[j + 1];
                assets[j + 1] = temp;
            }
        }
    }
    return assets;
}
