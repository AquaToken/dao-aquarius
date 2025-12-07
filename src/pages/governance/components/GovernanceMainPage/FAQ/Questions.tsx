import {
    APPROVED_PROPOSAL_REWARD,
    CREATE_DISCUSSION_COST,
    CREATE_PROPOSAL_COST,
} from 'constants/dao';

import { formatBalance } from 'helpers/format-number';

import { QuestionType } from 'components/FAQ';

export const governanceQuestions: QuestionType[] = [
    {
        question: 'What is Aquarius Governance?',
        answer: (
            <span>
                Governance allows for creating and discussing potential changes to the Aquarius
                protocol. AQUA holders can create proposals and start community discussions before
                deciding whether to publish proposals for a vote.
            </span>
        ),
    },
    {
        question: 'How to create a proposal?',
        answer: (
            <span>
                To start the process, click the <b>Create Discussion</b> button. Provide all
                necessary information, including the title, Discord information, and proposal
                content. Ensure you give as much detail as possible, especially the implementation
                plan.
            </span>
        ),
    },
    {
        question: 'What is a discussion?',
        answer: (
            <span>
                Before a proposal can be published, discussions must take place. The mandatory 7 day
                discussion phase allows for gathering feedback and more in-depth talks between
                proposal creators and the wider AQUA community.
            </span>
        ),
    },
    {
        question: 'Can I edit a proposal?',
        answer: (
            <span>
                Creators can edit proposals up to 30 days after creation. Editing can be necessary
                if the initial proposal isn’t clear or any changes are put forward in the discussion
                phase. Stronger proposals are more likely to pass.
            </span>
        ),
    },
    {
        question: 'How to publish a proposal?',
        answer: (
            <span>
                After 7 days of discussions, creators can publish their proposals for a vote.
                Creators will only see the <b>Publish</b> option once the minimum discussion phase
                has passed.
            </span>
        ),
    },
    {
        question: 'Is proposal creation incentivized?',
        answer: (
            <span>
                Any proposals that are accepted will see their creators rewarded with{' '}
                {formatBalance(APPROVED_PROPOSAL_REWARD)} AQUA.
            </span>
        ),
    },
    {
        question: 'What fees are there for proposal creation & publication?',
        answer: (
            <span>
                A fee of <b>{formatBalance(CREATE_DISCUSSION_COST)} AQUA is needed to create</b> a
                proposal discussion. To move a discussion to the publishing phase requires a further{' '}
                {formatBalance(CREATE_PROPOSAL_COST)} AQUA. Any edits cost a fee of{' '}
                {formatBalance(CREATE_DISCUSSION_COST)} AQUA, so ensure proposals are thoroughly
                thought out & complete before submitting.
            </span>
        ),
    },
];
