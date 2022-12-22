import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../../common/styles';
import ArrowRight from '../../../../../common/assets/img/icon-arrow-right.svg';
import { flexAllCenter } from '../../../../../common/mixins';

const FloatingButtonBody = styled.button`
    position: sticky;
    width: 22.4rem;
    bottom: 3.2rem;
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10rem;
    padding: 1.4rem 1.6rem;
    border: none;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.paragraphText};
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    cursor: pointer;
    animation: showButton linear 0.5s;
    z-index: 3;

    @keyframes showButton {
        0% {
            transform: translateX(100%);
            opacity: 0;
        }

        30% {
            transform: translateX(-3rem);
            opacity: 1;
        }

        50% {
            transform: translateX(1rem);
            opacity: 1;
        }

        70% {
            transform: translateX(-1.5rem);
            opacity: 1;
        }

        100% {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

const VotesCounter = styled.div`
    ${flexAllCenter};
    margin-right: 0.8rem;
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 50%;
    background-color: ${COLORS.purple};
    font-weight: bold;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.white};
`;

const InfoBlock = styled.div`
    display: flex;
    margin-right: auto;
    flex-direction: column;
    font-size: 1.6rem;
    line-height: 1.8rem;
    text-align: left;
`;

const Description = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

const FloatingButton = ({ children, ...props }: ButtonProps): JSX.Element => {
    return (
        <FloatingButtonBody {...props}>
            <VotesCounter>{children}</VotesCounter>
            <InfoBlock>
                Chosen Pairs
                <Description>Complete voting</Description>
            </InfoBlock>
            <ArrowRight />
        </FloatingButtonBody>
    );
};

export default FloatingButton;
