import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { BribeTab, SELECT_OPTIONS } from 'constants/bribes';
import { AppRoutes } from 'constants/routes';

import {
    Container,
    TitleBlock,
    Title,
    AddBribeButton,
    PlusIcon,
    ToggleGroupStyled,
} from './BribesList.styled';

import CurrentBribes from '../CurrentBribes/CurrentBribes';
import UpcomingBribes from '../UpcomingBribes/UpcomingBribes';

const BribesList: React.FC = () => {
    const [tab, setTab] = React.useState<BribeTab>(BribeTab.current);
    const navigate = useNavigate();
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Smooth scroll to top of list when the component mounts
        setTimeout(() => {
            headerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }, []);

    return (
        <Container>
            <TitleBlock ref={headerRef}>
                <Title>Bribes</Title>

                <AddBribeButton onClick={() => navigate(AppRoutes.section.bribes.link.addBribe)}>
                    <span>create bribe</span>
                    <PlusIcon />
                </AddBribeButton>
            </TitleBlock>

            <ToggleGroupStyled value={tab} options={SELECT_OPTIONS} onChange={setTab} />

            {tab === BribeTab.upcoming ? <UpcomingBribes /> : <CurrentBribes />}
        </Container>
    );
};

export default BribesList;
