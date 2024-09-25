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
                    An AQUA trustline needs to be added to the user's Stellar wallet. Trustlines
                    allow a user to receive & hold specific Stellar assets within their wallets.
                    Once a user has a Stellar wallet and an AQUA trustline enabled they can start
                    earning rewards through SDEX market making or AMM liquidity providing.
                </span>
            }
        />
        <Question
            question="How do I participate in earning SDEX daily rewards?"
            answer={
                <span>
                    SDEX rewards are earned through market making on the above markets on Stellar
                    Decentralized Exchange (SDEX). Market making happens through the creation of buy
                    & sell offers, with orders sitting on the order books ready for other users to
                    take at a later time. For SDEX market making you can use platforms like LOBSTR,
                    StellarX, StellarTerm or market-making bots like Kelp bot.
                </span>
            }
        />
        <Question
            question="How do I participate in earning AMM daily reward?"
            answer={
                <span>
                    AMM rewards are earned through liquidity providing on the above markets through
                    Stellar AMMs. These rewards are distributed based on a user's contribution to
                    AMM pools. You can get access to AMMs on Stellar using products like StellarX,
                    Stellarport, or Lumenswap.
                </span>
            }
        />
    </Container>
);

export default Questions;
