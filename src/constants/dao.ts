import { ENV_PRODUCTION, ENV_TESTNET } from 'constants/env';
import { DAY } from 'constants/intervals';

import { getEnv } from 'helpers/env';

import { VoteChoiceSimple } from 'types/governance';

const CREATE_DISCUSSION_COST_BY_ENV = {
    [ENV_PRODUCTION]: 100000,
    [ENV_TESTNET]: 1,
};

const CREATE_PROPOSAL_COST_BY_ENV = {
    [ENV_PRODUCTION]: 900000,
    [ENV_TESTNET]: 9,
};

const TIME_TO_DISCUSSION_BY_ENV = {
    [ENV_PRODUCTION]: 7 * DAY,
    [ENV_TESTNET]: 1,
};

const TIME_TO_EXPIRE_BY_ENV = {
    [ENV_PRODUCTION]: 30 * DAY,
    [ENV_TESTNET]: 30 * DAY,
};

export const CREATE_DISCUSSION_COST = CREATE_DISCUSSION_COST_BY_ENV[getEnv()];
export const CREATE_PROPOSAL_COST = CREATE_PROPOSAL_COST_BY_ENV[getEnv()];
export const APPROVED_PROPOSAL_REWARD = 1500000;
export const TIME_TO_DISCUSSION = TIME_TO_DISCUSSION_BY_ENV[getEnv()];
export const TIME_TO_EXPIRE = TIME_TO_EXPIRE_BY_ENV[getEnv()];

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
