import * as React from 'react';
import { useEffect, useState } from 'react';
import { FilterOptions, getPools } from '../api/api';
import styled from 'styled-components';
import { commonMaxWidth, flexAllCenter, flexRowSpaceBetween } from '../../../common/mixins';
import PageLoader from '../../../common/basics/PageLoader';
import Button from '../../../common/basics/Button';
import Plus from '../../../common/assets/img/icon-plus.svg';
import Search from '../../../common/assets/img/icon-search.svg';
import { COLORS } from '../../../common/styles';
import Input from '../../../common/basics/Input';
import ToggleGroup from '../../../common/basics/ToggleGroup';
import Table from '../../../common/basics/Table';
import Pair from '../../vote/components/common/Pair';
import { AmmRoutes } from '../../../routes';
import { useHistory } from 'react-router-dom';
import { formatBalance } from '../../../common/helpers/helpers';

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
`;

const Section = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
    background-color: ${COLORS.white};
    width: 100%;
`;

const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 6.4rem;
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

const TableBlock = styled.div`
    padding: 5.2rem 3.2rem;
    width: 100%;
`;

const TableHeader = styled.div`
    ${flexRowSpaceBetween};
`;

const TableTitle = styled.h3`
    font-size: 3.6rem;
    font-weight: 400;
    line-height: 4.2rem;
`;

const StyledInput = styled(Input)`
    width: 56rem;
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    margin-top: 3.6rem;
`;

const OPTIONS = [
    { label: 'All', value: FilterOptions.all },
    { label: 'Stable swap', value: FilterOptions.stable },
    { label: 'Constant product', value: FilterOptions.constant },
];
const Analytics = () => {
    const [filter, setFilter] = useState(FilterOptions.all);
    const [pools, setPools] = useState(null);

    const history = useHistory();

    useEffect(() => {
        getPools().then((res) => {
            setPools(res);
        });
    }, [filter]);

    const goToPoolPage = (id) => {
        history.push(`${AmmRoutes.analytics}${id}/`);
    };

    const goToCreatePool = () => {
        history.push(`${AmmRoutes.create}`);
    };

    return (
        <Container>
            <Content>
                <Header>
                    <Title>Analytics</Title>
                    <Button onClick={() => goToCreatePool()}>
                        create pool <PlusIcon />
                    </Button>
                </Header>
                <Section>
                    {!pools ? (
                        <PageLoader />
                    ) : pools.length ? (
                        <TableBlock>
                            <TableHeader>
                                <TableTitle>Top pools</TableTitle>
                                <StyledInput
                                    placeholder="Search by pool name, pool address, token name or token address"
                                    postfix={<Search />}
                                />
                            </TableHeader>
                            <ToggleGroupStyled
                                value={filter}
                                options={OPTIONS}
                                onChange={setFilter}
                            />
                            <Table
                                head={[
                                    { children: 'Assets', flexSize: 4 },
                                    { children: 'Type' },
                                    { children: 'Fee' },
                                    { children: 'Daily reward' },
                                    { children: 'TVL' },
                                ]}
                                body={pools.map((pool) => ({
                                    key: pool.address,
                                    onRowClick: () => goToPoolPage(pool.address),
                                    rowItems: [
                                        {
                                            children: (
                                                <Pair
                                                    base={pool.assets[0]}
                                                    counter={pool.assets[1]}
                                                    thirdAsset={pool.assets[2]}
                                                    fourthAsset={pool.assets[3]}
                                                />
                                            ),
                                            flexSize: 3,
                                        },
                                        {
                                            children:
                                                pool.pool_type === 'stable'
                                                    ? 'Stable swap'
                                                    : 'Constant product',
                                        },
                                        { children: `${pool.fee * 100}%` },
                                        {
                                            children: pool.tps
                                                ? `${formatBalance(
                                                      (pool.tps / 1e7) * 60 * 60 * 24,
                                                      true,
                                                  )} AQUA`
                                                : '-',
                                        },
                                        { children: pool.volume ? pool.volume / 1e7 : '-' },
                                    ],
                                }))}
                            />
                        </TableBlock>
                    ) : (
                        <h3>There's nothing here.</h3>
                    )}
                </Section>
            </Content>
        </Container>
    );
};

export default Analytics;
