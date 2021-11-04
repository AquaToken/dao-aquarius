import { AuthStore } from '../../common/store/authStore/types';
import { Action } from '../../common/store/types';
import { ProposalStore } from './proposalsStore/types';

export interface State {
    authStore: AuthStore;
    proposalsStore: ProposalStore;
}

export interface ContextProps {
    state: State;
    dispatch: React.Dispatch<Action>;
}
