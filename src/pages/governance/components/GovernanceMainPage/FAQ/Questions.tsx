import * as React from 'react';
import styled from 'styled-components';

import Question from '../../../../../common/basics/Question';
import { formatBalance } from '../../../../../common/helpers/helpers';
import {
    APPROVED_PROPOSAL_REWARD,
    CREATE_DISCUSSION_COST,
    CREATE_PROPOSAL_COST,
} from '../../../pages/GovernanceMainPage';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const Questions = () => {
    return (
        <Container>
            <Question
                question={'What is Aquarius Governance?'}
                answer={
                    <span>
                        Governance allows for creating and discussing potential changes to the
                        Aquarius protocol. AQUA holders can create proposals and start community
                        discussions before deciding whether to publish proposals for a vote.
                    </span>
                }
            />
            <Question
                question={'How to create a proposal?'}
                answer={
                    <span>
                        To start the process, click the <b>Create Discussion</b> button. Provide all
                        necessary information, including the title, Discord information, and
                        proposal content. Ensure you give as much detail as possible, especially the
                        implementation plan.
                    </span>
                }
            />
            <Question
                question={'What is a discussion?'}
                answer={
                    <span>
                        Before a proposal can be published, discussions must take place. The
                        mandatory 7 day discussion phase allows for gathering feedback and more
                        in-depth talks between proposal creators and the wider AQUA community.
                    </span>
                }
            />
            <Question
                question={'Can I edit a proposal?'}
                answer={
                    <span>
                        Creators can edit proposals up to 30 days after creation. Editing can be
                        necessary if the initial proposal isn’t clear or any changes are put forward
                        in the discussion phase. Stronger proposals are more likely to pass.
                    </span>
                }
            />
            <Question
                question={'How to publish a proposal?'}
                answer={
                    <span>
                        After 7 days of discussions, creators can publish their proposals for a
                        vote. Creators will only see the <b>Publish</b> option once the minimum
                        discussion phase has passed.
                    </span>
                }
            />
            <Question
                question={'Is proposal creation incentivized?'}
                answer={
                    <span>
                        Any proposals that are accepted will see their creators rewarded with{' '}
                        {formatBalance(APPROVED_PROPOSAL_REWARD)} AQUA.
                    </span>
                }
            />
            <Question
                question={'What fees are there for proposal creation & publication?'}
                answer={
                    <span>
                        A fee of{' '}
                        <b>{formatBalance(CREATE_DISCUSSION_COST)} AQUA is needed to create</b> a
                        proposal discussion. To move a discussion to the publishing phase requires a
                        further {formatBalance(CREATE_PROPOSAL_COST)} AQUA. Any edits cost a fee of{' '}
                        {formatBalance(CREATE_DISCUSSION_COST)} AQUA, so ensure proposals are
                        thoroughly thought out & complete before submitting.
                    </span>
                }
            />
            <Question
                question={'How long is AQUA locked when used for voting?'}
                answer={
                    <span>
                        The unlock time for AQUA governance votes depends on how quickly a vote
                        occurs after a proposal is published. The unlock logic takes the time
                        difference between a proposal’s start time and when a vote occurs and
                        multiplies it by two. This multiplied time is added to the end of a
                        proposal’s vote period, giving a final unlock time.
                        <br />
                        <br />
                        For example, a user who votes 3.5 days into a voting period will have those
                        days multiplied by 2, giving 7 days. Therefore the AQUA used to vote will
                        unlock 7 days after the proposal vote ends.
                    </span>
                }
            />
        </Container>
    );
};

export default Questions;
