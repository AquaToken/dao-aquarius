import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import Question from '../../../../../common/basics/Question';
import { VoteRoutes } from '../../../../../routes';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const Questions = () => {
    return (
        <Container>
            <Question
                question={'What is a bribe?'}
                answer={
                    <span>
                        A bribe is a way for anyone to incentivize those who upvote particular
                        Stellar markets on <Link to={VoteRoutes.main}>aqua.network/vote</Link>
                        <br />
                        <br />
                        Bribes can be given in any Stellar asset. Users can simultaneously assign
                        multiple assets to each market at any time. Those who vote on bribed markets
                        will receive hourly payouts while the market stays incentivized with bribes.
                    </span>
                }
            />
            <Question
                question={'How does bribing work?'}
                answer={
                    <span>
                        Bribes take place entirely at the protocol level on Aquarius. A claimable
                        balance is created using the tool above containing the marker for the bribed
                        market and the tokens used to reward voters.
                        <br />
                        <br />
                        Every Sunday, Aquarius collects bribes for the coming week and decides which
                        ones are valid. Valid bribes are accepted and then distributed to voters
                        linearly from Monday through Sunday.
                    </span>
                }
            />
            <Question
                question={'Is there a maximum to bribes?'}
                answer={
                    <span>
                        There is no maximum limit to the amount of a token that can be allocated,
                        with no limit to how many assets that can be added to one market, in any
                        given week.
                    </span>
                }
            />
            <Question
                question={'Is there a minimum amount for a bribe?'}
                answer={
                    <span>
                        All bribes must be worth a minimum of 100K AQUA per week.
                        <br />
                        <br />A validity check happens with Aquarius purchasing 100K AQUA using a
                        path payment upon collection, helping ensure tokens used for bribes have
                        value. The purchased 100K AQUA + the remainder of the chosen reward token
                        gets distributed to voters. Aquarius returns rejected bribes to the sender.
                    </span>
                }
            />
            <Question
                question={'Why are bribes necessary?'}
                answer={
                    <span>
                        Bribes help create a level playing field where all Stellar markets can
                        become incentivized, encouraging AQUA holders to place their votes towards
                        specific markets.
                    </span>
                }
            />

            <Question
                question={'How can I receive a bribe?'}
                answer={
                    <span>
                        To receive a bribe, go to{' '}
                        <Link to={VoteRoutes.main}>aqua.network/vote</Link> and search for markets
                        incentivized with bribes.
                        <br />
                        <br />
                        Once you find a market you like, upvote it with your AQUA. You will start to
                        receive bribe rewards within a day after your vote if bribes are already
                        being distributed to that market.
                    </span>
                }
            />
        </Container>
    );
};

export default Questions;
