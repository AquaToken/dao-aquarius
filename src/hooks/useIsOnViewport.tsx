import * as React from 'react';
import { useEffect, useState } from 'react';

function isElementInViewport(el: HTMLDivElement) {
    const rect = el.getBoundingClientRect();

    return rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
}

function isElementOverScrolled(el: HTMLDivElement, offset: number) {
    const rect = el.getBoundingClientRect();
    return rect.bottom < (offset || 0);
}

function useEventsListener(handler: () => void) {
    useEffect(() => {
        document.addEventListener('load', handler, { once: true, capture: true });
        document.addEventListener('scroll', handler, { passive: true, capture: true });
        window.addEventListener('resize', handler, false);

        return () => {
            document.removeEventListener('load', handler, { capture: true });
            document.removeEventListener('scroll', handler, { capture: true });
            window.removeEventListener('resize', handler, false);
        };
    }, []);
}

export function useIsOnViewport(ref: React.RefObject<HTMLDivElement>) {
    const [isOnViewport, setIsOnViewport] = useState(false);

    const handler = () => {
        if (!ref.current) {
            return;
        }
        const onViewport = isElementInViewport(ref.current);
        setIsOnViewport(onViewport);
    };

    useEventsListener(handler);

    return isOnViewport;
}

export function useIsOverScrolled(ref: React.RefObject<HTMLDivElement>, offset: number) {
    const [isOnViewport, setIsOnViewport] = useState(false);

    const handler = () => {
        if (!ref.current) {
            return;
        }
        const onViewport = isElementOverScrolled(ref.current, offset);
        setIsOnViewport(onViewport);
    };

    useEventsListener(handler);

    return isOnViewport;
}
