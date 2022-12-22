import * as React from 'react';
import { useEffect } from 'react';

export default function useOnClickOutside(
    ref: React.RefObject<any>,
    handler: (event: MouseEvent) => void,
): void {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}
