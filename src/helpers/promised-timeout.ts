export default function PromisedTimeout(timeout: number) {
    return new Promise(resolve => {
        setTimeout(() => resolve(void 0), timeout);
    });
}
