export type HandlerFunction = () => unknown | Promise<unknown>;

export interface Interval {
    handler: NodeJS.Timer;
    func: HandlerFunction;
    timeout: number;
}

export interface Options {
    isInstantCall?: boolean;
    timeout: number;
}
