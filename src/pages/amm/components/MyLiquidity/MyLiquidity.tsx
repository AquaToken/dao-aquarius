import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getUserPools } from 'api/amm';

import { MainRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService } from 'services/globalServices';
import { POOL_TYPE } from 'services/soroban.service';

import { PoolUserProcessed } from 'types/amm';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';
import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import PageLoader from 'basics/loaders/PageLoader';

import { AnalyticsUrlParams, Tabs } from 'pages/amm/pages/Analytics';
import { ExternalLinkStyled } from 'pages/profile/SdexRewards/SdexRewards';
import { Empty } from 'pages/profile/YourVotes/YourVotes';

import PoolsList from '../PoolsList/PoolsList';

const PoolsListBlock = styled.div<{ $onlyList: boolean }>`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    margin: 4.8rem auto 5rem;

    ${({ $onlyList }) =>
        !$onlyList &&
        `
        padding: 4.8rem;
        border-radius: 0.5rem;
        box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
        max-width: 80rem;
        margin-top: 0;
    `}

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `}
`;

const ListHeader = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 2rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

const ListTitle = styled.h3`
    font-size: 3.6rem;
    line-height: 4.2rem;
    font-weight: 400;

    ${respondDown(Breakpoints.sm)`
        font-size: 2.8rem;
    `}
`;

const ListTotal = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;

    span:last-child {
        font-weight: 700;
    }
`;

const Section = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
`;

const LoginButton = styled(Button)`
    margin-top: 1rem;
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    margin-bottom: 4rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    display: none;
    margin-bottom: 4rem;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

enum FilterValues {
    all = 'all',
    volatile = 'volatile',
    stable = 'stable',
    classic = 'classic',
}

enum UrlParams {
    filter = 'filter',
}

const FilterOptions = [
    { label: 'All', value: FilterValues.all },
    { label: 'Stable', value: FilterValues.stable },
    { label: 'Volatile', value: FilterValues.volatile },
    { label: 'Classic', value: FilterValues.classic },
];

interface MyLiquidityProps {
    setTotal?: (total: number) => void;
    onlyList?: boolean;
    backToAllPools?: () => void;
}

const MyLiquidity = ({ setTotal, onlyList, backToAllPools }: MyLiquidityProps) => {
    const { account } = useAuthStore();

    const [pools, setPools] = useState<PoolUserProcessed[]>([]);
    const [classicPools, setClassicPools] = useState([]);
    const [filter, setFilter] = useState(null);

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        if (params.get(AnalyticsUrlParams.tab) !== Tabs.my) {
            return;
        }
        const filterParam = params.get(UrlParams.filter);

        if (filterParam) {
            setFilter(filterParam as FilterValues);
        } else {
            params.append(UrlParams.filter, FilterValues.all);
            setFilter(FilterValues.all);
            history.replace({ search: params.toString() });
        }
    }, [location]);

    const setFilterValue = (value: FilterValues) => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.filter, value);
        history.push({ search: params.toString() });
    };

    const updateIndex = useUpdateIndex(5000);

    const filteredPools = useMemo(() => {
        if (filter === FilterValues.classic) {
            return classicPools;
        }
        if (filter === FilterValues.volatile) {
            return pools.filter(({ pool_type }) => pool_type === POOL_TYPE.constant);
        }
        if (filter === FilterValues.stable) {
            return pools.filter(({ pool_type }) => pool_type === POOL_TYPE.stable);
        }
        return [...pools, ...classicPools];
    }, [classicPools, pools, filter]);

    const updateData = () => {
        if (account) {
            getUserPools(account.accountId()).then(res => {
                setPools(res);
            });

            account?.getClassicPools().then(res => {
                setClassicPools(res);
            });
        }
    };

    useEffect(() => {
        updateData();
    }, [account, updateIndex]);

    const totalLiquidity = useMemo(() => {
        const totalXlm = [...pools, ...classicPools].reduce((acc, pool) => {
            const balance = Number(pool.balance) / 1e7;
            const liquidity = Number(pool.liquidity) / 1e7;
            const totalShare = Number(pool.total_share) / 1e7;

            acc += (balance / totalShare) * liquidity;
            return acc;
        }, 0);

        const totalUsd = totalXlm * StellarService.priceLumenUsd;

        if (setTotal) {
            setTotal(totalUsd);
        }
        return totalUsd;
    }, [pools, classicPools]);

    if (!account) {
        return (
            <Section>
                <Empty>
                    <h3>Log in required.</h3>
                    <span>To use the demo you need to log in.</span>

                    <LoginButton onClick={() => ModalService.openModal(ChooseLoginMethodModal, {})}>
                        Log in
                    </LoginButton>
                </Empty>
            </Section>
        );
    }
    return (
        <PoolsListBlock $onlyList={onlyList}>
            {!onlyList && (
                <ListHeader>
                    <ListTitle>My liquidity positions</ListTitle>
                    <ListTotal>
                        <span>Total: </span>
                        <span>${formatBalance(totalLiquidity, true)}</span>
                    </ListTotal>
                </ListHeader>
            )}
            <ToggleGroupStyled value={filter} options={FilterOptions} onChange={setFilterValue} />
            <SelectStyled value={filter} options={FilterOptions} onChange={setFilterValue} />
            {!filteredPools ? (
                <PageLoader />
            ) : filteredPools.length ? (
                <PoolsList isUserList pools={filteredPools} onUpdate={() => updateData()} />
            ) : (
                <Section>
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>It looks like you don’t have any active liquidity positions.</span>

                        <ExternalLinkStyled asDiv>
                            <Link
                                to={MainRoutes.amm}
                                onClick={() => {
                                    if (backToAllPools) {
                                        backToAllPools();
                                    }
                                }}
                            >
                                Browse pools
                            </Link>
                        </ExternalLinkStyled>
                    </Empty>
                </Section>
            )}
        </PoolsListBlock>
    );
};

export default MyLiquidity;
