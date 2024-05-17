import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { getUserPools } from '../api/api';
import { Empty } from '../../profile/YourVotes/YourVotes';
import { ModalService } from '../../../common/services/globalServices';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import useAuthStore from '../../../store/authStore/useAuthStore';
import styled from 'styled-components';
import {
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from '../../../common/mixins';
import Button from '../../../common/basics/Button';
import { Breakpoints, COLORS } from '../../../common/styles';
import PageLoader from '../../../common/basics/PageLoader';
import PoolsList from '../components/PoolsList/PoolsList';
import { formatBalance } from '../../../common/helpers/helpers';

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
    padding: 6.3rem 4rem 0;
    flex: 1 0 auto;
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
    margin-bottom: 5.8rem;
`;

const ListTitle = styled.h3`
    font-size: 3.6rem;
    line-height: 4.2rem;
    font-weight: 400;
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

const Liquidity = () => {
    const { account } = useAuthStore();

    const [pools, setPools] = useState(null);

    useEffect(() => {
        updateData();
    }, [account]);

    const updateData = () => {
        if (account) {
            getUserPools(account.accountId()).then((res) => {
                setPools(res);
            });
        }
    };

    const totalLiquidity = useMemo(() => {
        if (!pools) {
            return <PageLoader />;
        }

        const total = pools.reduce((acc, pool) => {
            const balance = pool.balance / 1e7;
            const liquidity = pool.liquidity / 1e7;
            const totalShare = pool.total_share / 1e7;

            acc += (balance / totalShare) * liquidity;
            return acc;
        }, 0);
        return formatBalance(total, true);
    }, [pools]);

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
        <Container>
            <Content>
                <Header>
                    <Title>Liquidity overview</Title>
                    {/*<Button>*/}
                    {/*    add liquidity <PlusIcon />*/}
                    {/*</Button>*/}
                </Header>
                <PoolsListBlock>
                    <ListHeader>
                        <ListTitle>My liquidity positions</ListTitle>
                        <ListTotal>
                            <span>Total: </span>
                            <span>{totalLiquidity} XLM</span>
                        </ListTotal>
                    </ListHeader>
                    {!pools ? (
                        <PageLoader />
                    ) : Boolean(pools.length) ? (
                        <PoolsList isUserList pools={pools} onUpdate={() => updateData()} />
                    ) : (
                        <div>Your liquidity positions will appear here</div>
                    )}
                </PoolsListBlock>
            </Content>
        </Container>
    );
};

export default Liquidity;
