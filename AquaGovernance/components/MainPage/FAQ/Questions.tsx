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
                question={'How to create proposal?'}
                answer={<span>How to create proposal?</span>}
            />
            <Question
                question={'What is a discussion?'}
                answer={<span>What is a discussion?</span>}
            />
            <Question
                question={'How long will the discussion go on?'}
                answer={<span>How long will the discussion go on?</span>}
            />
            <Question
                question={'How much does it cost to create an proposal?'}
                answer={<span>How much does it cost to create an proposal?</span>}
            />
        </Container>
    );
};

export default Questions;
