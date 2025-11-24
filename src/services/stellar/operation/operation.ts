import * as StellarSdk from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';

import { BRIBES_COLLECTOR_KEY } from 'constants/stellar-accounts';
import { MARKET_KEY_SIGNER_WEIGHT, MARKET_KEY_THRESHOLD } from 'constants/voting';

import { getAquaAssetData } from 'helpers/assets';
import { createAsset } from 'helpers/token';

import { ClassicToken } from 'types/token';

export default class Operation {
    createVoteOperation(
        publicKey: string,
        marketKey: string,
        amount: string,
        timestamp: number,
        asset?: ClassicToken,
    ) {
        const { aquaStellarAsset } = getAquaAssetData();
        const time = Math.ceil(timestamp / 1000);
        return StellarSdk.Operation.createClaimableBalance({
            source: publicKey,
            amount: amount.toString(),
            asset: asset ?? aquaStellarAsset,
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

    createLockOperation(publicKey: string, amount: string, timestamp: number) {
        const { aquaStellarAsset } = getAquaAssetData();
        const time = Math.ceil(timestamp / 1000);

        return StellarSdk.Operation.createClaimableBalance({
            source: publicKey,
            amount: amount.toString(),
            asset: aquaStellarAsset,
            claimants: [
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
        const { aquaStellarAsset, aquaIssuer } = getAquaAssetData();

        return StellarSdk.Operation.payment({
            amount,
            asset: aquaStellarAsset,
            destination: aquaIssuer,
        });
    }

    getCreateMarketKeyOps(
        txBuilder: StellarSdk.TransactionBuilder,
        accountId: string,
        asset1: ClassicToken,
        asset2: ClassicToken,
        amount: number,
        signerKey: string,
    ): void {
        txBuilder.addOperation(
            StellarSdk.Operation.createAccount({
                destination: accountId,
                startingBalance: amount.toString(),
            }),
        );

        if (!asset1.isNative()) {
            txBuilder.addOperation(
                StellarSdk.Operation.changeTrust({
                    source: accountId,
                    asset: asset1,
                }),
            );
        }

        if (!asset2.isNative()) {
            txBuilder.addOperation(
                StellarSdk.Operation.changeTrust({
                    source: accountId,
                    asset: asset2,
                }),
            );
        }

        txBuilder.addOperation(
            StellarSdk.Operation.setOptions({
                source: accountId,
                masterWeight: MARKET_KEY_SIGNER_WEIGHT,
                lowThreshold: MARKET_KEY_THRESHOLD,
                medThreshold: MARKET_KEY_THRESHOLD,
                highThreshold: MARKET_KEY_THRESHOLD,
                signer: {
                    ed25519PublicKey: signerKey,
                    weight: MARKET_KEY_SIGNER_WEIGHT,
                },
            }),
        );
    }

    createClaimOperations(claimId: string, withTrust?: boolean) {
        const { aquaStellarAsset } = getAquaAssetData();

        const ops = [];

        if (withTrust) {
            const trustOp = StellarSdk.Operation.changeTrust({
                asset: aquaStellarAsset,
            });
            ops.push(trustOp);
        }

        const claimOp = StellarSdk.Operation.claimClaimableBalance({
            balanceId: claimId,
        });

        ops.push(claimOp);

        return ops;
    }

    createBribeOperation(
        marketKey: string,
        asset: ClassicToken,
        amount: string,
        timestamp: number,
    ) {
        const time = Math.ceil(timestamp / 1000);
        return StellarSdk.Operation.createClaimableBalance({
            amount: amount.toString(),
            asset: createAsset(asset.code, asset.issuer),
            claimants: [
                new StellarSdk.Claimant(
                    marketKey,
                    StellarSdk.Claimant.predicateNot(StellarSdk.Claimant.predicateUnconditional()),
                ),
                new StellarSdk.Claimant(
                    BRIBES_COLLECTOR_KEY,
                    StellarSdk.Claimant.predicateNot(
                        StellarSdk.Claimant.predicateBeforeAbsoluteTime(time.toString()),
                    ),
                ),
            ],
        });
    }

    createAddTrustOperation(asset: ClassicToken) {
        return StellarSdk.Operation.changeTrust({
            asset,
        });
    }

    createWithdrawOperation(
        poolId: string,
        share: string | number,
        base: ClassicToken,
        counter: ClassicToken,
        baseAmount: string | number,
        counterAmount: string | number,
        withRemoveTrust: boolean,
    ) {
        const ops = [];
        const SLIPPAGE = 0.001; //0.1%

        const [assetA, assetB] = [base, counter].sort((a, b) => StellarSdk.Asset.compare(a, b));

        const [amountA, amountB] =
            assetA.code === base.code && assetA.issuer === base.issuer
                ? [baseAmount, counterAmount]
                : [counterAmount, baseAmount];

        ops.push(
            StellarSdk.Operation.liquidityPoolWithdraw({
                liquidityPoolId: poolId,
                amount: share.toString(),
                minAmountA: new BigNumber(amountA).times(1 - SLIPPAGE).toFixed(7),
                minAmountB: new BigNumber(amountB).times(1 - SLIPPAGE).toFixed(7),
            }),
        );

        if (withRemoveTrust) {
            ops.push(
                StellarSdk.Operation.changeTrust({
                    asset: new StellarSdk.LiquidityPoolAsset(
                        assetA,
                        assetB,
                        StellarSdk.LiquidityPoolFeeV18,
                    ),
                    limit: '0',
                }),
            );
        }

        return ops;
    }
}
