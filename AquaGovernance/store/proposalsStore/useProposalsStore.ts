import * as actions from './actions';
import bindActions from '../../../common/store/bindActions';
import { ActionAsyncResult } from '../../../common/store/types';
import { ProposalStore } from './types';
const { useGlobalStore } = require(`../../../${process.env.PROJECT_PATH}/store`);

type ProposalsActions = {
    getProposals: () => ActionAsyncResult;
};

const useProposalsStore = (): ProposalStore & ProposalsActions => {
    const { state, dispatch } = useGlobalStore();

    // List props
    const { proposalsStore } = state;

    // List Actions
    const { getProposals } = actions;

    const proposalsActions = bindActions(
        {
            getProposals,
        },
        dispatch,
    );

    return { ...proposalsStore, ...proposalsActions };
};

export default useProposalsStore;
