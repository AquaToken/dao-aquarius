type EventType<A> = {
    type: A;
};

export default class EventService<T, P> {
    private id: number = 0;
    private listeners = new Map();

    sub(callback: ({ type }: EventType<T> & P) => void): () => void {
        this.id += 1;

        const listenId = this.id;

        this.listeners.set(listenId, callback);

        return () => this.unsub(listenId);
    }

    unsub(id: number): void {
        this.listeners.delete(id);
    }

    trigger(event: EventType<T> & P): void {
        this.listeners.forEach(callback => {
            callback(event);
        });
    }
}
