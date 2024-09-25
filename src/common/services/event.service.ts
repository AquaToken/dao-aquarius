export default class EventService {
    private id: number = 0;
    private listeners = new Map();

    sub(callback: (unknown: any) => unknown): () => void {
        this.id += 1;

        const listenId = this.id;

        this.listeners.set(listenId, callback);

        return () => this.unsub(listenId);
    }

    unsub(id: number): void {
        this.listeners.delete(id);
    }

    trigger(...args: unknown[]): void {
        this.listeners.forEach(callback => {
            callback(...args);
        });
    }
}
