import { AuthStore } from '../../common/store/authStore/types';
import { Action } from '../../common/store/types';

export interface State {
    authStore: AuthStore;
}

export interface ContextProps {
    state: State;
    dispatch: React.Dispatch<Action>;
}
