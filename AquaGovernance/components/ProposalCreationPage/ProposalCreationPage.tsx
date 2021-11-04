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
    const [body, setBody] = useState('');
    const [screenState, setScreenState] = useState(statePage.creation);

    const hasData = !!(startDate && startTime && title && body);
    const onSubmit = () => {
        const data = {
            // startDate: Date.now(),
            endDate: startDate.setHours(startTime.getHours()),
            title,
            body,
        };
        if (hasData) setScreenState(statePage.check);
        console.log('submit', data);
    };

    switch (screenState) {
        case statePage.creation: {
            return (
                <MainBlock>
                    <ProposalCreation
                        title={title}
                        body={body}
                        setTitle={setTitle}
                        setBody={setBody}
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
                    <div>sdf</div>
                </MainBlock>
            );
        }
    }
};

export default ProposalCreationPage;
