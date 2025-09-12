import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IncentivesRoutes } from 'constants/routes';

import {
    AddBribeButton,
    Container,
    PlusIcon,
    Title,
    TitleBlock,
    ToggleGroupStyled,
} from 'pages/bribes/components/BribesPage/BribesList/BribesList';
import IncentivesTable from 'pages/incentives/components/IncentivesTable/IncentivesTable';

enum Tab {
    current = 'current',
    upcoming = 'upcoming',
}

const OPTIONS = [
    { value: Tab.current, label: 'Current' },
    { value: Tab.upcoming, label: 'Upcoming' },
];

const IncentivesList = () => {
    const [tab, setTab] = useState<Tab>(Tab.current);
    const history = useHistory();

    const headerRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }, []);

    return (
        <Container>
            <TitleBlock ref={headerRef}>
                <Title>Incentives</Title>

                <AddBribeButton onClick={() => history.push(IncentivesRoutes.addIncentive)}>
                    <span>add incentive</span>
                    <PlusIcon />
                </AddBribeButton>
            </TitleBlock>

            <ToggleGroupStyled value={tab} options={OPTIONS} onChange={setTab} />

            {tab === Tab.current && <IncentivesTable isActive={true} />}
            {tab === Tab.upcoming && <IncentivesTable isActive={false} />}
        </Container>
    );
};

export default IncentivesList;
