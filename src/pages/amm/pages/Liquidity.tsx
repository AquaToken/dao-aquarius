import * as React from 'react';
import { useEffect, useState } from 'react';
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
import Plus from '../../../common/assets/img/icon-plus.svg';
import Arrow from '../../../common/assets/img/icon-arrow-down.svg';
import Pair from '../../vote/components/common/Pair';
import PageLoader from '../../../common/basics/PageLoader';
import { formatBalance } from '../../../common/helpers/helpers';
import WithdrawFromPool from '../components/WithdrawFromPool/WithdrawFromPool';
import DepositToPool from '../components/DepositToPool/DepositToPool';

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

const PlusIcon = styled(Plus)`
    width: 1.6rem;
    height: 1.6rem;
    margin-left: 1rem;
`;

const PoolsList = styled.div`
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

const PoolBlock = styled.div`
    display: flex;
    flex-direction: column;
    margin: 2rem 0;
`;

const PoolMain = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;
`;

const PoolStat = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 2.8rem;
    margin-left: auto;

    span:last-child {
        font-size: 1.4rem;
        font-weight: 400;
        line-height: 1.6rem;
    }
`;

const ExpandButton = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.lightGray};
    border-radius: 0.6rem;
    height: 4.8rem;
    width: 4.8rem;
    cursor: pointer;

    &:hover {
        background-color: ${COLORS.gray};
    }
`;

const ArrowDown = styled(Arrow)<{ $isOpen: boolean }>`
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'unset')};
    transform-origin: center;
    transition: transform linear 200ms;
`;

const ExpandedBlock = styled.div`
    display: flex;
    flex-direction: column;
    padding: 3rem 2.4rem;
    border-radius: 0.6rem;
    background-color: ${COLORS.lightGray};
    margin-top: 2.4rem;
    animation: open ease-in-out 200ms;
    transform-origin: top;

    @keyframes open {
        0% {
            transform: scaleY(0);
        }
        80% {
            transform: scaleY(1.1);
        }
        100% {
            transform: scaleY(1);
        }
    }
`;

const ExpandedDataRow = styled.div`
    ${flexRowSpaceBetween};
    color: ${COLORS.grayText};
    gap: 0.8rem;

    span:last-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
    }

    &:not(:last-child) {
        margin-bottom: 1.6rem;
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

    const [isOpen, setIsOpen] = useState(false);
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

    console.log(pools);

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
                    <Button>
                        add liquidity <PlusIcon />
                    </Button>
                </Header>
                <PoolsList>
                    <ListHeader>
                        <ListTitle>My liquidity positions</ListTitle>
                        <ListTotal>
                            <span>Total:</span>
                            <span>$2.01</span>
                        </ListTotal>
                    </ListHeader>
                    {!pools ? (
                        <PageLoader />
                    ) : Boolean(pools.length) ? (
                        pools.map((pool) => {
                            console.log(pool);
                            return (
                                <PoolBlock>
                                    <PoolMain>
                                        <Pair base={pool.assets[0]} counter={pool.assets[1]} />
                                        <PoolStat>
                                            <span>$1.53</span>
                                            <span>Daily fee: {'<'}0.01%</span>
                                        </PoolStat>
                                        <ExpandButton onClick={() => setIsOpen((val) => !val)}>
                                            <ArrowDown $isOpen={isOpen} />
                                        </ExpandButton>
                                    </PoolMain>
                                    {isOpen && (
                                        <ExpandedBlock>
                                            <ExpandedDataRow>
                                                <span>Shares </span>
                                                <span>{formatBalance(pool.balance / 1e7)}</span>
                                            </ExpandedDataRow>
                                            <ExpandedDataRow>
                                                <span>Fee</span>
                                                <span>{pool.fee}%</span>
                                            </ExpandedDataRow>
                                            <ExpandedDataRow>
                                                <Button
                                                    fullWidth
                                                    onClick={() =>
                                                        ModalService.openModal(WithdrawFromPool, {
                                                            pool,
                                                            accountShare: pool.balance / 1e7,
                                                        }).then(() => updateData())
                                                    }
                                                >
                                                    Remove liquidity
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    onClick={() =>
                                                        ModalService.openModal(DepositToPool, {
                                                            pool,
                                                        }).then(() => updateData())
                                                    }
                                                >
                                                    Add liquidity
                                                </Button>
                                            </ExpandedDataRow>
                                        </ExpandedBlock>
                                    )}
                                </PoolBlock>
                            );
                        })
                    ) : (
                        <div>Your liquidity positions will appear here</div>
                    )}
                </PoolsList>
            </Content>
        </Container>
    );
};

export default Liquidity;
