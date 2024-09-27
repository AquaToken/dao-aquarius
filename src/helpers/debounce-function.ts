export default function (func: () => void, delay: number) {
    let timer: NodeJS.Timeout;
    return (...args: unknown[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}