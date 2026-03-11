import {
    addWeeks,
    endOfWeek,
    format,
    isBefore,
    isSunday,
    nextMonday,
    nextSunday,
    setHours,
    startOfDay,
    startOfWeek,
} from 'date-fns';

import { DAY } from 'constants/intervals';

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

export const convertDateStrToTimestamp = (str: string): number =>
    convertUTCToLocalDateIgnoringTimezone(new Date(str)).getTime();

export function formatDuration(ms: number): string {
    const MS_IN_DAY = 1000 * 60 * 60 * 24;

    // Handle values smaller than one full day
    if (ms < MS_IN_DAY) {
        return '0d';
    }

    let days = Math.floor(ms / MS_IN_DAY);

    let years = Math.floor(days / 365);
    days %= 365;

    let months = Math.floor(days / 30);
    days %= 30;

    // Normalize: if months reach 12, convert to 1 year
    if (months === 12) {
        years += 1;
        months = 0;
    }

    // Format the result depending on scale
    if (years > 0) {
        return months > 0 ? `${years}y ${months}m` : `${years}y`;
    } else if (months > 0) {
        return days > 0 ? `${months}m ${days}d` : `${months}m`;
    } else {
        return `${days}d`;
    }
}

export const roundMsToDays = (timestamp: number) => Math.floor(timestamp / DAY);

/**
 * Calculates the earliest available Monday start date
 * for scheduling a new bribe distribution period.
 *
 * Bribe rounds always start on Monday.
 * If the current time is before the weekly collection cutoff
 * (Sunday 18:00 local time), the next Monday is valid.
 * If the cutoff has already passed, the next available start date
 * will be the Monday after the upcoming one.
 */
export const getNextAvailableBribeStartDate = (): Date => {
    // Current timestamp
    const now = Date.now();

    // Determine the cutoff time: Sunday 18:00 local time
    const collectionCutoff = convertUTCToLocalDateIgnoringTimezone(
        setHours(
            startOfDay(isSunday(now) ? now : nextSunday(now)), // current or next Sunday
            18, // cutoff hour (6 PM)
        ),
    );

    // If current time is before Sunday 18:00 → use next Monday
    // Otherwise → skip one week ahead
    const nextStart = isBefore(now, collectionCutoff)
        ? nextMonday(now)
        : nextMonday(nextMonday(now));

    // Return the start of the selected Monday (00:00)
    return startOfDay(nextStart);
};

/**
 * Calculates the start and end dates of a multi-week bribe period.
 *
 * Each bribe period always begins on Monday and ends on Sunday.
 * The duration is measured in full weeks (e.g., 1 week, 2 weeks, etc.).
 *
 * @param date - Any date that falls within the desired start week
 * @param duration - Number of weeks the bribe will run
 * @returns Object containing start (Monday) and end (Sunday) dates of the full period
 */
export const getBribePeriodRange = (date: number | Date, duration: number) => {
    // Determine the Monday of the week that contains the given date
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });

    // Determine the Sunday of that same week
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

    // Extend the end date based on duration (in weeks)
    // Example: duration = 3 → adds 2 more weeks to the end date
    const fullPeriodEnd = addWeeks(weekEnd, duration - 1);

    // Convert both start and end dates to local time
    return {
        start: convertUTCToLocalDateIgnoringTimezone(weekStart),
        end: convertUTCToLocalDateIgnoringTimezone(fullPeriodEnd),
    };
};

export const getWeekStart = (weeksFromNow: number) =>
    format(
        startOfWeek(addWeeks(new Date(), weeksFromNow), {
            weekStartsOn: 1,
        }),
        'yyyy-MM-dd',
    );

export const getNextWeekStartFromString = (dateStr: string): string =>
    format(
        startOfWeek(addWeeks(new Date(dateStr), 1), {
            weekStartsOn: 1,
        }),
        'yyyy-MM-dd',
    );
