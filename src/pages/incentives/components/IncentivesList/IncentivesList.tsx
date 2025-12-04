import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import {
    AddBribeButton,
    Container,
    TitleBlock,
    Title,
    ToggleGroupStyled,
    PlusIcon,
} from 'web/pages/bribes/pages/BribesPage/components/BribesList/BribesList.styled';

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
    const navigate = useNavigate();

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

                <AddBribeButton
                    onClick={() => navigate(AppRoutes.section.incentive.link.addIncentive)}
                >
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
