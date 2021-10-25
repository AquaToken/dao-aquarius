export default class Timer {
    callback: () => void;
    remainingTime: number;
    startTime: number;
    timerId: NodeJS.Timeout;

    constructor(callback: () => void, delay: number) {
        this.callback = callback;
        this.remainingTime = delay;
    }

    start(): void {
        this.startTime = Date.now();
        this.timerId = setTimeout(() => this.callback(), this.remainingTime);
    }

    pause(): void {
        clearTimeout(this.timerId);
        this.remainingTime -= Date.now() - this.startTime;
    }

    resume(): void {
        this.startTime = Date.now();
        this.timerId = setTimeout(() => this.callback(), this.remainingTime);
    }

    clear(): void {
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
    }
}
