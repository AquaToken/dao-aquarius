import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { Option } from 'types/option';

import SectionPicker from 'basics/SectionPicker';

import { flexColumn } from 'styles/mixins';

import AmmHistory from 'pages/profile/Activity/AmmHistory/AmmHistory';
import PaymentsHistory from 'pages/profile/Activity/PaymentsHistory/PaymentsHistory';
import { Header } from 'pages/profile/SdexRewards/SdexRewards';

const Container = styled.div`
    ${flexColumn};
`;

const HeaderStyled = styled(Header)`
    justify-content: flex-start;
`;

enum Tabs {
    ammHistory = 'ammHistory',
    paymentHistory = 'paymentHistory',
}

const OPTIONS: Option<Tabs>[] = [
    { value: Tabs.ammHistory, label: 'Pool Activity' },
    { value: Tabs.paymentHistory, label: 'Payments History' },
];

const Activity = () => {
    const [tab, setTab] = useState<Tabs>(Tabs.ammHistory);

    return (
        <Container>
            <HeaderStyled>
                <SectionPicker options={OPTIONS} onChange={setTab} value={tab} />
            </HeaderStyled>

            {tab === Tabs.ammHistory && <AmmHistory />}
            {tab === Tabs.paymentHistory && <PaymentsHistory />}
        </Container>
    );
};

export default Activity;
