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
            <Question question={'What is a bribe?'} answer={<span>What is a bribe?</span>} />
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
                question={'Why are bribes necessary?'}
                answer={<span>Why are bribes necessary?</span>}
            />
            <Question
                question={'How can I get a bribe?'}
                answer={<span>How can I get a bribe?</span>}
            />
            <Question
                question={'What is the maximum amount of bribe you can give?'}
                answer={<span>What is the maximum amount of bribe you can give?</span>}
            />
        </Container>
    );
};

export default Questions;
