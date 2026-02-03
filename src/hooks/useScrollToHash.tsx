import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToHash = () => {
    const { hash, pathname } = useLocation();

    useEffect(() => {
        if (!hash) return;
        const id = decodeURIComponent(hash.slice(1));
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, [hash, pathname]);
};
