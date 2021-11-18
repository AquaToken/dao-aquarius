import * as React from 'react';
import styled from 'styled-components';
import { useMemo, useState } from 'react';
import ProposalCreation from './ProposalCreation/ProposalCreation';
import ProposalScreen from '../VoteProposalPage/Proposal/ProposalScreen';
import useAuthStore from '../../../common/store/authStore/useAuthStore';

export const MIN_DURATION_VOTING = 3 * 24 * 60 * 60 * 1000;
export const MAX_DURATION_VOTING = 7 * 24 * 60 * 60 * 1000;

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

export enum statePage {
    creation = 'creation',
    check = 'check',
}

const ProposalCreationPage = (): JSX.Element => {
    const minDateEnd = new Date(Date.now() + MIN_DURATION_VOTING);

    const [endDate, setEndDate] = useState(minDateEnd);
    const [endTime, setEndTime] = useState(minDateEnd);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [screenState, setScreenState] = useState(statePage.creation);

    const { account } = useAuthStore();
    const accountId = account?.accountId();

    const hasData = !!(endDate && endTime && title && text && accountId);
    const onSubmit = () => {
        if (hasData) setScreenState(statePage.check);
    };
    const dateNow = new Date().toISOString();
    const dateEnd = useMemo(() => {
        if (endDate && endTime) {
            return new Date(endDate.setHours(endTime.getHours())).toISOString();
        }
        return null;
    }, [endDate, endTime]);

    switch (screenState) {
        case statePage.creation: {
            return (
                <MainBlock>
                    <ProposalCreation
                        title={title}
                        text={text}
                        setTitle={setTitle}
                        setText={setText}
                        endTime={endTime}
                        endDate={endDate}
                        setEndTime={setEndTime}
                        setEndDate={setEndDate}
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
