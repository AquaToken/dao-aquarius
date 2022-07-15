export type ListResponse<T> = {
    next: string | null;
    previous: string | null;
    results: T[];
};

type DistributionStatus = 'distrib' | 'closed';

export type Distribution = {
    balance_id: string;
    destination: string;
    status: DistributionStatus;
    locked_amount: string;
    locked_at: string;
    locked_until: string;
    distributed_amount: string;
    distributed_at: string;
    updated_at: string;
    paging_token: string;
};
