import { useEffect } from 'react';

export const useScrollToHash = () => {
    useEffect(() => {
        if (window.location.hash) {
            const id = window.location.hash.substring(1); // removing #
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);
};
