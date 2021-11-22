import useAuthStore from '../store/authStore/useAuthStore';
import { useEffect, useRef } from 'react';
import { WalletConnectEvents } from '../services/wallet-connect.service';
import { LoginTypes } from '../store/authStore/types';
import { Horizon } from 'stellar-sdk';
import { StellarService, ToastService, WalletConnectService } from '../services/globalServices';
import { StellarEvents } from '../services/stellar.service';

const UnfundedError = 'Not Found';

export default function useGlobalSubscriptions(): void {
    const {
        login,
        logout,
        resolveFederation,
        account,
        isLogged,
        updateAccount,
        loginErrorText,
        clearLoginError,
    } = useAuthStore();

    const accountRef = useRef(account);

    useEffect(() => {
        const unsub = WalletConnectService.event.sub((event) => {
            if (event.type === WalletConnectEvents.login) {
                login(event.publicKey, LoginTypes.walletConnect, event.metadata);
            }
            if (event.type === WalletConnectEvents.logout) {
                logout();
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if (loginErrorText) {
            ToastService.showErrorToast(
                loginErrorText === UnfundedError ? 'Activate your account' : loginErrorText,
            );
            clearLoginError();
        }
    }, [loginErrorText]);

    useEffect(() => {
        if (isLogged) {
            if (account.home_domain) {
                resolveFederation(account.home_domain, account.accountId());
            }
            StellarService.startAccountStream(account.accountId());
            ToastService.showSuccessToast('Logged in');
        } else {
            StellarService.logoutWithSecret();
            StellarService.closeAccountStream();
        }
    }, [isLogged]);

    useEffect(() => {
        accountRef.current = account;
    }, [account]);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type, account: newAccount }) => {
            if (
                type === StellarEvents.accountStream &&
                StellarService.balancesHasChanges(
                    accountRef.current.balances as Horizon.BalanceLineAsset[],
                    newAccount.balances,
                )
            ) {
                updateAccount(newAccount, accountRef.current.authType);
            }

            if (type === StellarEvents.handleAccountUpdate) {
                updateAccount(newAccount, accountRef.current.authType);
            }
        });

        return () => unsub();
    }, []);
}
