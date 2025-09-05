const SECOND = 1000;
export const MINUTE = 60 * 1000;
export const DAY = MINUTE * 60 * 24;

export const WEEK = DAY * 7;

export const TIMEFRAMES = {
    MINUTE,
    HOUR: MINUTE * 60,
    DAY,
    WEEK,
    MONTH: DAY * 30,
} as const;

export const INTERVAL_TIMES = {
    moonpayProxyTrx: SECOND * 5,
};

export const INTERVAL_IDS = {
    moonpayProxyTrx: 'intervalId.moonpayProxyTrx',
};
