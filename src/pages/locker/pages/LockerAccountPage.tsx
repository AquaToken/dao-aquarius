import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { StellarService } from '../../../common/services/globalServices';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../common/styles';
import { commonMaxWidth, respondDown } from '../../../common/mixins';
import AccountInfoBlock from '../components/LockerAccountPage/AccountInfoBlock/AccountInfoBlock';
import PageLoader from '../../../common/basics/PageLoader';
import AccountService from '../../../common/services/account.service';
import Portfolio from '../components/LockerAccountPage/Portfolio/Portfolio';
import CurrentLocks from '../components/LockerAccountPage/CurrentLocks/CurrentLocks';
import LockAquaForm from '../components/LockerAccountPage/LockAquaForm/LockAquaForm';
import { useIsOnViewport } from '../../../common/hooks/useIsOnViewport';
import ArrowDown from '../../../common/assets/img/icon-arrow-down.svg';
import { getDistributionForAccount } from '../api/api';
import IceBlock from '../components/LockerAccountPage/IceBlock/IceBlock';
import { StellarEvents } from '../../../common/services/stellar.service';
import { LockerRoutes } from '../../../routes';

const MainBlock = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.lightGray};
    padding: 2.5% 0 5%;
`;

const Container = styled.div`
    ${commonMaxWidth};
    flex: 1 0 auto;
    padding: 0 4rem;
    display: flex;
    flex-direction: row;
    justify-content: center;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        padding: 0 1.6rem;
        gap: 1.6rem;
    `}
`;

const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    margin-right: 6rem;
    flex: 1;

    ${respondDown(Breakpoints.md)`
        margin-right: 0;
    `}
`;

const RightColumn = styled.div`
    flex: 1;
    max-width: 48rem;
`;

const ScrollToSidebarButton = styled.div`
    display: none;
    position: fixed;
    justify-content: space-between;
    align-items: center;
    bottom: 0;
    left: 0;
    width: 100%;
    background: ${COLORS.white};
    box-shadow: 0 -0.5rem 1rem rgba(0, 6, 54, 0.06);
    border-radius: 1rem 1rem 0 0;
    padding: 2.4rem 1.6rem;
    font-size: 1.6rem;
    line-height: 2.4rem;
    font-weight: bold;
    cursor: pointer;
    z-index: 430;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const LockerAccountPage = () => {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [ammAquaBalance, setAmmAquaBalance] = useState(null);
    const [locks, setLocks] = useState(null);
    const [distributions, setDistributions] = useState(null);
    const [aquaInVotes, setAquaInVotes] = useState(null);

    const { account, isLogged } = useAuthStore();
    const { accountId } = useParams<{ accountId: string }>();
    const history = useHistory();

    useEffect(() => {
        if (!StellarService.isValidPublicKey(accountId)) {
            history.push(LockerRoutes.main);
            return;
        }
        if (account && accountId !== account.accountId()) {
            setCurrentAccount(null);
            history.replace(`${LockerRoutes.main}/${account.accountId()}`);
        }
    }, [account, accountId]);

    useEffect(() => {
        if (!accountId) {
            return;
        }
        setCurrentAccount(null);
        StellarService.loadAccount(accountId).then((res) => {
            setCurrentAccount(new AccountService(res, null));
        });
    }, [accountId]);

    useEffect(() => {
        if (!accountId) {
            return;
        }
        setLocks(null);
        StellarService.getAccountLocks(accountId).then((res) => {
            setLocks(res);
        });
    }, [accountId]);

    useEffect(() => {
        if (!isLogged) {
            StellarService.closeClaimableBalancesStream();
            return;
        }
        StellarService.startClaimableBalancesStream(account.accountId());

        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                StellarService.getAccountLocks(accountId).then((res) => {
                    setLocks(res);
                });

                StellarService.getAquaInLiquidityVotes(accountId).then((res) => {
                    setAquaInVotes(res);
                });
            }
        });

        return () => unsub();
    }, [isLogged, accountId]);

    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        currentAccount.getAmmAquaBalance().then((res) => {
            setAmmAquaBalance(res);
        });
    }, [currentAccount]);

    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        StellarService.getAquaInLiquidityVotes(currentAccount.accountId()).then((res) => {
            setAquaInVotes(res);
        });
    }, [currentAccount]);

    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        getDistributionForAccount(currentAccount.accountId()).then((res) => {
            setDistributions(res);
        });
    }, [currentAccount]);

    const fromRef = useRef(null);
    const hideBottomBlock = useIsOnViewport(fromRef);

    const scrollToForm = () => {
        fromRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!currentAccount || ammAquaBalance === null || locks === null) {
        return (
            <Container>
                <PageLoader />
            </Container>
        );
    }

    return (
        <MainBlock>
            <Container>
                <LeftColumn>
                    <AccountInfoBlock account={account ?? currentAccount} />
                    <Portfolio
                        ammAquaBalance={ammAquaBalance}
                        currentAccount={account ?? currentAccount}
                        locks={locks}
                    />

                    <IceBlock account={account ?? currentAccount} locks={locks} />

                    {Boolean(locks?.length) && Boolean(distributions) && (
                        <CurrentLocks
                            distributions={distributions}
                            locks={locks}
                            aquaBalance={
                                account?.getAquaBalance() ?? currentAccount.getAquaBalance()
                            }
                            ammAquaBalance={ammAquaBalance}
                            aquaInOffers={
                                account?.getAquaInOffers() ?? currentAccount.getAquaInOffers()
                            }
                            aquaInVotes={aquaInVotes}
                        />
                    )}
                </LeftColumn>

                <RightColumn>
                    <LockAquaForm account={account ?? currentAccount} ref={fromRef} />
                </RightColumn>
            </Container>
            {!hideBottomBlock && (
                <ScrollToSidebarButton onClick={() => scrollToForm()}>
                    <span>Lock AQUA</span>
                    <ArrowDown />
                </ScrollToSidebarButton>
            )}
        </MainBlock>
    );
};

export default LockerAccountPage;
