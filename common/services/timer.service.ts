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
        console.log('start');
        this.startTime = Date.now();
        this.timerId = setTimeout(() => this.callback(), this.remainingTime);
    }

    pause(): void {
        console.log('pause');
        clearTimeout(this.timerId);
        this.remainingTime -= Date.now() - this.startTime;
        console.log(this.remainingTime);
    }

    resume(): void {
        console.log('resume');
        console.log(this.remainingTime);
        this.startTime = Date.now();
        this.timerId = setTimeout(() => this.callback(), this.remainingTime);
    }

    clear(): void {
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
    }
}
