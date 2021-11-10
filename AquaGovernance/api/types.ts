export type ProposalSimple = {
    id: number;
    proposed_by: string;
    title: string;
    text: string;
    start_at: string;
    end_at: string;
    vote_for_result: string;
    vote_against_result: string;
    is_simple_proposal: boolean;
};

export type Proposal = {
    id: number;
    is_simple_proposal: boolean;
    end_at: string;
    proposed_by: string;
    start_at: string;
    text: string;
    title: string;
    vote_against_issuer: string;
    vote_against_result: string;
    vote_for_issuer: string;
    vote_for_result: string;
};

export type VoteChoiceSimple = 'vote_for' | 'vote_against';

export type Vote = {
    account_issuer: string;
    amount: string;
    vote_choice: VoteChoiceSimple;
    transaction_link: string;
    created_at: string;
};

export type ProposalCreateOptions = {
    proposed_by: string;
    title: string;
    text: string;
    start_at: string;
    end_at: string;
    transaction_hash: string;
};
