import { QuestionType } from 'basics/FAQ';

export const lpIncentivesQuestions: QuestionType[] = [
    {
        question: "What's an LP incentive?",
        answer: (
            <span>
                LP incentives are additional rewards for liquidity providers, offered on top of the
                Aquarius protocol-powered AQUA rewards. These incentives can be nominated in any
                currency supported by the Aquarius AMM and are assigned to specific liquidity pools.
            </span>
        ),
    },
    {
        question: "What's the difference between LP rewards and LP incentives?",
        answer: (
            <span>
                <ul>
                    <li>
                        LP rewards are distributed directly by the Aquarius protocol, always
                        nominated in AQUA, and can be boosted based on a user's ICE balance.
                    </li>
                    <li>
                        LP incentives, on the other hand, can be created by any Stellar user,
                        nominated in any currency traded on Aquarius, and are not affected by a
                        user's ICE balance.
                    </li>
                </ul>
            </span>
        ),
    },
    {
        question: 'How do I receive LP incentives?',
        answer: (
            <span>
                To earn LP incentives, you need to provide liquidity to a pool that has incentives
                enabled. You can confirm this by checking the "Daily reward" column in the pool
                list.
            </span>
        ),
    },
    {
        question: 'Where can I see my LP incentives?',
        answer: (
            <span>
                You can view your earned LP incentives in <b>My Aquarius &gt; My Liquidity</b>.
            </span>
        ),
    },
    {
        question: 'How are LP incentives calculated?',
        answer: (
            <span>
                Incentives are distributed proportionally among liquidity providers in a pool, based
                on each provider's share of the total deposited liquidity. The more assets you
                contribute, the larger your share of the incentives.
            </span>
        ),
    },
    {
        question: 'How do I submit an LP incentive?',
        answer: (
            <span>
                Click the "Add incentive" button at the top of this page.
                <br />
                Select the pool you'd like to incentivize.
                <br />
                Choose the currency you wish to distribute.
                <br />
                Enter the amount and the incentive period.
                <br />
                <br />
                <b>
                    Note: The minimum incentive size must be equivalent to at least 1,000 AQUA at
                    the time of creation.
                </b>
            </span>
        ),
    },
    {
        question: 'How does it work technically?',
        answer: (
            <span>
                LP incentives are powered by Soroban and distributed automatically by the Aquarius
                AMM smart contract.
            </span>
        ),
    },
];
