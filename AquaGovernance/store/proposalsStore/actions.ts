import { Dispatch } from 'react';
import { ActionResult } from '../../../common/store/types';
import { PROPOSAL_ACTIONS } from './types';
import { getProposalsRequest } from '../../api/api';

export function getProposals() {
    return (dispatch: Dispatch<ActionResult>): void => {
        dispatch({ type: PROPOSAL_ACTIONS.GET_PROPOSAL_START });

        getProposalsRequest()
            .then((response) => {
                dispatch({
                    type: PROPOSAL_ACTIONS.GET_PROPOSAL_SUCCESS,
                    payload: {
                        proposals: response.data.results.sort(
                            (a, b) =>
                                new Date(b.start_at).getTime() - new Date(a.start_at).getTime(),
                        ),
                    },
                });
            })
            .catch(() => {
                dispatch({ type: PROPOSAL_ACTIONS.GET_PROPOSAL_FAIL });
            });
    };
}
