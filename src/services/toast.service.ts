import EventService from './event.service';

export enum TOAST_TYPE {
    success = 'success',
    error = 'error',
}

export type Toast = {
    text: string;
    type: TOAST_TYPE;
    id: number;
    resolver: (value?: unknown) => void;
    delay: number;
};

export default class ToastServiceClass {
    id = 1;
    toasts: Toast[] = [];
    event = new EventService();

    showSuccessToast(text: string, delay?: number): void {
        this.showToast(TOAST_TYPE.success, text, delay);
    }

    showErrorToast(text: string, delay?: number): void {
        this.showToast(TOAST_TYPE.error, text, delay);
    }

    private showToast(type: TOAST_TYPE, text: string, delay = 10000): void {
        this.id += 1;
        let resolver: (value: unknown) => void = undefined;

        const promise = new Promise(resolve => {
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

        if (window?.navigator?.vibrate) {
            window?.navigator?.vibrate(200);
        }
        this.event.trigger(this.toasts);

        promise.then(({ id }: { id: number }) => {
            this.toasts = this.toasts.filter(toast => toast.id !== id);
            this.event.trigger(this.toasts);
        });
    }
}
