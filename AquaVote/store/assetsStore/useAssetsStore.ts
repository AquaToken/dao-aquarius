import * as actions from './actions';
import bindActions from '../../../common/store/bindActions';
import { ActionAsyncResult } from '../../../common/store/types';
import { AssetsStore } from './types';
import { AssetSimple } from '../../api/types';
const { useGlobalStore } = require(`../../../${process.env.PROJECT_PATH}/store`);

type AssetsActions = {
    getAssets: () => ActionAsyncResult;
    processNewAssets: (assets: AssetSimple[]) => ActionAsyncResult;
};

const useAssetsStore = (): AssetsStore & AssetsActions => {
    const { state, dispatch } = useGlobalStore();

    // List props
    const { assetsStore } = state;

    // List Actions
    const { getAssets, processNewAssets } = actions;

    const assetsActions = bindActions(
        {
            getAssets,
            processNewAssets,
        },
        dispatch,
    );

    return { ...assetsStore, ...assetsActions };
};

export default useAssetsStore;