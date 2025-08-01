import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getTotalStats, getVolume24h } from 'api/amm';

import { AmmRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import { useSkipFirstRender } from 'hooks/useSkipFirstRender';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { commonMaxWidth, flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import Plus from 'assets/icon-plus.svg';

import Button from 'basics/buttons/Button';

import AllPools from '../components/AllPools/AllPools';
import LiquidityChart from '../components/LiquidityChart/LiquidityChart';
import MyLiquidity from '../components/MyLiquidity/MyLiquidity';
import VolumeChart from '../components/VolumeChart/VolumeChart';

const Container = styled.main`
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;
    background-color: ${COLORS.lightGray};
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
        background-color: ${COLORS.lightGray};
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

const ListTitles = styled.h3`
    font-size: 3.6rem;
    font-weight: 400;
    line-height: 4.2rem;

    ${respondDown(Breakpoints.sm)`
        font-size: 2.4rem;
    `}
`;

const ListTab = styled.span<{ $isActive: boolean }>`
    cursor: pointer;
    color: ${({ $isActive }) => ($isActive ? COLORS.titleText : `${COLORS.titleText}4D`)};
    white-space: nowrap;

    &:hover {
        color: ${({ $isActive }) => ($isActive ? COLORS.titleText : COLORS.placeholder)};
    }

    &:first-child {
        border-right: 0.1rem solid ${COLORS.gray};
        padding-right: 2.4rem;
        margin-right: 2.4rem;
    }
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
    background-color: ${COLORS.lightGray};

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

const Analytics = () => {
    const [activeTab, setActiveTab] = useState(null);
    const [totalStats, setTotalStats] = useState(null);
    const [volume24h, setVolume24h] = useState(null);
    const [myTotal, setMyTotal] = useState(null);
    const [chartWidth, setChartWidth] = useState(0);

    const history = useHistory();
    const location = useLocation();

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

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const tabParam = params.get(AnalyticsUrlParams.tab);

        if (tabParam) {
            setActiveTab(tabParam as AnalyticsTabs);
        } else {
            params.append(AnalyticsUrlParams.tab, AnalyticsTabs.top);
            setActiveTab(AnalyticsTabs.top);
            history.replace({ search: params.toString() });
        }
    }, [location]);

    const { isLogged } = useAuthStore();

    const setTab = (tab: AnalyticsTabs) => {
        if (tab === AnalyticsTabs.my && !isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {
                callback: () => {
                    const params = new URLSearchParams('');
                    params.set(AnalyticsUrlParams.tab, AnalyticsTabs.my);
                    history.replace({ search: params.toString() });
                },
            });
        }
        const params = new URLSearchParams('');
        params.set(AnalyticsUrlParams.tab, tab);
        history.push({ search: params.toString() });
    };

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
                redirectURL: AmmRoutes.create,
            });
            return;
        }
        history.push(`${AmmRoutes.create}`);
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
                            <ListTitles>
                                <ListTab
                                    $isActive={activeTab === AnalyticsTabs.top}
                                    onClick={() => setTab(AnalyticsTabs.top)}
                                >
                                    All Pools
                                </ListTab>
                                <ListTab
                                    $isActive={activeTab === AnalyticsTabs.my}
                                    onClick={() => setTab(AnalyticsTabs.my)}
                                >
                                    My Liquidity
                                </ListTab>
                            </ListTitles>
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
