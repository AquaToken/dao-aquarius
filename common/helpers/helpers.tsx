type GetDateStringConfig = {
    withTime?: boolean;
    withoutYear?: boolean;
};

export const getDateString = (timestamp: number, config?: GetDateStringConfig): string => {
    const { withTime, withoutYear } = config ?? {};
    const date = new Date(timestamp),
        year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate(),
        hours = date.getHours(),
        minutes = date.getMinutes(),
        months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

    return `${months[month]}. ${day}${withoutYear ? '' : `, ${year}`}${
        withTime ? `, ${hours == 24 ? '00' : `0${hours}`.slice(-2)}:${`0${minutes}`.slice(-2)}` : ''
    }`;
};

export const getTimeString = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours == 24 ? '00' : `0${hours}`.slice(-2)}:${`0${minutes}`.slice(-2)}`;
};

export const roundToPrecision = (value: string | number, numDecimals: number): string => {
    const multiplier = 10 ** numDecimals;

    return (Math.round(Number(value) * multiplier) / multiplier).toString();
};

const getNumDecimals = (value: number): number => {
    if (value >= 2000) {
        return 0;
    } else if (value >= 10) {
        return 2;
    } else if (value >= 1) {
        return 3;
    } else if (value >= 0.1) {
        return 4;
    } else if (value >= 0.01) {
        return 5;
    } else if (value >= 0.001) {
        return 6;
    }
    return 7;
};

export const formatBalance = (balance: number, withRounding?: boolean): string => {
    const precision = getNumDecimals(balance);

    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: withRounding ? precision : 7,
        minimumFractionDigits: withRounding ? precision : undefined,
    }).format(balance);
};
