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

    return `${months[month]} ${day}${withoutYear ? '' : `, ${year}`}${
        withTime ? `, ${hours == 24 ? '00' : `0${hours}`.slice(-2)}:${`0${minutes}`.slice(-2)}` : ''
    }`;
};
