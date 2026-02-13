import { PROPOSAL_STATUS } from 'constants/dao';

import { Proposal, ProposalSimple } from 'types/governance';

export const getQuorumPercentage = (proposal: ProposalSimple | Proposal) => {
    const {
        vote_for_result: voteFor,
        vote_against_result: voteAgainst,
        vote_abstain_result: voteAbstain,
        aqua_circulating_supply: aquaCirculatingSupply,
        ice_circulating_supply: iceCirculatingSupply,
    } = proposal;

    const voteForValue = Number(voteFor);
    const voteAgainstValue = Number(voteAgainst);
    const voteAbstainValue = Number(voteAbstain);

    return (
        ((voteForValue + voteAgainstValue + voteAbstainValue) /
            (Number(aquaCirculatingSupply) + Number(iceCirculatingSupply))) *
        100
    );
};

export const isQuorumReached = (proposal: ProposalSimple | Proposal) => {
    const percentForQuorum = Number(proposal.percent_for_quorum);

    return getQuorumPercentage(proposal) >= percentForQuorum;
};

export const getProposalStatus = (proposal: ProposalSimple | Proposal): PROPOSAL_STATUS => {
    if (proposal.proposal_status === 'DISCUSSION') return PROPOSAL_STATUS.DISCUSSION;
    if (proposal.proposal_status === 'VOTING') return PROPOSAL_STATUS.ACTIVE;
    if (proposal.proposal_status === 'EXPIRED') return PROPOSAL_STATUS.EXPIRED;

    if (!isQuorumReached(proposal)) {
        return PROPOSAL_STATUS.NO_QUORUM;
    }

    return Number(proposal.vote_for_result) > Number(proposal.vote_against_result)
        ? PROPOSAL_STATUS.ACCEPTED
        : PROPOSAL_STATUS.REJECTED;
};

export const getVotingTokens = (proposal: ProposalSimple | Proposal) => {
    if (!Number(proposal.aqua_circulating_supply)) return 'ICE';
    if (!Number(proposal.ice_circulating_supply)) return 'AQUA';

    return 'AQUA + ICE';
};
