import { useEffect, useState } from 'react';

import { getAllTimeStats } from 'api/amm';
import { AllTimeStats } from 'api/amm.types';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import { TotalRewards } from 'pages/vote/api/types';

import HeroBlock from './components/HeroBlock';
import SupportedWallets from './components/SupportedWallets';

import { PageContainer, SectionWrapper } from '../commonPageStyles';
import AquaSoroban from './components/AquaSoroban';
import AquaForBuilders from './components/AquaForBuilders';
import DexStats from './components/DexStats';
import WhyProvideLiq from './components/WhyProvideLiq';
import TokenSystem from './components/TokenSystem';
import { useScrollToHash } from 'hooks/useScrollToHash';
import HowItWorks from './components/HowItWorks';
import { COLORS } from 'web/styles';
import LiqPoolsTabs from './components/LiqPoolsTabs';
import { StellarService } from 'services/globalServices';
import { getTotalRewards } from 'api/rewards';
import { formatBalance } from 'helpers/format-number';

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
            StellarService.getAquaUsdPrice().then(res => {
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

                <AquaForBuilders />

                <Community />
            </SectionWrapper>
        </PageContainer>
    );
};

export default MainPage;
