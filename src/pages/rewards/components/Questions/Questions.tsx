import { Link } from 'react-router-dom';

import { MainRoutes } from 'constants/routes';

import { QuestionType } from 'basics/FAQ';

export const rewardsQuestions: QuestionType[] = [
    {
        question: 'How do I earn AMM rewards?',
        answer: (
            <span>
                Provide liquidity to an <Link to={MainRoutes.amm}>Aquarius AMM pool</Link> that’s in
                the reward zone. Rewards are distributed in real time based on your share of the
                pool. You can deposit funds directly from the Pool details page.
            </span>
        ),
    },
    {
        question: 'How are AMM rewards distributed among LPs?',
        answer: (
            <span>
                Rewards are split proportionally based on your share of the pool’s total liquidity.
                The more you contribute, the more AQUA you earn. If you hold ICE, your rewards may
                be boosted through the ICE Boost mechanism.
            </span>
        ),
    },
    {
        question: 'How do I earn SDEX rewards?',
        answer: (
            <span>
                Place and maintain buy/sell offers on Stellar’s decentralized exchange (SDEX) using
                platforms like{' '}
                <a href="https://lobstr.co" target="_blank" rel="noreferrer">
                    LOBSTR
                </a>
                ,{' '}
                <a href="https://stellarx.com" target="_blank" rel="noreferrer">
                    StellarX
                </a>
                ,{' '}
                <a href="https://stellarterm.com" target="_blank" rel="noreferrer">
                    StellarTerm
                </a>{' '}
                or market-making bot Kelp. As long as your orders are active and you have an AQUA
                trustline, you’ll receive rewards automatically.
            </span>
        ),
    },
    {
        question: 'How are SDEX rewards distributed among market makers?',
        answer: (
            <span>
                SDEX rewards are based on your activity across reward zone markets. Factors like
                offer size, consistency and especially spread tightness affect your share. If you
                hold ICE, your rewards will be boosted based on your ICE balance.
            </span>
        ),
    },
    {
        question: 'What is the ICE Boost?',
        answer: (
            <span>
                ICE Boost increases AQUA rewards for both AMM liquidity providers and SDEX market
                makers who hold ICE. The more ICE you hold, the higher your reward multiplier — up
                to a capped limit of 250%. Boosts are calculated automatically.
            </span>
        ),
    },
    {
        question: 'Do I need to vote to earn rewards?',
        answer: (
            <span>
                No — voting is not required. You can earn rewards simply by providing liquidity or
                placing market-making orders. However, voting with ICE helps direct more AQUA
                rewards to the markets you support.
            </span>
        ),
    },
    {
        question: 'How are rewards allocated to markets?',
        answer: (
            <span>
                ICE holders vote on which markets should receive AQUA emissions. The more votes a
                market gets, the larger its share of daily rewards. Voting is continuous, with
                results updating daily based on the latest votes. You can vote anytime at{' '}
                <Link to={MainRoutes.vote}>aqua.network/vote</Link>.
            </span>
        ),
    },
    {
        question: 'How often are rewards updated?',
        answer: (
            <span>
                Reward allocations are updated daily at a random time, based on the latest ICE
                voting results.
            </span>
        ),
    },
    {
        question: 'Where can I see which markets are eligible for rewards?',
        answer: (
            <span>
                Markets in the Reward Zone are eligible for daily AQUA emissions. You can see all
                current reward zone pairs on this page, along with APYs, reward size, and liquidity
                data.
            </span>
        ),
    },
    {
        question: 'How do I claim AQUA liquidity rewards?',
        answer: (
            <span>
                If you’re earning AMM rewards, you must manually claim them from the “My Aquarius”
                page.
                <br />
                <br />
                SDEX rewards are sent to your wallet automatically each day — no claiming required.
            </span>
        ),
    },
];
