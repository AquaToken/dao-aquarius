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
            '
            <Question
                question={'Why lock aqua?'}
                answer={
                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore nam odio quasi quibusdam? Ad animi consectetur corporis, debitis distinctio eos, esse fugit ipsam itaque magni maiores mollitia nesciunt nostrum perspiciatis quasi reiciendis sunt tempore temporibus. Alias, amet assumenda beatae ducimus ex harum, labore modi mollitia nulla officiis porro vel veritatis!'
                }
            />
            <Question
                question={'What bonuses will I get for my aqua lock?'}
                answer={'You get bonus accruals for Airdrop 2, as well as increased AMM rewards'}
            />
            <Question
                question={'How much aqua can i lock?'}
                answer={
                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Commodi consequatur deserunt error fugiat ipsum mollitia numquam provident qui, quis voluptatem.'
                }
            />
            <Question
                question={'Is locking aqua profitable?'}
                answer={
                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto beatae debitis dolorem eligendi explicabo id incidunt laudantium nobis quaerat voluptates. Accusantium consectetur doloremque et expedita maiores molestias necessitatibus officia veniam?'
                }
            />
        </Container>
    );
};

export default Questions;
