import { Horizon } from '@stellar/stellar-sdk';
import { useEffect, useRef } from 'react';

import { LS_FREIGHTER_ACCOUNT_CHANGE_IMMEDIATELY } from 'constants/local-storage';

import PromisedTimeout from 'helpers/promised-timeout';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { AssetsEvent } from 'services/assets.service';
import {
    LedgerService,
    SorobanService,
    LobstrExtensionService,
    StellarService,
    ToastService,
    WalletConnectService,
    AssetsService,
    ModalService,
    WalletKitService,
} from 'services/globalServices';
import { LedgerEvents } from 'services/ledger.service';
import { LobstrExtensionEvents } from 'services/lobstr-extension.service';
import { StellarEvents } from 'services/stellar.service';
import { WalletKitEvents } from 'services/wallet-kit.service';

import { WalletConnectEvents } from 'types/wallet-connect';

import { useSkipFirstRender } from './useSkipFirstRender';

import FreighterAccountChangedModal from '../web/modals/FreighterAccountChangedModal';

const UnfundedErrors = ['Request failed with status code 404', 'Not Found'];

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
        enableRedirect,
    } = useAuthStore();

    const { processNewAssets } = useAssetsStore();

    const accountRef = useRef(account);

    useEffect(() => {
        const unsub = WalletConnectService.event.sub(event => {
            if (event.type === WalletConnectEvents.login) {
                login(event.publicKey, LoginTypes.walletConnect, event.metadata, event.topic);
            }
            if (event.type === WalletConnectEvents.logout) {
                ModalService.closeAllModals();
                PromisedTimeout(500).then(() => {
                    logout();
                });
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = LedgerService.event.sub(event => {
            if (event.type === LedgerEvents.login) {
                login(event.publicKey, LoginTypes.ledger);
            }
            if (event.type === LedgerEvents.logout) {
                logout();
            }
        });

        return () => unsub();
    }, []);

    const changeFreighterAccount = async (publicKey: string): Promise<void> => {
        ModalService.closeAllModals();
        await PromisedTimeout(500);
        const path = `${location.pathname}${location.search}`;
        logout();

        await PromisedTimeout(500);

        enableRedirect(path);
        login(publicKey, LoginTypes.walletKit);
        WalletKitService.startFreighterWatching(publicKey);
    };

    useEffect(() => {
        const unsub = WalletKitService.event.sub(event => {
            if (event.type === WalletKitEvents.login) {
                login(event.publicKey, LoginTypes.walletKit);
            }

            if (event.type === WalletKitEvents.accountChanged) {
                const defaultChoice = JSON.parse(
                    localStorage.getItem(LS_FREIGHTER_ACCOUNT_CHANGE_IMMEDIATELY),
                );

                if (defaultChoice === null) {
                    ModalService.closeAllModals();
                    ModalService.openModal(FreighterAccountChangedModal, {
                        publicKey: event.publicKey,
                    });
                    return;
                }

                if (defaultChoice) {
                    changeFreighterAccount(event.publicKey);
                }
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = LobstrExtensionService.event.sub(event => {
            if (event.type === LobstrExtensionEvents.login) {
                login(event.publicKey, LoginTypes.lobstr);
            }
        });

        return () => unsub();
    });

    useEffect(() => {
        const unsub = AssetsService.event.sub(event => {
            if (event.type === AssetsEvent.newAssets) {
                processNewAssets(event.payload);
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if (loginErrorText) {
            ToastService.showErrorToast(
                UnfundedErrors.includes(loginErrorText) ? 'Activate your account' : loginErrorText,
            );
            clearLoginError();
        }
        if (UnfundedErrors.includes(loginErrorText)) {
            WalletConnectService.logout();
        }
    }, [loginErrorText]);

    useSkipFirstRender(() => {
        if (isLogged) {
            if (account.home_domain) {
                resolveFederation(account.home_domain, account.accountId());
            }
            StellarService.startAccountStream(account.accountId());
            ToastService.showSuccessToast('Logged in');
        } else {
            StellarService.logoutWithSecret();
            SorobanService.logoutWithSecret();
            StellarService.closeAccountStream();
            WalletKitService.stopFreighterWatching();
            ToastService.showSuccessToast('Logged out');
        }
    }, [isLogged]);

    useEffect(() => {
        if (account) {
            account.getSortedBalances().then(res => {
                processNewAssets(res.map(({ asset }) => asset));
            });
            return;
        }
    }, [account]);

    useEffect(() => {
        accountRef.current = account;
    }, [account]);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type, account: newAccount }) => {
            if (
                type === StellarEvents.accountStream &&
                StellarService.balancesHasChanges(
                    accountRef.current.balances as Horizon.HorizonApi.BalanceLineAsset[],
                    newAccount.balances as Horizon.HorizonApi.BalanceLineAsset[],
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
