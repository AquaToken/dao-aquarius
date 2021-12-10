import * as React from 'react';
import styled from 'styled-components';
import { useState } from 'react';
import ProposalCreation, { DAY } from './ProposalCreation/ProposalCreation';
import ProposalScreen from '../VoteProposalPage/Proposal/ProposalScreen';
import useAuthStore from '../../../common/store/authStore/useAuthStore';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

export enum statePage {
    creation = 'creation',
    check = 'check',
}

const defaultText =
    '<p><strong>Summary</strong></p><p>Insert your short summary here.</p><p><br></p><p><strong>Motivation</strong></p><p>Insert proposal motivation here.</p><p><br></p><p><strong>Specification</strong></p><p>Insert proposal specification here. Describe the implementation plan.</p>';

const ProposalCreationPage = (): JSX.Element => {
    const [title, setTitle] = useState('');
    const [text, setText] = useState(defaultText);
    const [screenState, setScreenState] = useState(statePage.creation);
    const [period, setPeriod] = useState(DAY * 3);

    const { account } = useAuthStore();
    const accountId = account?.accountId();

    const hasData = !!(title && text && accountId);
    const onSubmit = () => {
        if (hasData) setScreenState(statePage.check);
    };

    const dateNow = new Date().toISOString();
    const dateEnd = new Date(Date.now() + period).toISOString();

    switch (screenState) {
        case statePage.creation: {
            return (
                <MainBlock>
                    <ProposalCreation
                        title={title}
                        text={text}
                        setTitle={setTitle}
                        setText={setText}
                        period={period}
                        setPeriod={setPeriod}
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
                            aqua_circulating_supply: '1',
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
