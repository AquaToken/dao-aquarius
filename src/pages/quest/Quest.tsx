import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getQuestStatus } from 'api/quest';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import MainBlock from 'pages/quest/MainBlock/MainBlock';
import ParticipateRules from 'pages/quest/ParticipateRules/ParticipateRules';
import QuestContent from 'pages/quest/QuestContent/QuestContent';

const Main = styled.main`
    flex: 1 0 auto;
`;

const Wrapper = styled.div`
    ${commonMaxWidth};
    margin: 0 auto;
    padding: 0 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 4rem;
    `}

    ${respondDown(Breakpoints.xs)`
        padding: 0 1.6rem;
    `}
`;

const Quest = () => {
    const [statuses, setStatuses] = useState(null);
    const { account } = useAuthStore();

    const updateIndex = useUpdateIndex(5000);

    useEffect(() => {
        if (!account) return;
        getQuestStatus(account.accountId()).then(setStatuses);
    }, [account, updateIndex]);

    return (
        <Main>
            <Wrapper>
                <MainBlock />

                {!statuses && <ParticipateRules />}

                <QuestContent statuses={statuses} />
            </Wrapper>
        </Main>
    );
};

export default Quest;
