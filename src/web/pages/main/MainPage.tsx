import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getTotalStats } from 'api/amm';

import { COLORS, MAX_WIDTHS } from 'web/styles';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import HeroBlock from './components/HeroBlock';
import SupportedWallets from './components/SupportedWallets';

import { PageContainer } from '../commonPageStyles';
import AquaSoroban from './components/AquaSoroban';
import { commonSectionPaddings } from 'web/mixins';
import AquaForBuilders from './components/AquaForBuilders';
import { PoolStatistics } from 'types/amm';

const Wrapper = styled.div`
    max-width: ${MAX_WIDTHS.mainPage};
    background-color: ${COLORS.white};
    ${commonSectionPaddings};
`;

const MainPage = () => {
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [lastStats, setLastStats] = useState<PoolStatistics | null>(null);

    useEffect(() => {
        getTotalStats(1)
            .then(res => {
                setLastStats(res[0]);
            })
            .finally(() => {
                setIsLoadingStats(false);
            });
    }, []);

    return (
        <PageContainer>
            <HeroBlock isLoading={isLoadingStats} lastStats={lastStats} />

            <Wrapper>
                <SupportedWallets />

                <AquaSoroban />

                <AquaForBuilders />

                <Community />

                <Subscribe />
            </Wrapper>
        </PageContainer>
    );
};

export default MainPage;
