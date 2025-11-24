import { useEffect, useState } from 'react';

import { getAllTimeStats } from 'api/amm';
import { AllTimeStats } from 'api/amm.types';
import { getTotalRewards } from 'api/rewards';

import { formatBalance } from 'helpers/format-number';

import { useScrollToHash } from 'hooks/useScrollToHash';

import { StellarService } from 'services/globalServices';

import Community from 'components/Community';

import { PageContainer, SectionWrapper } from 'styles/commonPageStyles';
import { COLORS } from 'styles/style-constants';

import { TotalRewards } from 'pages/vote/api/types';

import AquaForBuilders from './components/AquaForBuilders/AquaForBuilders';
import AquaSoroban from './components/AquaSoroban/AquaSoroban';
import DexStats from './components/DexStats/DexStats';
import HeroBlock from './components/HeroBlock/HeroBlock';
import HowItWorks from './components/HowItWorks/HowItWorks';
import LiqPoolsTabs from './components/LiqPoolsTabs/LiqPoolsTabs';
import SupportedWallets from './components/SupportedWallets/SupportedWallets';
import TokenSystem from './components/TokenSystem/TokenSystem';
import WhyProvideLiq from './components/WhyProvideLiq/WhyProvideLiq';

const MainPage = () => {
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [ammStats, setAmmStats] = useState<AllTimeStats | null>(null);
    const [aquaPrice, setAquaPrice] = useState<number | null>(null);
    const [totalRewards, setTotalRewards] = useState<TotalRewards | null>(null);

    useScrollToHash();

    useEffect(() => {
        Promise.all([
            getAllTimeStats().then(res => {
                setAmmStats(res);
            }),
            StellarService.price.getAquaUsdPrice().then(res => {
                setAquaPrice(res);
            }),
            getTotalRewards().then(res => {
                setTotalRewards(res);
            }),
        ]).finally(() => {
            setIsLoadingStats(false);
        });
    }, []);

    const totalDistributedMonthly =
        (totalRewards?.total_daily_amm_reward + totalRewards?.total_daily_sdex_reward) *
        aquaPrice *
        30;

    const formattedTotalDistributedMonthly = `$${formatBalance(
        totalDistributedMonthly,
        true,
        true,
    )}`;

    const volumeInUsd = `$${formatBalance(ammStats?.volume / 1e7, true, true)}`;
    const tvlInUsd = `$${formatBalance(ammStats?.tvl / 1e7, true, true)}`;

    return (
        <PageContainer $color={COLORS.white}>
            <HeroBlock
                isLoading={isLoadingStats}
                volumeInUsd={volumeInUsd}
                tvlInUsd={tvlInUsd}
                monthlyDistributed={formattedTotalDistributedMonthly}
            />

            <SectionWrapper>
                <SupportedWallets />

                <AquaSoroban />

                <DexStats
                    isLoading={isLoadingStats}
                    volumeInUsd={volumeInUsd}
                    tvlInUsd={tvlInUsd}
                />
            </SectionWrapper>

            <LiqPoolsTabs />

            <SectionWrapper>
                <TokenSystem />

                <HowItWorks />

                <WhyProvideLiq
                    monthlyDistributed={formattedTotalDistributedMonthly}
                    isLoading={isLoadingStats}
                />
            </SectionWrapper>

            <AquaForBuilders />

            <SectionWrapper>
                <Community />
            </SectionWrapper>
        </PageContainer>
    );
};

export default MainPage;
