import { useEffect, useState } from 'react';

import { getTotalStats } from 'api/amm';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import HeroBlock from './components/HeroBlock';
import SupportedWallets from './components/SupportedWallets';

import { PageContainer, SectionWrapper } from '../commonPageStyles';
import AquaSoroban from './components/AquaSoroban';
import AquaForBuilders from './components/AquaForBuilders';
import { PoolStatistics } from 'types/amm';

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

            <SectionWrapper>
                <SupportedWallets />

                <AquaSoroban />

                <AquaForBuilders />

                <Community />

                <Subscribe />
            </SectionWrapper>
        </PageContainer>
    );
};

export default MainPage;
