import { useEffect, useState } from 'react';

import { getAllTimeStats } from 'api/amm';
import { AllTimeStats } from 'api/amm.types';
import { getTotalRewards } from 'api/rewards';

import { formatBalance } from 'helpers/format-number';

import { useScrollToHash } from 'hooks/useScrollToHash';

import { StellarService } from 'services/globalServices';

import { COLORS } from 'web/styles';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import { TotalRewards } from 'pages/vote/api/types';

import AquaForBuilders from './components/AquaForBuilders';
import AquaSoroban from './components/AquaSoroban';
import DexStats from './components/DexStats';
import HeroBlock from './components/HeroBlock';
import HowItWorks from './components/HowItWorks';
import LiqPoolsTabs from './components/LiqPoolsTabs';
import SupportedWallets from './components/SupportedWallets';
import TokenSystem from './components/TokenSystem';
import WhyProvideLiq from './components/WhyProvideLiq';

import { PageContainer, SectionWrapper } from '../commonPageStyles';

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
