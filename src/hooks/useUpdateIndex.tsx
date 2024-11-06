import { useEffect, useState } from 'react';

export const useUpdateIndex = (ms: number) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => prev + 1);
        }, ms);

        return () => clearInterval(interval);
    }, []);

    return index;
};
