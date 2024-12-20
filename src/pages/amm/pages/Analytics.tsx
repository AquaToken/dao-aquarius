import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { getTotalStats, getVolume24h } from 'api/amm';

import { AmmRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import { useDebounce } from 'hooks/useDebounce';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { commonMaxWidth, flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import Plus from 'assets/icon-plus.svg';
import Search from 'assets/icon-search.svg';

import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';

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
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 6.3rem 4rem 0;
    flex: 1 0 auto;
    background-color: ${COLORS.lightGray};

    ${respondDown(Breakpoints.sm)`
        padding: 2rem 1.6rem 0;
    `}
`;

const Section = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
    background-color: ${COLORS.white};
    width: 100%;
    margin-bottom: 5rem;
`;

const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 6.4rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 5rem;
    `}
`;

const Title = styled.h1`
    font-size: 5.6rem;
    font-weight: 700;
    line-height: 6.4rem;
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
        padding: 3rem 1.6rem;
    `}
`;

const ListHeader = styled.div`
    ${flexRowSpaceBetween};

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 5rem;
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

const StyledInput = styled(Input)`
    width: 56rem;
    margin-left: 2.4rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
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
    padding: 3rem 0;

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
    `}
`;

const Chart = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.lightGray};
    padding: 1.6rem;
    border-radius: 0.6rem;
    flex: 1;

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
        background-color: ${COLORS.white};
    `}
`;

enum Tabs {
    top = 'top',
    my = 'my',
}

const Analytics = () => {
    const [activeTab, setActiveTab] = useState(Tabs.top);
    const [search, setSearch] = useState('');
    const [totalStats, setTotalStats] = useState(null);
    const [volume24h, setVolume24h] = useState(null);
    const [myTotal, setMyTotal] = useState(null);

    const debouncedSearch = useDebounce(search, 700, true);
    const history = useHistory();

    const { isLogged } = useAuthStore();

    useEffect(() => {
        document.body.scrollTo(0, 0);
    }, []);

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
        setSearch('');
        setMyTotal(null);
    }, [activeTab]);

    useEffect(() => {
        if (!isLogged) {
            setActiveTab(Tabs.top);
        }
    }, [isLogged]);

    const goToCreatePool = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: AmmRoutes.create,
            });
            return;
        }
        history.push(`${AmmRoutes.create}`);
    };

    const setTab = (tab: Tabs) => {
        if (tab === Tabs.my && !isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {
                callback: () => setActiveTab(Tabs.my),
            });
        }

        setActiveTab(tab);
    };

    return (
        <Container>
            <Content>
                <Header>
                    <Title>Pools</Title>
                    <Button onClick={() => goToCreatePool()}>
                        create pool <PlusIcon />
                    </Button>
                </Header>

                {totalStats && volume24h && (
                    <Section>
                        <Charts>
                            <Chart>
                                <VolumeChart
                                    data={totalStats}
                                    volume24h={volume24h}
                                    isGlobalStat
                                    width={Math.min(576, +window.innerWidth - 64)}
                                    height={320}
                                />
                            </Chart>
                            <Chart>
                                <LiquidityChart
                                    data={totalStats}
                                    width={Math.min(576, +window.innerWidth - 64)}
                                    height={320}
                                />
                            </Chart>
                        </Charts>
                    </Section>
                )}

                <Section>
                    <ListBlock>
                        <ListHeader>
                            <ListTitles>
                                <ListTab
                                    $isActive={activeTab === Tabs.top}
                                    onClick={() => setTab(Tabs.top)}
                                >
                                    All pools
                                </ListTab>
                                <ListTab
                                    $isActive={activeTab === Tabs.my}
                                    onClick={() => setTab(Tabs.my)}
                                >
                                    My liquidity
                                </ListTab>
                            </ListTitles>
                            {activeTab === Tabs.top && (
                                <StyledInput
                                    placeholder="Search by token name or token address"
                                    value={search}
                                    onChange={({ target }) => setSearch(target.value)}
                                    postfix={<Search />}
                                />
                            )}
                            {activeTab === Tabs.my && myTotal !== null && (
                                <ListTotal>
                                    <span>Total: </span>
                                    <span>${formatBalance(myTotal, true)}</span>
                                </ListTotal>
                            )}
                        </ListHeader>
                        {activeTab === Tabs.top && <AllPools search={debouncedSearch} />}
                        {activeTab === Tabs.my && (
                            <MyLiquidity
                                onlyList
                                setTotal={val => setMyTotal(val)}
                                backToAllPools={() => setTab(Tabs.top)}
                            />
                        )}
                    </ListBlock>
                </Section>
            </Content>
        </Container>
    );
};

export default Analytics;
