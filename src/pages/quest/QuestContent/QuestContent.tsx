import * as React from 'react';
import styled from 'styled-components';

import { QuestTaskStatus, TaskStatus } from 'types/quest';

import { respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

import Details from 'pages/quest/Details/Details';
import PreRequisites from 'pages/quest/PreRequisites/PreRequisites';
import QuestCompleted from 'pages/quest/QuestCompleted/QuestCompleted';
import QuestTasks from 'pages/quest/QuestTasks/QuestTasks';
import StartQuest from 'pages/quest/StartQuest/StartQuest';

const Container = styled.section`
    display: flex;
    gap: 6rem;
    margin-top: 6.6rem;
    padding-bottom: 5rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column-reverse;
    `}
`;

const LeftColumn = styled.div`
    width: 65%;
    display: flex;
    flex-direction: column;
    gap: 4.6rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const RightColumn = styled.div`
    width: 30%;
    display: flex;
    flex-direction: column;
    gap: 2.4rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const MaxRewards = styled.span`
    margin-top: 2.4rem;
    font-size: 1.6rem;
    line-height: 2.4rem;
    text-align: center;
`;

interface Props {
    statuses: QuestTaskStatus[] | null;
}

const QuestContent = ({ statuses }: Props) => {
    const allDone = !!statuses?.every(({ status }) => status === TaskStatus.completed);

    return (
        <Container>
            <LeftColumn>
                {allDone && <QuestCompleted />}
                <QuestTasks statuses={statuses} />
                <Details />
            </LeftColumn>
            <RightColumn>
                {!allDone && <StartQuest isStarted={Boolean(statuses)} />}
                <PreRequisites />
                <MaxRewards>*Max possible rewards per wallet are 20 USDC</MaxRewards>
            </RightColumn>
        </Container>
    );
};

export default QuestContent;
