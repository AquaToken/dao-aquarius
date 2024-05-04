import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { respondDown } from '../../../../common/mixins';
import Button from '../../../../common/basics/Button';
import { ModalService } from '../../../../common/services/globalServices';
import DepositToPool from '../DepositToPool/DepositToPool';
import WithdrawFromPool from '../WithdrawFromPool/WithdrawFromPool';

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
    const openDepositModal = () => {
        ModalService.openModal(DepositToPool, { pool });
    };
    const openWithdrawModal = () => {
        ModalService.openModal(WithdrawFromPool, { pool });
    };
    return (
        <Container>
            <Button isBig fullWidth onClick={() => openDepositModal()}>
                Deposit
            </Button>
            <Button isBig fullWidth onClick={() => openWithdrawModal()}>
                Withdraw
            </Button>
        </Container>
    );
};

export default Sidebar;
