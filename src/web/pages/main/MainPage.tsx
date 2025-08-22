import { useEffect, useState } from 'react';

import { getAllTimeStats } from 'api/amm';
import { AllTimeStats } from 'api/amm.types';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import HeroBlock from './components/HeroBlock';
import SupportedWallets from './components/SupportedWallets';

import { PageContainer, SectionWrapper } from '../commonPageStyles';
import AquaSoroban from './components/AquaSoroban';
import AquaForBuilders from './components/AquaForBuilders';
import DexStats from './components/DexStats';
import WhyProvideLiq from './components/WhyProvideLiq';

const MainPage = () => {
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [ammStats, setAmmStats] = useState<AllTimeStats | null>(null);

    useEffect(() => {
        getAllTimeStats()
            .then(res => {
                setAmmStats(res);
            })
            .finally(() => {
                setIsLoadingStats(false);
            });
    }, []);

    return (
        <PageContainer>
            <HeroBlock isLoading={isLoadingStats} stats={ammStats} />

            <SectionWrapper>
                <SupportedWallets />

                <AquaSoroban />

                <DexStats isLoading={isLoadingStats} stats={ammStats} />

                <WhyProvideLiq isLoading={isLoadingStats} stats={ammStats} />

                <AquaForBuilders />

                <Community />

                <Subscribe />
            </SectionWrapper>
        </PageContainer>
    );
};

export default MainPage;
