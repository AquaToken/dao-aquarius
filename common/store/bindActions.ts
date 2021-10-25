import { Dispatch } from 'react';
import { Action, ActionResult } from './types';

export default function bindActions(
    actions: Record<string, (...args: any) => ActionResult>,
    dispatch: React.Dispatch<ActionResult>,
): Record<string, (unknown) => void> {
    const bindAction = (action: Action, dispatch: Dispatch<ActionResult>) => {
        return function (...args) {
            // eslint-disable-next-line prefer-spread
            return dispatch(action.apply(null, args));
        };
    };
    // if it's a single action
    // if (typeof actions === 'function') {
    //     return bindAction(actions, dispatch);
    // }
    if (typeof actions !== 'object' || actions === null) {
        throw new Error(
            `bindActions expected an object or a function, instead received ${
                actions === null ? 'null' : typeof actions
            }. `,
        );
    }
    const boundActions: Record<string, (unknown) => void> = {};
    for (const key in actions) {
        const action: Action = actions[key];
        if (typeof action === 'function') {
            boundActions[key] = bindAction(action, dispatch);
        }
    }
    return boundActions;
}
