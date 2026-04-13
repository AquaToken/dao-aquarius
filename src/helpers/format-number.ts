import BigNumber from 'bignumber.js';

export const roundToPrecision = (value: string | number, numDecimals: number): string => {
    const multiplier = 10 ** numDecimals;

    return (Math.floor(Number(value) * multiplier) / multiplier).toString();
};

const getNumDecimals = (value: BigNumber): number => {
    if (value.gte(2000)) {
        return 0;
    } else if (value.gte(10)) {
        return 2;
    } else if (value.gte(1)) {
        return 3;
    } else if (value.gte(0.1)) {
        return 4;
    } else if (value.gte(0.01)) {
        return 5;
    } else if (value.gte(0.001)) {
        return 6;
    }
    if (value.gte(0.0000001)) {
        return 7;
    }
    return 0;
};

const trimTrailingZeros = (value: string) =>
    value.includes('.') ? value.replace(/(\.\d*?[1-9])0+$|\.0+$/u, '$1') : value;

const addThousandsSeparators = (value: string) => {
    const sign = value.startsWith('-') ? '-' : '';
    const unsignedValue = sign ? value.slice(1) : value;
    const [integerPart, fractionPart] = unsignedValue.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/gu, ',');

    return `${sign}${formattedInteger}${fractionPart ? `.${fractionPart}` : ''}`;
};

function nFormatter(num: BigNumber, digits: number) {
    const lookup = [
        { value: new BigNumber(1), symbol: '' },
        { value: new BigNumber(1e3), symbol: 'K' },
        { value: new BigNumber(1e6), symbol: 'M' },
        { value: new BigNumber(1e9), symbol: 'B' },
        { value: new BigNumber(1e12), symbol: 'T' },
        { value: new BigNumber(1e15), symbol: 'Q' },
    ];
    const absoluteValue = num.abs();
    const item = lookup
        .slice()
        .reverse()
        .find(i => absoluteValue.gte(i.value));

    if (!item) {
        return '0';
    }

    return `${trimTrailingZeros(num.dividedBy(item.value).toFixed(digits))}${item.symbol}`;
}

export const formatBalance = (
    balance: string | number,
    withRounding?: boolean,
    withLetter?: boolean,
    decimal = 7,
): string => {
    const normalizedBalance =
        typeof balance === 'string' ? balance.replaceAll(',', '').trim() : balance;
    const value = new BigNumber(normalizedBalance || 0);

    if (!value.isFinite()) {
        return '0';
    }

    const absoluteValue = value.abs();

    if (withLetter && absoluteValue.gt(1000)) {
        return nFormatter(value, 2);
    }

    const precision = withRounding ? getNumDecimals(absoluteValue) : decimal;

    return addThousandsSeparators(trimTrailingZeros(value.toFixed(precision)));
};
