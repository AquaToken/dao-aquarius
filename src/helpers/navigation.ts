import { useNavigate } from 'react-router-dom';

type Navigate = ReturnType<typeof useNavigate>;

export function navigateBackWithFallback(navigate: Navigate, fallbackRoute: string): void {
    if (window.history.state?.idx > 0) {
        navigate(-1);
        return;
    }

    navigate(fallbackRoute);
}
