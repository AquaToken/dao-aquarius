import { RefObject, useEffect, useRef, useState } from 'react';

/**
 * A reusable hook that triggers animations when an element enters the viewport.
 *
 * Uses the Intersection Observer API to detect visibility changes.
 *
 * @param threshold - A number between 0 and 1 defining how much of the element must be visible
 *                    before the animation triggers. (e.g., 0.2 = 20% visible)
 * @param animateOnce - If true, the animation triggers only once and won't reset when leaving the viewport.
 *                      If false, the visibility state toggles each time the element enters/leaves.
 *
 * @returns {Object} - An object containing:
 *   - `ref`: a React ref to attach to the observed element
 *   - `visible`: a boolean indicating whether the element is currently visible
 *
 * @example
 * const { ref, visible } = useScrollAnimation(0.25);
 * return <Wrapper ref={ref} $visible={visible}>Content</Wrapper>;
 */
export const useScrollAnimation = (
    threshold: number = 0.2,
    animateOnce: boolean = true,
): {
    ref: RefObject<HTMLElement>;
    visible: boolean;
} => {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        // Strictly typed observer callback
        const observerCallback: IntersectionObserverCallback = (
            entries: IntersectionObserverEntry[],
            observer: IntersectionObserver,
        ): void => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                if (entry.isIntersecting) {
                    setVisible(true);

                    // Stop observing if animation should only trigger once
                    if (animateOnce) observer.disconnect();
                } else if (!animateOnce) {
                    // Reset visibility when the element leaves the viewport
                    setVisible(false);
                }
            });
        };

        const observerOptions: IntersectionObserverInit = { threshold };

        const observer: IntersectionObserver = new IntersectionObserver(
            observerCallback,
            observerOptions,
        );

        observer.observe(node);

        // Cleanup on unmount
        return () => observer.disconnect();
    }, [threshold, animateOnce]);

    return { ref, visible };
};
