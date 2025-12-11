import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

import { getAssetsList } from 'api/amm';

import { D_ICE_CODE, GD_ICE_CODE, GOV_ICE_CODE, ICE_ISSUER, UP_ICE_CODE } from 'constants/assets';

import { getEnv, setProductionEnv } from 'helpers/env';
import { cacheTokens, createAsset } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService } from 'services/globalServices';
import SentryService from 'services/sentry.service';
import { StellarEvents } from 'services/stellar/events/events';

import Provider from 'store';

import PageLoader from 'basics/loaders/PageLoader';

import ErrorBoundary from 'components/ErrorBoundary';
import Footer from 'components/Footer';
import Header from 'components/Header/Header';
import ModalContainer from 'components/ModalContainer';
import TestnetBanner from 'components/TestnetBanner';
import ToastContainer from 'components/ToastContainer';

import DIceTrustlineModal from 'modals/DIceTrustlineModal';

import AppGlobalStyle from 'styles/global-styles';
import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import AppRouter from './AppRouter';
import useGlobalSubscriptions from './hooks/useGlobalSubscriptions';

const UPDATE_ASSETS_DATE = 'update assets timestamp';
const UPDATE_PERIOD = 24 * 60 * 60 * 1000;

const App = () => {
    useGlobalSubscriptions();

    const { getAssets, assets, processNewAssets, assetsInfo, clearAssets } = useAssetsStore();
    const [isAssetsUpdated, setIsAssetsUpdated] = useState(false);

    const { isLogged, account, redirectURL, disableRedirect, callback, removeAuthCallback } =
        useAuthStore();

    useEffect(() => {
        if (!getEnv()) {
            setProductionEnv();
        }

        const assetUpdateTimestamp = localStorage.getItem(UPDATE_ASSETS_DATE);

        if (
            !assetUpdateTimestamp ||
            Date.now() - Number(assetUpdateTimestamp) > UPDATE_PERIOD ||
            !assetsInfo.size
        ) {
            clearAssets();
            localStorage.setItem(UPDATE_ASSETS_DATE, Date.now().toString());
            setIsAssetsUpdated(true);
        } else {
            setIsAssetsUpdated(true);
        }

        getAssets();
    }, []);

    useEffect(() => {
        getAssetsList().then(res => {
            processNewAssets(res);
            cacheTokens(res);
        });
    }, []);

    const reloadIfNotLoaded = () => {
        if (!isAssetsUpdated) {
            window.location.reload();
        }
    };

    useEffect(() => {
        window.addEventListener('online', reloadIfNotLoaded);

        return () => window.removeEventListener('online', reloadIfNotLoaded);
    }, [isAssetsUpdated]);

    useEffect(() => {
        const handler = (event: BeforeUnloadEvent) => {
            if (account && account.authType === LoginTypes.secret) {
                event.preventDefault();
            }
        };

        window.addEventListener('beforeunload', handler);
        return () => {
            window.removeEventListener('beforeunload', handler);
        };
    }, [account]);

    useEffect(() => {
        if (assets.length) {
            processNewAssets(assets);
        }
    }, [assets]);

    useEffect(() => {
        if (isLogged) {
            StellarService.effectsStream.start(account.accountId());
        } else {
            StellarService.effectsStream.stop();
        }
    }, [isLogged]);

    useEffect(() => {
        if (!account) {
            return;
        }
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                const delegators = StellarService.cb.getDelegatorLocks(account.accountId());

                const neededDIceTrustline =
                    delegators.some(({ asset }) => asset === `${UP_ICE_CODE}:${ICE_ISSUER}`) &&
                    account.getAssetBalance(createAsset(D_ICE_CODE, ICE_ISSUER)) === null;

                const neededGDIceTrustline =
                    delegators.some(({ asset }) => asset === `${GOV_ICE_CODE}:${ICE_ISSUER}`) &&
                    account.getAssetBalance(createAsset(GD_ICE_CODE, ICE_ISSUER)) === null;

                if (neededDIceTrustline || neededGDIceTrustline) {
                    ModalService.openModal(DIceTrustlineModal, {
                        neededDIceTrustline,
                        neededGDIceTrustline,
                    });
                }
            }
        });

        return () => unsub();
    }, [account]);

    useEffect(() => {
        if (isLogged) {
            SentryService.setSentryContext({
                publicKey: account.accountId(),
                authType: account.authType,
            });
        } else {
            SentryService.setSentryContext({
                publicKey: null,
                authType: null,
            });
        }
    }, [isLogged]);

    useEffect(() => {
        if (isLogged && Boolean(redirectURL)) {
            disableRedirect();
        }
    }, [isLogged, redirectURL]);

    useEffect(() => {
        if (isLogged && Boolean(callback)) {
            callback();
            removeAuthCallback();
        }
    }, [isLogged, callback]);

    useEffect(() => {
        const userAgent = window.navigator.userAgent;

        // Fix iOS functionality: tap on both sides of the dynamic island, and the phone will instantly scroll up
        if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) {
            document.documentElement.style.overflowX = 'unset';
            document.body.style.overflowX = 'unset';
        }
    }, []);

    if (!isAssetsUpdated) {
        return <PageLoader />;
    }

    return (
        <Router>
            <ErrorBoundary>
                {isLogged && Boolean(redirectURL) && <Navigate to={redirectURL} replace />}
                <TestnetBanner />
                <Header />
                <Suspense fallback={<PageLoader />}>
                    <AppRouter />
                </Suspense>
                <Footer />

                <ModalContainer />
                <ToastContainer />
            </ErrorBoundary>
        </Router>
    );
};

const BodyStyle = createGlobalStyle`
    ${respondDown(Breakpoints.md)`
        body {
            background-color: ${COLORS.gray50};
        } 
    `};
`;

const ProvidedApp = () => (
    <Provider>
        <AppGlobalStyle />
        <BodyStyle />
        <App />
    </Provider>
);
export default ProvidedApp;
