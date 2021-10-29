import * as React from 'react';
import CircleButton from '../../../basics/CircleButton';
import { LoginTypes } from '../../../store/authStore/types';
import styled from 'styled-components';
import { COLORS, Z_INDEX } from '../../../styles';
import IconPlus from '../../../assets/img/icon-plus.svg';
import IconLogout from '../../../assets/img/icon-logout.svg';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { WalletConnectService } from '../../../services/globalServices';
import { formatBalance } from '../../../helpers/helpers';

const AccountMenuBlock = styled.div`
    position: absolute;
    width: 100%;
    top: 100%;
    left: 0;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    cursor: auto;
    border-radius: 0 0 0.5rem 0.5rem;
    z-index: ${Z_INDEX.accountMenu};
`;

const AccountBalanceBlock = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 2.4rem 2.4rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const AccountBalance = styled.div`
    display: flex;
    flex-direction: column;
`;

const AccountBalanceLabel = styled.span`
    color: ${COLORS.grayText};
    margin-bottom: 0.4rem;
`;

const AccountBalanceValue = styled.span`
    color: ${COLORS.titleText};
`;

const LogoutBlock = styled.div`
    display: flex;
    align-items: center;
    padding: 2.4rem 2.4rem 2.9rem;
    cursor: pointer;
`;

const Logout = styled.span`
    margin-left: 0.8rem;
    color: ${COLORS.grayText};
`;

const AccountMenu = ({ closeMenu }: { closeMenu: () => void }): JSX.Element => {
    const { logout, loginType, account } = useAuthStore();
    const aquaBalance = account.getAquaBalance();
    const aquaBalanceView = aquaBalance === null ? '—' : formatBalance(aquaBalance, true);

    return (
        <AccountMenuBlock
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <AccountBalanceBlock>
                <AccountBalance>
                    <AccountBalanceLabel>AQUA balance:</AccountBalanceLabel>
                    <AccountBalanceValue>{aquaBalanceView}</AccountBalanceValue>
                </AccountBalance>
                <CircleButton>
                    <IconPlus />
                </CircleButton>
            </AccountBalanceBlock>

            <LogoutBlock
                onClick={() => {
                    closeMenu();
                    logout();
                    if (loginType === LoginTypes.walletConnect) {
                        WalletConnectService.logout();
                    }
                }}
            >
                <IconLogout />
                <Logout>Log out</Logout>
            </LogoutBlock>
        </AccountMenuBlock>
    );
};

export default AccountMenu;
