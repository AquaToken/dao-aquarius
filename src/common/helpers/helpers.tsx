import { Asset } from '@stellar/stellar-sdk';
import { StellarService } from '../services/globalServices';

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
            Boolean(remainingHours)
                ? `${remainingHours} hour${remainingHours === 1 ? ' ' : 's '}`
                : ''
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

export const roundToPrecision = (value: string | number, numDecimals: number): string => {
    const multiplier = 10 ** numDecimals;

    return (Math.floor(Number(value) * multiplier) / multiplier).toString();
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
    if (value >= 0.0000001) {
        return 7;
    }
    return 0;
};

function nFormatter(num, digits) {
    const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'K' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'B' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'Q' },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
        .slice()
        .reverse()
        .find((i) => num >= i.value);
    return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}

export const formatBalance = (
    balance: number,
    withRounding?: boolean,
    withLetter?: boolean,
): string => {
    if (withLetter && balance > 1000) {
        return nFormatter(balance, 2);
    }
    const precision = getNumDecimals(Math.abs(balance));

    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: withRounding ? precision : 7,
    }).format(balance);
};

export const getAssetString = (asset: Asset): string => {
    if (asset.isNative()) {
        return 'native';
    }
    return `${asset.code}:${asset.issuer}`;
};

export const getAssetFromString = (assetStr: string): Asset => {
    if (assetStr === 'native') {
        return StellarService.createLumen();
    }
    const [code, issuer] = assetStr.split(':');

    return StellarService.createAsset(code, issuer);
};
