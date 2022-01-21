import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import useAuthStore from '../../../common/store/authStore/useAuthStore';
import { StellarService } from '../../../common/services/globalServices';
import { MainRoutes } from '../../routes';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../common/styles';
import { commonMaxWidth, respondDown } from '../../../common/mixins';
import AccountInfoBlock from './AccountInfoBlock/AccountInfoBlock';
import PageLoader from '../../../common/basics/PageLoader';
import AccountService from '../../../common/services/account.service';
import Portfolio from './Portfolio/Portfolio';
import CurrentLocks from './CurrentLocks/CurrentLocks';
import LockAquaForm from './LockAquaForm/LockAquaForm';

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

const AccountPage = () => {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [ammAquaBalance, setAmmAquaBalance] = useState(null);
    const [locks, setLocks] = useState(null);
    const [updateIndex, setUpdateIndex] = useState(0);

    const { account } = useAuthStore();
    const { accountId } = useParams<{ accountId: string }>();
    const history = useHistory();

    useEffect(() => {
        if (!StellarService.isValidPublicKey(accountId)) {
            history.push(MainRoutes.main);
            return;
        }
        if (account && accountId !== account.accountId()) {
            setCurrentAccount(null);
            history.replace(`/${account.accountId()}`);
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
    }, [accountId, updateIndex]);

    useEffect(() => {
        if (!accountId) {
            return;
        }
        StellarService.getAccountLocks(accountId).then((res) => {
            setLocks(res);
        });
    }, [accountId, updateIndex]);

    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        currentAccount.getAmmAquaBalance().then((res) => {
            setAmmAquaBalance(res);
        });
    }, [currentAccount]);

    const updateAccount = () => {
        setUpdateIndex((prevState) => prevState + 1);
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
                    <AccountInfoBlock account={currentAccount} />
                    <Portfolio
                        ammAquaBalance={ammAquaBalance}
                        currentAccount={currentAccount}
                        locks={locks}
                    />

                    {Boolean(locks?.length) && (
                        <CurrentLocks locks={locks} aquaBalance={currentAccount.getAquaBalance()} />
                    )}
                </LeftColumn>

                <RightColumn>
                    <LockAquaForm account={currentAccount} updateAccount={updateAccount} />
                </RightColumn>
            </Container>
        </MainBlock>
    );
};

export default AccountPage;
