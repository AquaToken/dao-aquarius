import { TIMEFRAMES } from 'constants/intervals';

import { Interval, HandlerFunction, Options } from 'types/intervals';

const Intervals = new (class {
    private intervals: Record<string, Interval> = {};

    private intervalsRunning: Record<string, boolean> = {};

    private isPaused = false;

    private intervalsPaused: Record<string, boolean> = {};

    private pauser: NodeJS.Timer | null = null;

    public get state() {
        return {
            pauser: this.pauser,
            isPaused: this.isPaused,
            intervalsPaused: this.intervalsPaused,
            intervalsRunning: this.intervalsRunning,
            intervals: this.intervals,
        };
    }

    private clear = (name: string): void => {
        if (this.intervals[name]?.handler) {
            clearTimeout(this.intervals[name].handler);
        }
    };

    private createInterval = (name: string, func: HandlerFunction, timeout: number) => {
        const callFunc = async () => {
            if (this.isPaused) {
                this.intervalsPaused[name] = true;
            } else {
                await func();
            }

            if (this.intervalsRunning[name] && !this.isPaused) {
                this.intervals[name].handler = setTimeout(callFunc, timeout);
            }
        };

        return setTimeout(callFunc, timeout);
    };

    /**
     * Set an interval to run.
     * @param {string} name - the identifier of the interval
     * @param {function} func - the function to run
     * @param {number} timeout - the time in milliseconds between runs
     * @param {Object} options - the time in milliseconds between runs
     * @param {Object} [options.isInstantCall=true] - run function before start the interval
     * @returns {Object} null
     */
    public set = async (
        name: string,
        func: HandlerFunction,
        { isInstantCall = true, timeout }: Options,
    ) => {
        if (this.intervalsRunning[name]) {
            return false;
        }

        if (isInstantCall) {
            await func();
        }

        this.clear(name);
        this.intervals[name] = {
            func,
            timeout,
            handler: this.createInterval(name, func, timeout),
        };
        this.intervalsRunning[name] = true;
        return true;
    };

    /**
     * Stop an interval.
     * @param {string} name - the identifier of the interval
     * @returns {Object} null
     */
    public stop = (name: string) => {
        if (!this.intervalsRunning[name]) {
            return;
        }

        this.clear(name);
        this.intervalsRunning[name] = false;
    };

    /**
     * Pause intervals
     * @returns {Object} null
     */
    public pause = () => {
        if (this.pauser) {
            clearTimeout(this.pauser);
        }

        this.isPaused = true;
    };

    /**
     * Pause intervals (in 30 minutes).
     * @returns {Object} null
     */
    public pauseSoon = () => {
        if (this.isPaused) {
            return;
        }

        clearTimeout(this.pauser!);

        this.pauser = setTimeout(this.pause, TIMEFRAMES.MINUTE * 30);
    };

    /**
     * Resume intervals. Run any interval that tried to run while paused.
     * @returns {Object} null
     */
    public resume = () => {
        if (!this.isPaused) {
            return;
        }

        clearTimeout(this.pauser!);

        this.isPaused = false;
        Object.keys(this.intervalsPaused).forEach(async name => {
            if (this.intervals[name]) {
                this.clear(name);
                const { func, timeout } = this.intervals[name];

                await func();

                this.intervals[name].handler = this.createInterval(name, func, timeout);
            }
        });

        this.intervalsPaused = {};
    };
})();

declare global {
    interface Window {
        getRunningIntervals: () => {
            name: string;
            func: HandlerFunction;
            timeout: number;
            handler: NodeJS.Timeout | null;
        }[];
    }
}

// for debugging
window.getRunningIntervals = () => {
    const { intervalsRunning, intervals: activeIntervals } = Intervals.state;

    return Object.keys(intervalsRunning).map(name => ({
        name,
        ...activeIntervals[name],
    }));
};

export default Intervals;
