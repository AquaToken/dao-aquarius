import * as React from 'react';
import styled from 'styled-components';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Contacts from 'basics/Contacts';
import Question from 'basics/Question';

export type QuestionType = {
    question: string;
    answer: string | React.ReactNode;
};

const Container = styled.div`
    ${commonMaxWidth};
    display: flex;
    width: 100%;
    padding: 5rem 4rem 0;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        padding: 5rem 1.6rem;
        background: ${COLORS.lightGray};
    `}
`;

const QuestionsBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

interface Props {
    questions: QuestionType[];
}

const FAQ = ({ questions }: Props): React.ReactElement => (
    <Container>
        <Contacts />
        <QuestionsBlock>
            {questions.map(question => (
                <Question
                    key={question.question}
                    question={question.question}
                    answer={question.answer}
                />
            ))}
        </QuestionsBlock>
    </Container>
);

export default FAQ;
