export const MINIMUM_BRIBES_AQUA_EQUIVALENT = 100000; //100k AQUA

export enum CreateBribeStep {
    'pair',
    'bribeAmount',
    'period',
}

export enum BribeTab {
    current = 'current',
    upcoming = 'upcoming',
}

export const SELECT_OPTIONS = [
    { value: BribeTab.current, label: 'Current' },
    { value: BribeTab.upcoming, label: 'Upcoming' },
];

export const BRIBES_PAGE_SIZE = 20;
