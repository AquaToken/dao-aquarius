const SECOND = 1000;
const MINUTE = 60 * 1000;
export const DAY = MINUTE * 60 * 24;

export const TIMEFRAMES = {
    MINUTE,
    HOUR: MINUTE * 60,
    DAY,
    WEEK: DAY * 7,
    MONTH: DAY * 30,
} as const;

export const INTERVAL_TIMES = {
    moonpayProxyTrx: SECOND * 5,
};

export const INTERVAL_IDS = {
    moonpayProxyTrx: 'intervalId.moonpayProxyTrx',
};
