import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { BribesRoutes } from 'constants/routes';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Plus from 'assets/icon-plus.svg';

import Button from 'basics/buttons/Button';
import { ToggleGroup } from 'basics/inputs';

import CurrentBribes from 'pages/bribes/components/BribesPage/CurrentBribes/CurrentBribes';
import UpcomingBribes from 'pages/bribes/components/BribesPage/UpcomingBribes/UpcomingBribes';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 8.3rem;

    ${respondDown(Breakpoints.md)`
         margin-top: 3.3rem;
    `}
`;

export const TitleBlock = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 5.3rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2.3rem;
    `}
`;

export const Title = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.buttonBackground};

    ${respondDown(Breakpoints.md)`
        font-weight: normal;
        font-size: 2.9rem;
        line-height: 3.4rem;
    `}
`;

export const AddBribeButton = styled(Button)`
    width: 22.2rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

export const PlusIcon = styled(Plus)`
    margin-left: 1.6rem;
`;

export const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    margin-bottom: 5.3rem;
`;

enum Tab {
    current = 'current',
    upcoming = 'upcoming',
}

const OPTIONS = [
    { value: Tab.current, label: 'Current' },
    { value: Tab.upcoming, label: 'Upcoming' },
];

const BribesList = () => {
    const [tab, setTab] = React.useState<Tab>(Tab.current);
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
                <Title>Bribes</Title>

                <AddBribeButton onClick={() => history.push(BribesRoutes.addBribe)}>
                    <span>create bribe</span>
                    <PlusIcon />
                </AddBribeButton>
            </TitleBlock>

            <ToggleGroupStyled value={tab} options={OPTIONS} onChange={setTab} />

            {tab === Tab.upcoming && <UpcomingBribes />}
            {tab === Tab.current && <CurrentBribes />}
        </Container>
    );
};

export default BribesList;
