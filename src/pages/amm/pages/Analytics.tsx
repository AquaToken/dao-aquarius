import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { getTotalStats, getVolume24h } from 'api/amm';

import { AppRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import { useScopedSearchParams } from 'hooks/useScopedSearchParams';
import { useSkipFirstRender } from 'hooks/useSkipFirstRender';
import { useUrlParam } from 'hooks/useUrlParam';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { Option } from 'types/option';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import Plus from 'assets/icons/nav/icon-plus-16.svg';

import Button from 'basics/buttons/Button';
import SectionPicker from 'basics/SectionPicker';

import { commonMaxWidth, flexAllCenter, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import AllPools, { AllPoolsUrlParams } from '../components/AllPools/AllPools';
import LiquidityChart from '../components/LiquidityChart/LiquidityChart';
import MyLiquidity, { MyLiquidityUrlParams } from '../components/MyLiquidity/MyLiquidity';
import VolumeChart from '../components/VolumeChart/VolumeChart';

const Container = styled.main`
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;
    background-color: ${COLORS.gray50};
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 1.6rem 4rem 0;
    flex: 1 0 auto;

    ${respondDown(Breakpoints.sm)`
        padding: 2rem 1.6rem 0;
    `}
`;

const Section = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
    background-color: ${COLORS.white};
    width: 100%;
    margin-bottom: 1.6rem;
    
    ${respondDown(Breakpoints.md)`
        background-color: ${COLORS.gray50};
    `}}
`;

const PlusIcon = styled(Plus)`
    width: 1.6rem;
    height: 1.6rem;
    margin-left: 1rem;
`;

const ListBlock = styled.div`
    padding: 5.2rem 3.2rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        padding: 3rem 0;
    `}
`;

const ListHeader = styled.div`
    ${flexRowSpaceBetween};

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 2.4rem;
    `}
`;

const ListTotal = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;

    span:last-child {
        font-weight: 700;
    }
`;

const Charts = styled.div`
    display: flex;
    justify-content: space-evenly;
    gap: 1.6rem;
    width: 100%;
    background-color: ${COLORS.gray50};

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
    `}
`;

const Chart = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.white};
    padding: 1.6rem;
    border-radius: 0.6rem;
    flex: 1;
    width: 100%;

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
        background-color: ${COLORS.white};
    `}
`;

export enum AnalyticsTabs {
    top = 'top',
    my = 'my',
}

export enum AnalyticsUrlParams {
    tab = 'tab',
}

const OPTIONS: Option<AnalyticsTabs>[] = [
    { label: 'All Pools', value: AnalyticsTabs.top },
    { label: 'My Liquidity', value: AnalyticsTabs.my },
];

const Analytics = () => {
    const [totalStats, setTotalStats] = useState(null);
    const [volume24h, setVolume24h] = useState(null);
    const [myTotal, setMyTotal] = useState(null);
    const [chartWidth, setChartWidth] = useState(0);

    const navigate = useNavigate();

    const { isLogged } = useAuthStore();

    const mainContent = useRef(null);

    useEffect(() => {
        if (!totalStats || !volume24h) {
            return;
        }
        if (mainContent.current) {
            setTimeout(() => {
                mainContent.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }
    }, [totalStats, volume24h]);

    const { value: activeTab, setValue: setTab } = useUrlParam<AnalyticsTabs>(
        AnalyticsUrlParams.tab,
        AnalyticsTabs.top,
        { authRequiredValues: [AnalyticsTabs.my] },
    );

    const allowedParams =
        activeTab === AnalyticsTabs.my
            ? [AnalyticsUrlParams.tab, MyLiquidityUrlParams.filter]
            : [
                  AnalyticsUrlParams.tab,
                  AllPoolsUrlParams.filter,
                  AllPoolsUrlParams.search,
                  AllPoolsUrlParams.sort,
              ];

    useScopedSearchParams(allowedParams);

    useEffect(() => {
        getTotalStats().then(res => {
            setTotalStats(res);
        });
    }, []);

    useEffect(() => {
        getVolume24h().then(res => {
            setVolume24h(res);
        });
    }, []);

    useEffect(() => {
        setMyTotal(null);
    }, [activeTab]);

    useSkipFirstRender(() => {
        if (!isLogged) {
            setTab(AnalyticsTabs.top);
        }
    }, [isLogged]);

    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!totalStats) {
            return;
        }
        const updateWidth = () => {
            if (chartRef.current) {
                setChartWidth(chartRef.current.offsetWidth - 32);
            }
        };
        updateWidth();

        const handleResize = () => {
            requestAnimationFrame(updateWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [totalStats, volume24h]);

    const goToCreatePool = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: AppRoutes.section.amm.link.create,
            });
            return;
        }
        navigate(AppRoutes.section.amm.link.create);
    };

    return (
        <Container>
            <Content>
                {totalStats && volume24h && (
                    <Section>
                        <Charts>
                            <Chart ref={chartRef}>
                                <VolumeChart
                                    data={totalStats}
                                    volume24h={volume24h}
                                    isGlobalStat
                                    width={chartWidth}
                                    height={320}
                                />
                            </Chart>

                            <Chart>
                                <LiquidityChart
                                    data={totalStats}
                                    width={chartWidth}
                                    height={320}
                                    isGlobalStat
                                />
                            </Chart>
                        </Charts>
                    </Section>
                )}

                <Section ref={mainContent}>
                    <ListBlock>
                        <ListHeader>
                            <SectionPicker options={OPTIONS} onChange={setTab} value={activeTab} />

                            {activeTab === AnalyticsTabs.top && (
                                <Button onClick={() => goToCreatePool()}>
                                    create pool <PlusIcon />
                                </Button>
                            )}
                            {activeTab === AnalyticsTabs.my && myTotal !== null && (
                                <ListTotal>
                                    <span>Total: </span>
                                    <span>${formatBalance(myTotal, true)}</span>
                                </ListTotal>
                            )}
                        </ListHeader>
                        {activeTab === AnalyticsTabs.top && <AllPools />}
                        {activeTab === AnalyticsTabs.my && (
                            <MyLiquidity
                                onlyList
                                setTotal={val => setMyTotal(val)}
                                backToAllPools={() => setTab(AnalyticsTabs.top)}
                            />
                        )}
                    </ListBlock>
                </Section>
            </Content>
        </Container>
    );
};

export default Analytics;
