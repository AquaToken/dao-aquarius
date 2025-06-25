export type Delegatee = {
    name: string;
    description: string;
    voting_strategy: string;
    created_at: string;
    updated_at: string;
    account: string;
    image: string;
    discord_handle: string;
    delegated: string | null;
    managed_ice: string | null;
    is_recommended: boolean;
    twitter_image: string | null;
    twitter_link: string;
};

export type MyDelegatees = {
    managed_ice: string;
    delegated: string;
    account: string;
};

export type DelegateeVote = {
    market_key: string;
    total_votes: string;
};
