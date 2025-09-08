export type ColorScheme = 'light' | 'dark';

export const getSystemTheme = (): ColorScheme => {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return 'light'; // fallback if matchMedia is not supported
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getIsDarkTheme = (): boolean => getSystemTheme() === 'dark';
