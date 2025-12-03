import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

import { getAssetsList } from 'api/amm';

import { D_ICE_CODE, GD_ICE_CODE, GOV_ICE_CODE, ICE_ISSUER, UP_ICE_CODE } from 'constants/assets';
import { AppRoutes } from 'constants/routes';

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
import NotFoundPage from 'components/NotFoundPage';
import PageTitle from 'components/PageTitle';
import TestnetBanner from 'components/TestnetBanner';
import ToastContainer from 'components/ToastContainer';

import DIceTrustlineModal from 'modals/DIceTrustlineModal';

import AppGlobalStyle from 'styles/global-styles';
import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import Governance from 'pages/governance/Governance';

import useGlobalSubscriptions from './hooks/useGlobalSubscriptions';

const MainPage = lazy(() => import('web/pages/main/MainPage'));
const LockerPage = lazy(() => import('./web/pages/locker/Locker'));
const VotePage = lazy(() => import('pages/vote/Vote'));
const BribesPage = lazy(() => import('./web/pages/bribes/Bribes'));
const MarketPage = lazy(() => import('pages/market/Market'));
const RewardsPage = lazy(() => import('pages/rewards/Rewards'));
const AirdropPage = lazy(() => import('web/pages/airdrop/Airdrop'));
const Airdrop2Page = lazy(() => import('web/pages/airdrop2/Airdrop2'));
const ProfilePage = lazy(() => import('pages/profile/Profile'));
const WalletConnectPage = lazy(() => import('./web/pages/wallet-connect/WalletConnect'));
const AmmPage = lazy(() => import('pages/amm/Amm'));
const SwapPage = lazy(() => import('pages/swap/Swap'));
const BuyAquaPage = lazy(() => import('web/pages/buy-aqua/BuyAqua'));
const TestnetSwitcherPage = lazy(() => import('web/pages/testnet-switcher/TestnetSwitcher'));
const TermsPage = lazy(() => import('web/pages/terms/Terms'));
const PrivacyPage = lazy(() => import('web/pages/privacy/Privacy'));
const TokenPage = lazy(() => import('pages/token/TokenPage'));
const QuestPage = lazy(() => import('pages/quest/Quest'));
const DelegatePage = lazy(() => import('pages/delegate/Delegate'));
const IncentivesPage = lazy(() => import('pages/incentives/Incentives'));

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
                    <Routes>
                        <Route
                            path={AppRoutes.page.main}
                            element={
                                <PageTitle title="Aquarius">
                                    <MainPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.section.locker.parentRoute}
                            element={
                                <PageTitle title="Locker - Aquarius">
                                    <LockerPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.section.governance.parentRoute}
                            element={
                                <PageTitle title="Governance - Aquarius">
                                    <Governance />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.vote}
                            element={
                                <PageTitle title="Voting - Aquarius">
                                    <VotePage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.section.bribes.parentRoute}
                            element={
                                <PageTitle title="Bribes - Aquarius">
                                    <BribesPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.section.market.parentRoute}
                            element={<MarketPage />}
                        />

                        <Route
                            path={AppRoutes.page.rewards}
                            element={
                                <PageTitle title="Rewards - Aquarius">
                                    <RewardsPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.airdrop}
                            element={
                                <PageTitle title="Airdrop - Aquarius">
                                    <AirdropPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.airdrop2}
                            element={
                                <PageTitle title="Airdrop #2 - Aquarius">
                                    <Airdrop2Page />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.account}
                            element={
                                <PageTitle title="Dashboard - Aquarius">
                                    {isLogged ? (
                                        <ProfilePage />
                                    ) : (
                                        <Navigate to={AppRoutes.page.main} replace />
                                    )}
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.walletConnect}
                            element={
                                <PageTitle title="WalletConnect - Aquarius">
                                    <WalletConnectPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.section.amm.parentRoute}
                            element={
                                <PageTitle title="Pools - Aquarius">
                                    <AmmPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.section.swap.parentRoute}
                            element={
                                <PageTitle title="Swap - Aquarius">
                                    <SwapPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.buyAqua}
                            element={
                                <PageTitle title="Buy Aqua - Aquarius">
                                    <BuyAquaPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.testnet}
                            element={
                                <PageTitle title="Testnet - Aquarius">
                                    <TestnetSwitcherPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.terms}
                            element={
                                <PageTitle title="Terms Of Use - Aquarius">
                                    <TermsPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.privacy}
                            element={
                                <PageTitle title="Privacy Policy - Aquarius">
                                    <PrivacyPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.token}
                            element={
                                <PageTitle title="AQUA Token - Aquarius">
                                    <TokenPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.page.quest}
                            element={
                                <PageTitle title="Onboard To Aquarius">
                                    <QuestPage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.section.delegate.parentRoute}
                            element={
                                <PageTitle title="Delegates - Aquarius">
                                    <DelegatePage />
                                </PageTitle>
                            }
                        />

                        <Route
                            path={AppRoutes.section.incentive.parentRoute}
                            element={
                                <PageTitle title="Incentives - Aquarius">
                                    <IncentivesPage />
                                </PageTitle>
                            }
                        />

                        {/* Not Found */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
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
