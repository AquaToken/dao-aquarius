export type ActionSimpleResult = {
    type: string;
    payload?: unknown;
};

export type ActionAsyncResult = (dispatch: React.Dispatch<ActionResult>, state?: any) => void;

export type ActionResult = ActionSimpleResult | ActionAsyncResult;

export type Action = (unknown) => ActionResult;
