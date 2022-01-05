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
                        Locking AQUA with this tool enables eligible wallet holders to boost their
                        total AQUA reward for airdrop #2. You can receive up to a 4 times boost to
                        your reward based on your eligible XLM, yXLM & AQUA balances. Later on there'll be even more benefits for users who locked their AQUA.
                    </span>
                }
            />
            <Question
                question={'How does locking work?'}
                answer={
                    <span>
                        Using the tool creates a claimable balance to yourself and the Airdrop #2
                        lock wallet. The more AQUA you lock in the tool, and the longer you lock
                        for, the higher your boosted airdrop reward will be.
                    </span>
                }
            />
            <Question
                question={'How is the boost calculated?'}
                answer={
                    <span>
                        Using the formula from governance proposal 19, <b>AirdropShares</b> = XLM +
                        yXLM + (Average Price in XLM of AQUA over 7 Days)* (AQUA + AQUALocked).
                        <br />
                        <br />
                        You can find more in depth details of proposal 19 on the{' '}
                        <a
                            href="https://gov.aqua.network/proposal/19/"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            governance website
                        </a>
                        .
                    </span>
                }
            />
            <Question
                question={'Are there any limits for locking AQUA?'}
                answer={
                    <span>
                        You need to ensure you still have 1 AQUA in your wallet after locking. This
                        criteria is needed for your wallet to be eligible for the airdrop.
                        <br />
                        <br />
                        Each wallet has a max limit of 10M AQUA for the airdrop. Ensure to use the
                        sliders to see if you reach the 10M cap, as locking more AQUA than is needed
                        will gain no extra benefits past the cap.
                        <br />
                        <br />
                        There is no minimum lock time. You can lock from January 15, 2022, through
                        to January 14, 2025. The choice is yours, but the longer you lock for, the
                        higher the boost will be.
                    </span>
                }
            />
            <Question
                question={'What is Airdrop #2?'}
                answer={
                    <span>
                        Airdrop 2 is the last airdrop for Aquarius. It will distribute 15 billion
                        AQUA tokens to all eligible wallet holders. You can find out more in our
                        medium article{' '}
                        <a
                            href="https://medium.com/aquarius-aqua/announcing-aqua-airdrop-2-b338e21c2bf6"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            Announcing AQUA Airdrop #2
                        </a>
                        .
                    </span>
                }
            />
        </Container>
    );
};

export default Questions;
