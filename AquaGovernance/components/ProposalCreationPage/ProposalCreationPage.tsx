import * as React from 'react';
import styled from 'styled-components';
import 'react-datepicker/dist/react-datepicker.css';
import { useState } from 'react';
import ProposalCreation from './ProposalCreation/ProposalCreation';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

enum statePage {
    creation = 'creation',
    check = 'check',
}

const ProposalCreationPage = (): JSX.Element => {
    const [startDate, setStartDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [screenState, setScreenState] = useState(statePage.creation);

    const hasData = !!(startDate && startTime && title && text);
    const onSubmit = () => {
        const data = {
            // startDate: Date.now(),
            endDate: startDate.setHours(startTime.getHours()),
            title,
            text,
        };
        if (hasData) setScreenState(statePage.check);
        console.log('submit', data);
    };

    // const { title, text, proposed_by: proposedBy, start_at: startDate, end_at: endDate } = proposal;

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
                    {/*<ProposalScreen*/}
                    {/*    proposal={{*/}
                    {/*        title,*/}
                    {/*        text,*/}
                    {/*        proposedBy: 'GSDFHGKSDHFSHFKHSDFSKFHKSJFKSKFS',*/}
                    {/*        startDate,*/}
                    {/*        endDate: startDate.setHours(startTime.getHours()),*/}
                    {/*    }}*/}
                    {/*/>*/}
                </MainBlock>
            );
        }
    }
};

export default ProposalCreationPage;
