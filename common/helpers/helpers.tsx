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
