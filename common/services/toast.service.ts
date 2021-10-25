import EventService from './event.service';

export enum TOAST_TYPE {
    success = 'success',
    error = 'error',
}

export default class ToastServiceClass {
    id = 1;
    toasts = [];
    event = new EventService();

    showSuccessToast(text: string, delay?: number): void {
        this.showToast(TOAST_TYPE.success, text, delay);
    }

    showErrorToast(text: string, delay?: number): void {
        this.showToast(TOAST_TYPE.error, text, delay);
    }

    private showToast(type: TOAST_TYPE, text: string, delay = 10000): void {
        this.id += 1;
        let resolver: (unknown) => void = undefined;

        const promise = new Promise((resolve) => {
            const id = this.id;
            resolver = () => {
                resolve({ id });
            };
        });

        this.toasts = [
            ...this.toasts,
            {
                text,
                type,
                id: this.id,
                resolver,
                delay,
            },
        ];

        this.event.trigger(this.toasts);

        promise.then(({ id }) => {
            this.toasts = this.toasts.filter((toast) => toast.id !== id);
            this.event.trigger(this.toasts);
        });
    }
}
