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

function nFormatter(num: number, digits: number) {
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
        .find(i => num >= i.value);
    return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}

export const formatBalance = (
    balance: number,
    withRounding?: boolean,
    withLetter?: boolean,
    decimal = 7,
): string => {
    if (withLetter && balance > 1000) {
        return nFormatter(balance, 2);
    }
    const precision = getNumDecimals(Math.abs(balance));

    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: withRounding ? precision : decimal,
    }).format(balance);
};
