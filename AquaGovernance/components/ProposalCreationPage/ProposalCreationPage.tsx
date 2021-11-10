import * as React from 'react';
import styled from 'styled-components';
import { useMemo, useState } from 'react';
import ProposalCreation from './ProposalCreation/ProposalCreation';
import ProposalScreen from '../VoteProposalPage/Proposal/ProposalScreen';
import useAuthStore from '../../../common/store/authStore/useAuthStore';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

export enum statePage {
    creation = 'creation',
    check = 'check',
}

const ProposalCreationPage = (): JSX.Element => {
    const [startDate, setStartDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [screenState, setScreenState] = useState(statePage.creation);

    const { account } = useAuthStore();
    const accountId = account?.accountId();

    const hasData = !!(startDate && startTime && title && text && accountId);
    const onSubmit = () => {
        if (hasData) setScreenState(statePage.check);
    };
    const dateNow = new Date().toISOString();
    const dateEnd = useMemo(() => {
        if (startDate && startTime) {
            return new Date(startDate.setHours(startTime.getHours())).toISOString();
        }
        return null;
    }, [startDate, startTime]);

    switch (screenState) {
        case statePage.creation: {
            return (
                <MainBlock>
                    <ProposalCreation
                        title={title}
                        text={text}
                        setTitle={setTitle}
                        setText={setText}
                        startTime={startTime}
                        startDate={startDate}
                        setStartTime={setStartTime}
                        setStartDate={setStartDate}
                        hasData={hasData}
                        onSubmit={onSubmit}
                    />
                </MainBlock>
            );
        }

        case statePage.check: {
            return (
                <MainBlock>
                    <ProposalScreen
                        proposal={{
                            id: 0,
                            is_simple_proposal: true,
                            title,
                            text,
                            proposed_by: accountId,
                            start_at: dateNow,
                            end_at: dateEnd,
                            vote_against_issuer: '',
                            vote_against_result: '0',
                            vote_for_issuer: '',
                            vote_for_result: '0',
                        }}
                        isTemplate
                        setScreenState={setScreenState}
                    />
                </MainBlock>
            );
        }
    }
};

export default ProposalCreationPage;
