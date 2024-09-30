export type AssetSimple = {
    code: string;
    issuer: string;
};

export type AssetInfo = {
    asset_string: string | null;
    code: string | undefined;
    home_domain: string | null;
    image: string | null;
    issuer: string;
    name: string;
    auth_required?: boolean;
    desc?: string;
    accounts_authorized?: number;
    anchor_asset: string;
    anchor_asset_type: string;
    auth_clawback_enabled: boolean;
    auth_immutable: boolean;
    auth_revocable: boolean;
    balances_authorized: string;
    claimable_balances_amount: string;
    conditions: string;
    is_asset_anchored: boolean;
    is_verified: boolean;
    liquidity_pools_amount: string;
    is_supply_locked: boolean;
    first_transaction: string;
};

export type AssetsStore = {
    isLoading: boolean;
    errorLoading: boolean;
    assets: AssetSimple[];
    assetsInfo: Map<string, AssetInfo>;
};

export type ListResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export enum ASSETS_ACTIONS {
    GET_ASSETS_START = 'GET_ASSETS_START',
    GET_ASSETS_SUCCESS = 'GET_ASSETS_SUCCESS',
    GET_ASSETS_FAIL = 'GET_ASSETS_FAIL',
    UPDATE_ASSET_INFO = 'UPDATE_ASSET_INFO',
    CLEAR_ASSETS = 'CLEAR_ASSETS',
}
