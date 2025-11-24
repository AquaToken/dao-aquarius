import { Link } from 'react-router-dom';

import { MainRoutes } from 'constants/routes';

import { QuestionType } from 'components/FAQ';

export const lpIncentivesQuestions: QuestionType[] = [
    {
        question: 'What’s a Pool Incentive?',
        answer: (
            <span>
                Pool Incentives are additional rewards for liquidity providers, offered on top of
                the AQUA rewards distributed by the Aquarius protocol. They can be created by
                anyone, nominated in any token traded on Aquarius, and assigned to specific
                liquidity pools.
            </span>
        ),
    },
    {
        question: 'What’s the difference between AQUA rewards and Pool Incentives?',
        answer: (
            <span>
                <ul>
                    <li>
                        AQUA rewards are distributed directly by the Aquarius protocol, always
                        nominated in AQUA, and can be boosted based on a user’s ICE balance.
                    </li>
                    <li>
                        Pool Incentives can be created by anyone, paid in any token traded on
                        Aquarius, and are not affected by ICE boosts.
                    </li>
                </ul>
            </span>
        ),
    },
    {
        question: 'How do I receive Pool Incentives?',
        answer: (
            <span>
                To earn Pool Incentives, you need to provide liquidity to a pool that has active
                incentives. Rewards accrue automatically but must be claimed in the{' '}
                <Link to={`${MainRoutes.account}?tab=amm_liquidity&filter=all`}>
                    Dashboard → Liquidity Positions
                </Link>{' '}
                section.
            </span>
        ),
    },
    {
        question: 'Where can I see my Pool Incentives?',
        answer: (
            <span>
                You can view and claim your earned Pool Incentives under{' '}
                <Link to={`${MainRoutes.account}?tab=amm_liquidity&filter=all`}>
                    Dashboard → Liquidity Positions
                </Link>
                .
            </span>
        ),
    },
    {
        question: 'How are Pool Incentives calculated?',
        answer: (
            <span>
                Incentives are distributed proportionally among liquidity providers in a pool, based
                on each provider’s share of total deposited liquidity. The more liquidity you
                contribute, the larger your share of the incentives.
            </span>
        ),
    },
    {
        question: 'How do I submit a Pool Incentive?',
        answer: (
            <span>
                <ol>
                    <li>Click the Add Incentive button at the top of the page.</li>
                    <li>Select the pool you’d like to incentivize.</li>
                    <li>Choose the reward token.</li>
                    <li>Enter the daily reward amount and incentive period.</li>
                </ol>
                <i>
                    Note: The minimum incentive size must be equivalent to at least 100,000 AQUA per
                    day at the time of creation.
                </i>
            </span>
        ),
    },
    {
        question: 'How does it work technically?',
        answer: (
            <span>
                Pool Incentives are powered by Soroban smart contracts and distributed automatically
                by the Aquarius AMM.
            </span>
        ),
    },
];
