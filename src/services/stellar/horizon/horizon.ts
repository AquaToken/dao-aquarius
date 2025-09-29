import * as StellarSdk from '@stellar/stellar-sdk';

import { getHorizonUrl } from 'helpers/url';

import { ClassicToken } from 'types/token';

interface NextRequest<T> {
    next: () => Promise<NextRequest<T>>;
    records: T[];
}

export default class Horizon {
    private _server: StellarSdk.Horizon.Server;

    get server() {
        if (!this._server) {
            throw new Error("Horizon server isn't started");
        }

        return this._server;
    }

    constructor() {
        this.startHorizonServer();
    }

    private startHorizonServer(): void {
        // settled in configs: prod.js and dev.js
        // this.server = new StellarSdk.Horizon.Server(process.horizon.HORIZON_SERVER);

        this._server = new StellarSdk.Horizon.Server(getHorizonUrl());
    }

    getTradeAggregations(
        base: ClassicToken,
        counter: ClassicToken,
        startDate: number,
        endDate: number,
        resolution: number,
        limit: number,
    ) {
        return this.server
            .tradeAggregation(base, counter, startDate, endDate, resolution, 0)
            .limit(limit)
            .order('desc')
            .call();
    }

    getLiquidityPoolData(
        base: ClassicToken,
        counter: ClassicToken,
    ): Promise<StellarSdk.Horizon.ServerApi.LiquidityPoolRecord | null> {
        return this.server
            .liquidityPools()
            .forAssets(base, counter)
            .call()
            .then(({ records }) => {
                if (!records.length) {
                    return null;
                }
                return records[0];
            });
    }

    async nextRequest<T>(
        previousRecords: T[],
        nextRequest: () => Promise<NextRequest<T>>,
        limit: number,
    ): Promise<T[]> {
        const { records, next } = await nextRequest();

        if (records.length === limit) {
            return this.nextRequest([...previousRecords, ...records], next, limit);
        }

        return [...previousRecords, ...records];
    }
}
