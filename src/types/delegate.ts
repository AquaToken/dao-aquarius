export type Delegatee = {
    name: string;
    description: string;
    voting_strategy: string;
    created_at: string;
    updated_at: string;
    account: string;
    image: string;
    discord_handle: string;
    delegated: { [key: string]: number } | null;
    managed_ice: { [key: string]: number } | null;
    is_recommended: boolean;
    twitter_image: string | null;
    twitter_link: string;
    affiliate_project: string;
    overall_delegated_stat: { unique_delegators: number };
};

export type MyDelegatees = {
    managed_ice: string;
    delegated: string;
    account: string;
    asset: string;
};

export type DelegateeVote = {
    market_key: string;
    total_votes: string;
};
