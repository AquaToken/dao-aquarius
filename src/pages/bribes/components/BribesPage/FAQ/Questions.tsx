import { QuestionType } from 'basics/FAQ';

export const BribeQuestions: QuestionType[] = [
    {
        question: 'What is a bribe?',
        answer: (
            <span>
                A bribe is a reward given to users who vote with ICE for specific Stellar markets.
                Voters earn rewards while the bribe is active.
            </span>
        ),
    },
    {
        question: 'Who can submit a bribe?',
        answer: (
            <span>
                Anyone — projects, DAOs, or individuals — can submit a bribe using any Stellar asset
                to attract votes to their market.
            </span>
        ),
    },
    {
        question: 'What’s the difference between protocol and external bribes?',
        answer: (
            <span>
                Protocol bribes are funded automatically from AMM trading fees and go to voters on
                high-volume markets. External bribes are manually submitted by anyone to boost votes
                for a specific pair.
            </span>
        ),
    },
    {
        question: 'How do I receive bribes?',
        answer: (
            <span>
                Vote with ICE for a market that has an active bribe. Rewards are distributed hourly
                and usually begin within 24 hours of voting.
            </span>
        ),
    },
    {
        question: 'Can I vote for multiple markets and receive bribes on each?',
        answer: (
            <span>
                Yes, you’ll receive rewards on any market where you’ve voted with ICE and a bribe is
                active.
            </span>
        ),
    },
    {
        question: 'Where can I see active bribes?',
        answer: (
            <span>
                All bribes for the current week are listed on this page, including reward amount,
                token, and APY. Use the toggle to view upcoming bribes scheduled for next week.
            </span>
        ),
    },
    {
        question: 'How are my rewards calculated?',
        answer: (
            <span>
                Bribe rewards are distributed proportionally based on your ICE voting weight in a
                given market. The more ICE you’ve allocated to a market, the larger your share of
                that market’s bribe.
            </span>
        ),
    },
    {
        question: 'How does it work technically?',
        answer: (
            <span>
                Bribes are submitted as claimable balances on Stellar and linked to specific
                markets. When you vote with ICE, the system tracks your allocation. Rewards are then
                distributed hourly based on voting snapshots. Protocol bribes are triggered
                automatically, external bribes are collected and activated weekly.
            </span>
        ),
    },
    {
        question: 'How do I create a bribe for the market?',
        answer: (
            <span>
                Click “Create Bribe” on this page. Choose the market, reward asset, amount, start
                date, and duration. Your bribe will be submitted as a Stellar transaction and will
                activate the following week{' '}
                <b>if it successfully converts to at least 100,000 AQUA via a path payment</b>. If
                the threshold isn’t met, the funds will be returned. Bribes must be submitted
                <b>by the end of Saturday</b> to be included in the next week’s cycle.
            </span>
        ),
    },
];
