import * as React from 'react';
import Question from '../../../../common/basics/Question';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const Questions = () => {
    return (
        <Container>
            <Question
                question={'Why lock AQUA?'}
                answer={
                    <span>
                        Although originally used for boosts in Airdrop #2, moving forward the locker
                        tool will play a crucial role in Aquarius. Those who lock AQUA through this
                        tool will be eligible for additional benefits while using AQUA products.
                        <br />
                        <br />
                        Increased AQUA payouts for SDEX & AMM rewards and boosted voting power when
                        voting for liquidity rewards are two of these benefits. More information
                        will be released soon.
                    </span>
                }
            />
            <Question
                question={'How does locking work?'}
                answer={
                    <span>
                        Locking AQUA all takes place at the protocol level on Stellar. When you use
                        the tool above, a claimable balance is created and sent back to yourself.
                        Only you can reclaim the locked AQUA balance after the time you select
                        passes.
                    </span>
                }
            />
            <Question
                question={'Is locking AQUA safe?'}
                answer={
                    <span>
                        Locking AQUA is completely safe when using this tool. AQUA is securely
                        locked into the Stellar blockchain, with only the sending wallet able to
                        reclaim the tokens at a later time.
                    </span>
                }
            />
        </Container>
    );
};

export default Questions;
