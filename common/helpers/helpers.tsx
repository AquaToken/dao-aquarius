export function makeComparator({ key = null, isNum = false, isReversedSort = false } = {}) {
    return (a, b) => {
        let aVal = key ? a[key] : a;
        let bVal = key ? b[key] : b;

        if (!aVal && !bVal) {
            return 0;
        }

        if (!aVal) {
            return isReversedSort ? 1 : -1;
        }

        if (!bVal) {
            return isReversedSort ? -1 : 1;
        }

        if (!isNum) {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        if (isNum) {
            return isReversedSort ? aVal - bVal : bVal - aVal;
        } else {
            if (aVal > bVal) {
                return isReversedSort ? 1 : -1;
            }
            if (aVal < bVal) {
                return isReversedSort ? -1 : 1;
            }
        }
        return 0;
    };
}

export const getDateString = (timestamp: string): string => {
    const date = new Date(Number(timestamp)),
        year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate(),
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

    return `${months[month]}. ${day}, ${year}`;
};

export const roundToPrecision = (value: string | number, numDecimals): string => {
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
