import * as React from 'react';
import { useLayoutEffect } from 'react';

export default function useAnimationEnd(
    animationRef: React.RefObject<HTMLElement>,
    handler: () => void,
    offset = 50,
): void {
    useLayoutEffect(() => {
        function checkAnimation(ref: React.RefObject<HTMLElement>) {
            const computedStyle = getComputedStyle(ref.current);
            const animationDuration = parseFloat(computedStyle.animationDuration) * 1000;
            const animationDelay = parseFloat(computedStyle.animationDelay) * 1000;

            const totalTime = animationDuration + animationDelay;

            setTimeout(() => {
                handler();
            }, totalTime - offset);
        }

        // start polling
        requestAnimationFrame(() => checkAnimation(animationRef));
    });
}
