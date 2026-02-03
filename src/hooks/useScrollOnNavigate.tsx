import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollOnNavigate() {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        document.body.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);
}
