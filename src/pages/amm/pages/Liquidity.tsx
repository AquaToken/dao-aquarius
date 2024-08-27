import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { getUserPools } from '../api/api';
import { Empty } from '../../profile/YourVotes/YourVotes';
import { ModalService, StellarService } from '../../../common/services/globalServices';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import useAuthStore from '../../../store/authStore/useAuthStore';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../common/mixins';
import Button from '../../../common/basics/Button';
import { Breakpoints, COLORS } from '../../../common/styles';
import PageLoader from '../../../common/basics/PageLoader';
import PoolsList from '../components/PoolsList/PoolsList';
import { formatBalance } from '../../../common/helpers/helpers';
import { PoolUserProcessed } from '../api/types';
import ToggleGroup from '../../../common/basics/ToggleGroup';
import Select from '../../../common/basics/Select';

const PoolsListBlock = styled.div`
    display: flex;
    flex-direction: column;
    padding: 4.8rem;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    max-width: 80rem;
    margin: 0 auto 5rem;

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
    all = '',
    soroban = 'soroban',
    classic = 'classic',
}

const FilterOptions = [
    { label: 'All pools', value: FilterValues.all },
    { label: 'Soroban pools', value: FilterValues.soroban },
    { label: 'Classic pools', value: FilterValues.classic },
];

const Liquidity = () => {
    const { account } = useAuthStore();

    const [pools, setPools] = useState<PoolUserProcessed[]>([]);
    const [classicPools, setClassicPools] = useState([]);
    const [filter, setFilter] = useState(FilterValues.all);

    const filteredPools = useMemo(() => {
        if (filter === FilterValues.classic) {
            return classicPools;
        }
        if (filter === FilterValues.soroban) {
            return pools;
        }
        return [...pools, ...classicPools];
    }, [classicPools, pools, filter]);

    useEffect(() => {
        updateData();
    }, [account]);

    const updateData = () => {
        if (account) {
            getUserPools(account.accountId()).then((res) => {
                setPools(res);
            });

            account?.getClassicPools().then((res) => {
                setClassicPools(res);
            });
        }
    };

    const totalLiquidity = useMemo(() => {
        const total = [...pools, ...classicPools].reduce((acc, pool) => {
            const balance = Number(pool.balance) / 1e7;
            const liquidity = Number(pool.liquidity) / 1e7;
            const totalShare = Number(pool.total_share) / 1e7;

            acc += (balance / totalShare) * liquidity;
            return acc;
        }, 0);
        return formatBalance(total * StellarService.priceLumenUsd, true);
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
        <PoolsListBlock>
            <ListHeader>
                <ListTitle>My liquidity positions</ListTitle>
                <ListTotal>
                    <span>Total: </span>
                    <span>${totalLiquidity}</span>
                </ListTotal>
            </ListHeader>
            <ToggleGroupStyled value={filter} options={FilterOptions} onChange={setFilter} />
            <SelectStyled value={filter} options={FilterOptions} onChange={setFilter} />
            {!filteredPools ? (
                <PageLoader />
            ) : Boolean(filteredPools.length) ? (
                <PoolsList isUserList pools={filteredPools} onUpdate={() => updateData()} />
            ) : (
                <div>Your liquidity positions will appear here</div>
            )}
        </PoolsListBlock>
    );
};

export default Liquidity;
