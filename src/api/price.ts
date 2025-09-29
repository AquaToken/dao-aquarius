import axios from 'axios';

import { API_ST_TICKER } from 'constants/api';

export async function getLumenUsdPrice(): Promise<number> {
    const { data } = await axios.get<{ _meta: { externalPrices: { USD_XLM: number } } }>(
        `${API_ST_TICKER}?${Math.random()}`,
    );
    return data._meta.externalPrices.USD_XLM;
}
