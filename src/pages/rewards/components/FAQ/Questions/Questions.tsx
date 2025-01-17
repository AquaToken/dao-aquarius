import * as React from 'react';
import styled from 'styled-components';

import Question from 'basics/Question';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const Questions = () => (
    <Container>
        <Question
            question="How can I get involved with AQUA rewards?"
            answer={
                <span>
                    Provide liquidity to Aquarius AMM pools in the reward zone to earn a share of
                    AQUA emissions. You can also earn AQUA by market making on SDEX.
                </span>
            }
        />
        <Question
            question="How do I participate in earning SDEX daily rewards?"
            answer={
                <span>
                    Earn SDEX rewards by market making on Stellar’s Decentralized Exchange (SDEX).
                    This involves creating buy and sell offers that remain on order books for others
                    to take. Use platforms like LOBSTR, StellarX, StellarTerm, or market-making
                    tools like Kelp bot. Ensure you have an AQUA trustline in your Stellar wallet to
                    receive rewards.
                </span>
            }
        />
        <Question
            question="How do I participate in earning AMM daily rewards?"
            answer={
                <span>
                    Earn AMM rewards by providing liquidity to Aquarius AMM pools. Rewards are
                    distributed based on your contribution. Go to pool details and click “Deposit”
                    to start earning.
                </span>
            }
        />
        <Question
            question="How do I claim AQUA liquidity rewards?"
            answer={
                <span>
                    SDEX rewards are automatically sent to your wallet if you’ve added the AQUA
                    asset. AMM rewards can be claimed anytime on the “My Aquarius” page.
                </span>
            }
        />
    </Container>
);

export default Questions;
