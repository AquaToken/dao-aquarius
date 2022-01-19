import * as React from 'react';
import Question from './Question/Question';
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
                        Locking AQUA with this tool enables benefits for its holders.
                    </span>
                }
            />
            <Question
                question={'How does locking work?'}
                answer={
                    <span>
                        Using the tool creates a claimable AQUA balance to yourself.
                    </span>
                }
            />
        </Container>
    );
};

export default Questions;
