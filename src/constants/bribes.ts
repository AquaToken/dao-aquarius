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
    { value: BribeTab.current, label: 'Current Bribes' },
    { value: BribeTab.upcoming, label: 'Upcoming Bribes' },
];

export const BRIBES_PAGE_SIZE = 20;

export enum UpcomingBribesParams {
    type = 'type',
    week = 'week',
    minBribeAmount = 'min_bribe_amount',
    sort = 'sort',
}

export enum BribeSortFields {
    aquaAmountUp = '-aqua_total_reward_amount_equivalent',
    aquaAmountDown = 'aqua_total_reward_amount_equivalent',
    startAtUp = '-start_at',
    startAtDown = 'start_at',
}

export const BRIBES_SORT_OPTIONS = [
    { label: 'Sort by: Period ▲', value: BribeSortFields.startAtDown },
    { label: 'Sort by: Period ▼', value: BribeSortFields.startAtUp },
    { label: 'Sort by: Reward ▲', value: BribeSortFields.aquaAmountDown },
    { label: 'Sort by: Reward ▼', value: BribeSortFields.aquaAmountUp },
];

export enum BribesWeeksFilters {
    all = 'all',
}

export enum BribesTypes {
    all = 'all',
    external = 'external',
    protocol = 'protocol',
}

export const BRIBES_TYPES_OPTIONS = [
    { label: 'All', value: BribesTypes.all },
    { label: 'External', value: BribesTypes.external },
    { label: 'Protocol', value: BribesTypes.protocol },
];
