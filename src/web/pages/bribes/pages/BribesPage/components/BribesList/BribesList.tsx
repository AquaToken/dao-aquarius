import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { BribeTab, SELECT_OPTIONS, UpcomingBribesParams } from 'constants/bribes';
import { AppRoutes } from 'constants/routes';

import { useScopedSearchParams } from 'hooks/useScopedSearchParams';
import { useUrlParam } from 'hooks/useUrlParam';

import {
    AddBribeButton,
    Container,
    PlusIcon,
    SectionPickerStyled,
    TitleBlock,
} from './BribesList.styled';

import CurrentBribes from '../CurrentBribes/CurrentBribes';
import UpcomingBribes from '../UpcomingBribes/UpcomingBribes';

enum UrlParams {
    tab = 'tab',
}

const BribesList: React.FC = () => {
    const navigate = useNavigate();
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Smooth scroll to top of list when the component mounts
        setTimeout(() => {
            headerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }, []);

    const { value: tab, setValue: setTab } = useUrlParam<BribeTab>(UrlParams.tab, BribeTab.current);

    const allowedParams =
        tab === BribeTab.current
            ? [UrlParams.tab]
            : [
                  UrlParams.tab,
                  UpcomingBribesParams.sort,
                  UpcomingBribesParams.minBribeAmount,
                  UpcomingBribesParams.week,
                  UpcomingBribesParams.type,
              ];

    useScopedSearchParams(allowedParams);

    return (
        <Container>
            <TitleBlock ref={headerRef}>
                <SectionPickerStyled options={SELECT_OPTIONS} onChange={setTab} value={tab} />

                <AddBribeButton onClick={() => navigate(AppRoutes.section.bribes.link.addBribe)}>
                    <span>create bribe</span>
                    <PlusIcon />
                </AddBribeButton>
            </TitleBlock>

            {tab === BribeTab.upcoming ? <UpcomingBribes /> : <CurrentBribes />}
        </Container>
    );
};

export default BribesList;
