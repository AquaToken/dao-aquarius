import * as React from 'react';
import styled, { css } from 'styled-components';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import Contacts from 'components/Contacts';
import Question from 'components/Question';

import { slideUpSoftAnimation } from 'styles/animations';
import { commonMaxWidth, noSelect, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export type QuestionType = {
    question: string;
    answer: string | React.ReactNode;
};

const Container = styled.div<{ $visible: boolean }>`
    ${commonMaxWidth};
    display: flex;
    width: 100%;
    padding: 5rem 4rem 0;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;

    ${({ $visible }) =>
        $visible &&
        css`
            opacity: 1;
            transform: translateY(0);
        `}

    ${respondDown(Breakpoints.md)`
    flex-direction: column;
    padding: 5rem 1.6rem;
    background: ${COLORS.gray50};
  `}

  & > * {
        ${noSelect};
    }
`;

const QuestionsBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const QuestionItem = styled.div<{ $visible: boolean; $delay: number }>`
    opacity: 0;

    ${({ $visible, $delay }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: ${$delay}s;
        `}
`;

interface Props {
    questions: QuestionType[];
}

const FAQ: React.FC<Props> = ({ questions }) => {
    const { ref, visible } = useScrollAnimation(0.2, true);

    return (
        <Container ref={ref as React.RefObject<HTMLDivElement>} $visible={visible}>
            <Contacts />
            <QuestionsBlock>
                {questions.map((question, index) => (
                    <QuestionItem key={question.question} $visible={visible} $delay={index * 0.1}>
                        <Question question={question.question} answer={question.answer} />
                    </QuestionItem>
                ))}
            </QuestionsBlock>
        </Container>
    );
};

export default FAQ;
