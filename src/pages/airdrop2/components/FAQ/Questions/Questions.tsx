import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { GovernanceRoutes } from 'constants/routes';

import Question from 'basics/Question';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const Questions = () => (
    <Container>
        <Question
            question="Who was eligible for Airdrop #2?"
            answer={
                <span>
                    Anyone who held at least 500 XLM/yXLM & 1 AQUA inside a Stellar wallet at the
                    time of the snapshot. Use this page to check if your Stellar wallet was eligible
                    and the expected AQUA reward the wallet will get.
                </span>
            }
        />
        <Question
            question="When was the snapshot?"
            answer={
                <span>
                    The snapshot was taken on January 15, 2022 at 00:00:00 UTC (at the Stellar
                    ledger 39185028). We took into account the amount of XLM, yXLM and AQUA held by
                    wallets to determine their airdrop reward. Those who locked AQUA inside the
                    locker tool received a boost to their airdrop reward.
                    <br />
                    <br />
                    On December 6, the AQUA community voted to pass proposal 19, moving the snapshot
                    date to January 15, 2022. You can learn more on our Gov page{' '}
                    <Link to={GovernanceRoutes.main}>https://aqua.network/governance</Link>
                </span>
            }
        />
        <Question
            question="What if I held my XLM on an exchange?"
            answer={
                <span>
                    Please refer to{' '}
                    <a
                        href="https://medium.com/aquarius-aqua/airdrop-2-participating-exchanges-daec43175387"
                        target="_blank"
                        rel="noreferrer"
                    >
                        this Medium article
                    </a>{' '}
                    to see all exchanges that are taking part in AQUA airdrop.
                    <br />
                    <br />
                    If you held XLM on an eligible exchange, you typically didn't need to do
                    anything. Participating exchanges will distribute AQUA to users in proportion to
                    their XLM holdings at the time of the snapshot. Users of participating exchanges
                    didn't need to hold AQUA to participate and could typically hold less than 500
                    XLM to be eligible.
                </span>
            }
        />
        <Question
            question="What's my total three year reward?"
            answer={
                <span>
                    Please use the airdrop checker tool to find out the expected amount of AQUA your
                    wallet will receive during the 3 year distribution. Your final reward took into
                    consideration how many other people participated, the amount of XLM/yXLM and
                    AQUA that you held at the time of the snapshot, and whether or not you locked
                    AQUA for the snapshot.
                </span>
            }
        />
    </Container>
);

export default Questions;
