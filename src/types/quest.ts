export type ListResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export enum TaskName {
    swap = 'swap_aqua',
    lock = 'lock_aqua',
    vote = 'vote',
    deposit = 'deposit_liquidity',
}

export enum TaskStatus {
    progress = 'in_progress',
    completed = 'completed',
}

export type QuestTaskStatus = {
    task_code: TaskName;
    status: TaskStatus;
    created_at: string;
    updated_at: string;
};

export type ChallengeResponse = {
    transaction: string;
};
