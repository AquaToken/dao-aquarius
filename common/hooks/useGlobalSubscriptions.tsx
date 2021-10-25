import useAuthStore from '../store/authStore/useAuthStore';
import { useEffect, useRef } from 'react';
import { WalletConnectEvents } from '../services/wallet-connect.service';
import { LoginTypes } from '../store/authStore/types';
import { Horizon } from 'stellar-sdk';
import { StellarService, ToastService, WalletConnectService } from '../services/globalServices';

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
        } else {
            StellarService.closeAccountStream();
        }
    }, [isLogged]);

    useEffect(() => {
        accountRef.current = account;
    }, [account]);

    useEffect(() => {
        const unsub = StellarService.event.sub((newAccount) => {
            if (
                StellarService.balancesHasChanges(
                    accountRef.current.balances as Horizon.BalanceLineAsset[],
                    newAccount.balances,
                )
            ) {
                updateAccount(newAccount);
            }
        });

        return () => unsub();
    }, []);
}
