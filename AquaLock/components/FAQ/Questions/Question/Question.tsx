import * as React from 'react';
import styled from 'styled-components';
import { flexRowSpaceBetween } from '../../../../../common/mixins';
import Down from '../../../../../common/assets/img/icon-arrow-down.svg';
import { COLORS } from '../../../../../common/styles';
import { useState } from 'react';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: min-content;
    padding: 3.2rem 0;
    border-bottom: 0.1rem solid ${COLORS.gray};
    cursor: pointer;
`;

const QuestionText = styled.div`
    width: 100%;
    ${flexRowSpaceBetween};
    font-weight: bold;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;

const ArrowDown = styled(Down)<{ $isOpen: boolean }>`
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'unset')};
    transition: transform linear 200ms;
`;

const Answer = styled.div`
    margin-top: 1.6rem;
    font-size: 1.8rem;
    line-height: 180%;
    color: ${COLORS.darkGrayText};
    animation: openAnswer ease-in-out 200ms;
    transform-origin: top;

    @keyframes openAnswer {
        0% {
            transform: scaleY(0);
        }
        80% {
            transform: scaleY(1.1);
        }
        100% {
            transform: scaleY(1);
        }
    }
`;

const Question = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => {
        setIsOpen((prevState) => !prevState);
    };
    return (
        <Container onClick={() => toggle()}>
            <QuestionText>
                <span>{question}</span>
                <ArrowDown $isOpen={isOpen} />
            </QuestionText>
            {isOpen && <Answer>{answer}</Answer>}
        </Container>
    );
};

export default Question;
