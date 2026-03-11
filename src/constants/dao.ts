import { VoteChoiceSimple } from 'types/governance';

export const CREATE_DISCUSSION_COST = 100000;
export const CREATE_PROPOSAL_COST = 900000;
export const APPROVED_PROPOSAL_REWARD = 1500000;

export enum VoteOptions {
    for = 'For',
    against = 'Against',
    abstain = 'Abstain',
}

export const ChoiceOption: Record<VoteChoiceSimple, VoteOptions> = {
    vote_against: VoteOptions.against,
    vote_for: VoteOptions.for,
    vote_abstain: VoteOptions.abstain,
};

export enum PROPOSAL_STATUS {
    DISCUSSION = 'discussion',
    ACTIVE = 'active',
    DEPRECATED = 'deprecated',
    EXPIRED = 'expired',

    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    NO_QUORUM = 'no_quorum',
}

export const StatusLabels = {
    [PROPOSAL_STATUS.DISCUSSION]: 'Discussion',
    [PROPOSAL_STATUS.ACTIVE]: 'Voting',
    [PROPOSAL_STATUS.DEPRECATED]: 'Deprecated',
    [PROPOSAL_STATUS.EXPIRED]: 'Not Published',

    [PROPOSAL_STATUS.ACCEPTED]: 'Accepted',
    [PROPOSAL_STATUS.REJECTED]: 'Rejected',
    [PROPOSAL_STATUS.NO_QUORUM]: 'No Quorum',
};

export const DAO_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
