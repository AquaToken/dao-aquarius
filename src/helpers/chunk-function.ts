export default async function chunkFunction<T, R>(
    args: T[],
    promiseFunction: (value: T) => Promise<R>,
    chunkSize = 10,
): Promise<R[]> {
    const result: R[] = [];
    for (let i = 0; i < args.length; i += chunkSize) {
        const chunk = args.slice(i, i + chunkSize);
        const chunkResult = await Promise.all(chunk.map(item => promiseFunction(item)));
        result.push(...chunkResult);
    }
    return result;
}
