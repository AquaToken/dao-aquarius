import * as React from 'react';
import { useRef, useState } from 'react';
import styled from 'styled-components';

import useOnClickOutside from 'hooks/useOutsideClick';

import { ModalService } from 'services/globalServices';

import { PoolClassicProcessed, PoolUserProcessed } from 'types/amm';

import { cardBoxShadow } from 'web/mixins';
import MigrateLiquidityStep1 from 'web/modals/migrate-liquidity/MigrateLiquidityStep1';
import { COLORS } from 'web/styles';

import IconDeposit from 'assets/icon-deposit.svg';
import IconThreeDots from 'assets/icon-three-dots.svg';
import IconWithdraw from 'assets/icon-withdraw.svg';

import Button from 'basics/buttons/Button';

import DepositToPool from 'pages/amm/components/DepositToPool/DepositToPool';
import WithdrawFromPool from 'pages/amm/components/WithdrawFromPool/WithdrawFromPool';

const Container = styled.div`
    position: relative;
`;

const Menu = styled.div`
    display: flex;
    flex-direction: column;
    position: absolute;
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    border-radius: 0.5rem;
    right: 0;
    top: 100%;
    padding: 2.4rem 0.8rem;
    z-index: 100;
`;

const MenuRow = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 3.6rem;
    padding: 0 1.6rem;

    &:hover {
        background-color: ${COLORS.lightGray};
    }

    svg {
        margin-right: 0.8rem;
    }
`;

interface Props {
    pool: PoolUserProcessed | PoolClassicProcessed;
}

const ExpandedMenu = ({ pool }: Props) => {
    const [isShowMenu, setIsShowMenu] = useState(false);

    const menuRef = useRef();

    useOnClickOutside(menuRef, () => setIsShowMenu(null));

    return (
        <Container ref={menuRef}>
            <Button isSquare secondary onClick={() => setIsShowMenu(prev => !prev)}>
                <IconThreeDots />
            </Button>
            {isShowMenu && (
                <Menu>
                    {Boolean((pool as PoolUserProcessed).address) && (
                        <MenuRow
                            onClick={() => {
                                ModalService.openModal(DepositToPool, { pool });
                                setIsShowMenu(false);
                            }}
                        >
                            <IconDeposit />
                            Deposit
                        </MenuRow>
                    )}
                    <MenuRow
                        onClick={() => {
                            if ((pool as PoolUserProcessed).address) {
                                ModalService.openModal(WithdrawFromPool, {
                                    pool,
                                });
                                return;
                            }
                            ModalService.openModal(MigrateLiquidityStep1, {
                                pool,
                                base: pool.tokens[0],
                                counter: pool.tokens[1],
                            });
                        }}
                    >
                        <IconWithdraw />
                        Withdraw
                    </MenuRow>
                </Menu>
            )}
        </Container>
    );
};

export default ExpandedMenu;
