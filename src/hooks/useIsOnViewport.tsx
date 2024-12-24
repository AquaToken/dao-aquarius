import * as React from 'react';
import { useEffect, useState } from 'react';

function isElementInViewport(el: HTMLElement) {
    if (!el) return;
    const rect = el.getBoundingClientRect();

    return rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
}

export function isElementOverScrolled(el: HTMLElement, offset: number) {
    if (!el) return;
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

export function useIsOnViewport(ref: React.RefObject<HTMLElement>) {
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

export function useIsOverScrolled(ref: React.RefObject<HTMLElement>, offset: number) {
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

export function useActiveAnchorIndex(anchors: React.RefObject<HTMLElement>[], offset = 50) {
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    const calculateActiveIndex = () => {
        const currentIndex = anchors.findIndex((_, i) => {
            const isCurrentInView = !isElementOverScrolled(anchors[i].current, offset);
            const isPreviousScrolledOut =
                i === 0 || isElementOverScrolled(anchors[i - 1].current, offset);
            return isCurrentInView && isPreviousScrolledOut;
        });
        setActiveIndex(currentIndex);
    };

    useEventsListener(calculateActiveIndex);

    return activeIndex;
}
