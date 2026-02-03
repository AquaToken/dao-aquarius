import { getLumenUsdPrice } from 'api/price';

import { ENV_TESTNET } from 'constants/env';

import { getAquaAssetData } from 'helpers/assets';
import { getEnv } from 'helpers/env';
import { roundToPrecision } from 'helpers/format-number';
import { createAsset, createLumen } from 'helpers/token';

import Horizon from 'services/stellar/horizon/horizon';

import { ClassicToken } from 'types/token';

export default class Price {
    priceLumenUsd = null;
    private readonly horizon: Horizon;

    constructor(horizon: Horizon) {
        this.horizon = horizon;

        this.updateLumenUsdPrice();

        setInterval(() => this.updateLumenUsdPrice(), 5 * 60 * 1000);
    }

    async getAquaPrice(): Promise<number> {
        if (getEnv() === ENV_TESTNET) {
            return 0;
        }
        const { aquaStellarAsset } = getAquaAssetData();

        const res = await this.horizon.server.orderbook(aquaStellarAsset, createLumen()).call();

        return (+res.asks[0].price + +res.bids[0].price) / 2;
    }

    async getAquaUsdPrice(): Promise<number> {
        const [AQUA_XLM, XLM_USD] = await Promise.all([this.getAquaPrice(), getLumenUsdPrice()]);
        return AQUA_XLM * XLM_USD;
    }

    async getAssetLumenPrice(asset: ClassicToken) {
        const period = 3 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        const start = now - period;

        const { records } = await this.horizon.server
            .tradeAggregation(
                createLumen(),
                createAsset(asset.code, asset.issuer),
                start,
                now + 3600000,
                3600000,
                0,
            )
            .limit(1)
            .order('desc')
            .call();

        if (!records.length) {
            return null;
        }

        return roundToPrecision(1 / Number(records[0].close), 7);
    }

    async getAsset24hStats(
        base: ClassicToken,
        counter: ClassicToken,
    ): Promise<{ volume: number; changes24h: string; price: { n: string; d: string } }> {
        const period = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const resolution = 900000; // 15 minutes

        const start = now - period;

        const { records } = await this.horizon.server
            .tradeAggregation(base, counter, start, now + resolution, resolution, 0)
            .limit(period / resolution + 1)
            .order('desc')
            .call();

        const volume = records.reduce((acc, item) => acc + Number(item.base_volume), 0);

        const startPrice = +records[records.length - 1].open;
        const lastPrice = +records[0].close;

        const changes24h = (((lastPrice - startPrice) / startPrice) * 100).toFixed(2);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return { volume, changes24h, price: records[0].close_r };
    }

    async getAquaEquivalent(asset: ClassicToken, amount: string) {
        const { aquaStellarAsset } = getAquaAssetData();

        const res = await this.horizon.server
            .strictSendPaths(asset, amount, [aquaStellarAsset])
            .call();
        if (!res.records.length) {
            return '0';
        }
        return res.records.reduce(function (prev, current) {
            return +prev.destination_amount > +current.destination_amount ? prev : current;
        }).destination_amount;
    }

    private updateLumenUsdPrice() {
        getLumenUsdPrice().then(res => {
            this.priceLumenUsd = res;
        });
    }
}
