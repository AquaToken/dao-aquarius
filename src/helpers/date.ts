type GetDateStringConfig = {
    withTime?: boolean;
    withoutYear?: boolean;
    withoutDay?: boolean;
};

export const getDateString = (timestamp: number, config?: GetDateStringConfig): string => {
    const { withTime, withoutYear, withoutDay } = config ?? {};
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

    return `${months[month]}${withoutDay ? '' : ` ${day}`}${withoutYear ? '' : `, ${year}`}${
        withTime ? `, ${hours == 24 ? '00' : `0${hours}`.slice(-2)}:${`0${minutes}`.slice(-2)}` : ''
    }`;
};

export const getTimeAgoValue = (timestamp: string | number): string => {
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const timeFromTimestamp = Date.now() - new Date(timestamp).getTime();

    const minutesAgo = Math.floor(timeFromTimestamp / minute);
    const hoursAgo = Math.floor(timeFromTimestamp / hour);
    const daysAgo = Math.floor(timeFromTimestamp / day);

    if (timeFromTimestamp < hour) {
        return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
    }

    if (timeFromTimestamp < day) {
        return `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`;
    }

    if (timeFromTimestamp < 3 * day) {
        const remainingHours = Math.floor((timeFromTimestamp % day) / hour);

        return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ${
            remainingHours ? `${remainingHours} hour${remainingHours === 1 ? ' ' : 's '}` : ''
        }ago`;
    }

    return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
};

export const getTimeString = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours == 24 ? '00' : `0${hours}`.slice(-2)}:${`0${minutes}`.slice(-2)}`;
};

export const convertLocalDateToUTCIgnoringTimezone = (utcDate: Date) =>
    new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate(),
        utcDate.getUTCHours(),
        utcDate.getUTCMinutes(),
        utcDate.getUTCSeconds(),
        utcDate.getUTCMilliseconds(),
    );

export function convertUTCToLocalDateIgnoringTimezone(date: Date) {
    const timestamp = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
    );

    return new Date(timestamp);
}
