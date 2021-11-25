import { Asset, AssetSimple } from '../../api/types';

export type AssetsStore = {
    isLoading: boolean;
    errorLoading: boolean;
    assets: AssetSimple[];
    assetsInfo: Map<string, Asset>;
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
}
