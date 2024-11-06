import * as actions from './actions';
import { AssetsStore } from './types';

import bindActions from '../bindActions';
import { useGlobalStore } from '../index';
import { ActionAsyncResult, ActionSimpleResult } from '../types';

type AssetsActions = {
    getAssets: () => ActionAsyncResult;
    processNewAssets: (assets: any[]) => ActionAsyncResult;
    clearAssets: () => ActionSimpleResult;
};

const useAssetsStore = (): AssetsStore & AssetsActions => {
    const { state, dispatch } = useGlobalStore();

    // List props
    const { assetsStore } = state;

    // List Actions
    const { getAssets, processNewAssets, clearAssets } = actions;

    const assetsActions = bindActions(
        {
            getAssets,
            processNewAssets,
            clearAssets,
        },
        dispatch,
    ) as unknown as AssetsActions;

    return { ...assetsStore, ...assetsActions };
};

export default useAssetsStore;
