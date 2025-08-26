import { POOL_TYPE } from 'constants/amm';

import { NativePrice } from 'types/amm';
import { Token } from 'types/token';

type IncentivePool = {
    address: string;
    tokens_addresses: string[];
    pool_type: POOL_TYPE;
    fee: string;
};

type IncentivePoolProcessed = IncentivePool & { tokens: Token[] };

type BaseIncentive<P> = {
    tps: string;
    pool_address: string;
    token: NativePrice;
    pool: P;
    start_at_str: string;
    expired_at_str: string;
};

export type Incentive = BaseIncentive<IncentivePool>;
export type IncentiveProcessed = BaseIncentive<IncentivePoolProcessed> & {
    tokenInstance: Token;
};
