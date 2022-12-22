import * as actions from './actions';
import bindActions from '../bindActions';
import { AssetsStore } from './types';
import { ActionAsyncResult, ActionSimpleResult } from '../types';
import { useGlobalStore } from '../index';

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
