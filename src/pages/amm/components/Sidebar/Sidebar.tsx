import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { respondDown } from '../../../../common/mixins';
import Button from '../../../../common/basics/Button';
import { ModalService, SorobanService } from '../../../../common/services/globalServices';
import DepositToPool from '../DepositToPool/DepositToPool';
import WithdrawFromPool from '../WithdrawFromPool/WithdrawFromPool';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import ChooseLoginMethodModal from '../../../../common/modals/ChooseLoginMethodModal';
import { useEffect, useState } from 'react';
import PageLoader from '../../../../common/basics/PageLoader';
import { formatBalance } from '../../../../common/helpers/helpers';

const Container = styled.aside`
    float: right;
    position: sticky;
    right: 10%;
    top: 2rem;
    padding: 4.5rem 5rem;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    background: ${COLORS.white};
    display: flex;
    flex-direction: column;
    gap: 5rem;
    margin-top: -18rem;
    z-index: 102;

    ${respondDown(Breakpoints.lg)`
         float: unset;
         position: relative;
         width: calc(100% - 3.2rem);
         margin-top: 0;
         right: unset;
         margin: 1.6rem;
         box-shadow: unset;
    `}
`;

const Sidebar = ({ pool }) => {
    const { isLogged, account } = useAuthStore();
    const [accountShare, setAccountShare] = useState(null);

    useEffect(() => {
        if (!account) {
            setAccountShare(null);
            return;
        }
        SorobanService.getTokenBalance(pool.share_token_address, account.accountId()).then(
            (res) => {
                setAccountShare(res);
            },
        );
    }, [account]);
    const openDepositModal = () => {
        if (!isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {
                callback: () => ModalService.openModal(DepositToPool, { pool }),
            });
        }
        ModalService.openModal(DepositToPool, { pool });
    };
    const openWithdrawModal = () => {
        if (!isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {});
        }
        ModalService.openModal(WithdrawFromPool, { pool, accountShare });
    };
    return (
        <Container>
            {isLogged && accountShare === null ? (
                <PageLoader />
            ) : (
                <>
                    {isLogged && <h3>You have {formatBalance(accountShare)} shares</h3>}
                    <Button isBig fullWidth onClick={() => openDepositModal()}>
                        Deposit
                    </Button>
                    <Button
                        isBig
                        fullWidth
                        onClick={() => openWithdrawModal()}
                        disabled={accountShare === 0}
                    >
                        Withdraw
                    </Button>
                </>
            )}
        </Container>
    );
};

export default Sidebar;
