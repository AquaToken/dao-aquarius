import * as React from 'react';
import { useEffect, useState } from 'react';

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();

    return rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
}

function isElementOverScrolled(el, offset) {
    const rect = el.getBoundingClientRect();
    return rect.bottom < (offset || 0);
}

export function useIsOnViewport(ref) {
    const [isOnViewport, setIsOnViewport] = useState(false);

    const handler = () => {
        if (!ref.current) {
            return;
        }
        const onViewport = isElementInViewport(ref.current);
        setIsOnViewport(onViewport);
    };

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

    return isOnViewport;
}

export function useIsOverScrolled(ref, offset) {
    const [isOnViewport, setIsOnViewport] = useState(false);

    const handler = () => {
        if (!ref.current) {
            return;
        }
        const onViewport = isElementOverScrolled(ref.current, offset);
        setIsOnViewport(onViewport);
    };

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

    return isOnViewport;
}
