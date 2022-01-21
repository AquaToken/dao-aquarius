import { ASSETS_ACTIONS, AssetsStore } from './types';
import { ActionSimpleResult } from '../../../common/store/types';
import { Asset } from '../../api/types';

export const ASSET_CACHE = 'assets';

export const LumenInfo: Asset = {
    code: 'XLM',
    issuer: undefined,
    name: 'Lumens',
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFQ0lEQVR4Xt1aMY8UNxS+P5A9a0V2NhWLuN29NKmSDiQEJSmONlIUWhIpobwiUahIkQKkBCEqQEIoVTYSQhQprkBIoTrpQKQcQdIf5A9M/HnXe763zzN+Hs/uLJ/06U777Bl/9vPzs8cbGw1DqcFAfTi83M2GN1Q2nqhstK//5poFYT6zTVRv+5rqnd5R/cGAPm8toE5snZsJ5oRKmXd7o7t4Jn1Pq6BHWumG/qh640NGRCrm8KZWecaShB+nflc3G99YeUfoxny3VOGLNB5B29U4VH97oLLhHtOgVTFfmjeo1Y+6j7pNH1+l7U2KWWSnL24VEY9ou5PALEXMC9tItJW2vxZmCcrCi9rN0T7VEYV1GnnK2p7QwfrOPHidiHyB6gqCQrRnHrieFK4OZp1v51IXy0NRnqDSbGJaxuEe1cnCbDYWKtfnyeFnxeeXvixu3blfPHryZ/H6zb9zHrx4VTx99tzYUIbWTceKqTBNcdOO/iefnjfC3r77rwgFyj74bWLq0ueVMaD8ITZvVPccKTM9jPhtLbwuQjoCdpQDqI2y29u+RnUbpAx8cGO4NsV0ZH8vdn+4Xnzx1TfFmQs7xUVdFsRvD7WN1kOdK9/uLrwDRCf/9POvx7yLlmHIe0GquQ8hFE+f/WVE0rI+QvDBy1da3C9GJLVzwi1oWY6sF6gEc5+KRwN3v7++UC6WZcLhOYJOPjwu/sTWOaaQiGe1O9MGVc3dUFYJ902RUvadM8a6+T6EunM3lfhGhM+oA/7NIw+o6f42AgNobF3xscKFOUQ+FT9d+6kxmBDros6cLxOO3xAUaR0QwpFIAdRWyo9OndwwHyCoQUB39DE61B7CEOHcauAKt6BlSokDVfMVhhoEdBvtc00fY4XD66hwC1q2jCYO6ORnQg2hxAhYSEcfS2aMcNfjXEhzDbCTjf9AB0Qfd7mp7mO9waF2jvASmu0BscIBX2wI4L5eAbZzxhBE1w2rgl8Twi24uoHMsQTSH4N58PLveSN87hcj3MYGDnB11LOQTj3KWh3gCqMdgPiAfT5FiHAuNrhz3F16W9cB3NIEpBBuefb8Udrdmg6AuJTCqzI+C+waqV3C6CCIxlcB+3suLY4VbunuOuEh1C5gHr0M+oIU0JRwS3dlwFJM7QLuixMh3xwHYoTjt6ollJKLPTE0iVBHp4PUUEYOcMMY4b7YUEZ4yfwZb98t2EXEyZD0KMwFF6HBJoRbuqMPj6N2EXujHfF2GFiFcNAdfYDzOhHt1yLJSsAJB2M2NxJCrPv82qNvD0QAaRxwGZPqStnEkVvH/XSOA0JaoIrLEA5S8QAOYGk5Md1DUdMJgR9F8EGDNghILRzkppV0yfTwyP2POiDsZIiiTLgNitgUhSY5oC/XSCS++KDP3C3E56IQL7AoEw5CMB09eA6yOIwsRGJTAxfH/1/r8rDROraeL/hG0H9XIMQLAERgn3BLCEO5ukCqW/UuCY99D6AI8QJp9LUdwY2sDygL4dJ3BbD6RqnKtq4yFZMQbgxhSKSwjX395p85cWkCNpRJOeIu2bnPYTMb7tHK7wEXI78PKe8KtILQUuX6FE1OheWz4m6QD3VS5Law22cuQ0jQ7Y3u0YeuC7v90T2qJwqxx2arZaLL0hbr5AnJRp6i06/OFFfN0kwvBczq0MYl0rQpMtpL0cSN0jo0iZt0nU8BpJZqlR2xzFH3Ad5g8oVlTgv9LhOPuBufqwI6onGPaKNwDjhv60yXzXxBhJy58TB6hrcumG6sTu/gsGUzG082p0lVzgmFDWUg2HjTEgLb/x9zpjyg3HNTAAAAAElFTkSuQmCC',
    asset_string: 'XLM:native',
    home_domain: 'stellar.org',
};

export const initialState: AssetsStore = {
    isLoading: false,
    errorLoading: false,
    assets: [],
    assetsInfo: new Map(JSON.parse(localStorage.getItem(ASSET_CACHE) || '[]')),
};

export default function proposalStore(
    state = initialState,
    action: ActionSimpleResult,
): AssetsStore {
    switch (action.type) {
        case ASSETS_ACTIONS.GET_ASSETS_START: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case ASSETS_ACTIONS.GET_ASSETS_SUCCESS: {
            const { assets } = action.payload as { assets: any[] };
            return {
                ...state,
                isLoading: false,
                assets: assets,
            };
        }
        case ASSETS_ACTIONS.GET_ASSETS_FAIL: {
            return {
                ...state,
                isLoading: false,
                errorLoading: true,
            };
        }

        case ASSETS_ACTIONS.UPDATE_ASSET_INFO: {
            const { assetInfo } = action.payload as { assetInfo: Map<string, Asset> };
            return {
                ...state,
                assetsInfo: assetInfo,
            };
        }
        case ASSETS_ACTIONS.CLEAR_ASSETS: {
            return {
                ...state,
                assetsInfo: new Map(),
            };
        }
        default: {
            return state;
        }
    }
}
