import { ActionResult, ActionSimpleResult } from './types';

export const actionHandler =
    (dispatch: React.Dispatch<ActionResult>, state: any) =>
    (action: ActionResult): void => {
        return typeof action === 'function' ? action(dispatch, state) : dispatch(action);
    };

export const logger = (action: ActionSimpleResult, prevState: any, currentState: any): void => {
    console.groupCollapsed('Logger');
    console.log('%c Action:', 'color: blue', action);
    console.log('%c Previous State:', 'color: red', prevState);
    console.log('%c Current State:', 'color: green', currentState);
    console.groupEnd();
};
