import { MoonPayProvider } from '@moonpay/moonpay-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

import { LS_IS_QUEST_PROMO_VIEWED } from 'constants/local-storage';
import { MainRoutes } from 'constants/routes';

import { getEnv, getIsTestnetEnv, setProductionEnv } from 'helpers/env';
import { getMoonpayKeyByEnv } from 'helpers/moonpay';

import { LoginTypes } from 'store/authStore/types';

import { ModalService, StellarService, WalletConnectService } from 'services/globalServices';

import AppGlobalStyle from 'web/AppGlobalStyles';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import PageLoader from 'basics/loaders/PageLoader';
import PageTitle from 'basics/PageTitle';

import ErrorBoundary from 'components/ErrorBoundary';
import Footer from 'components/Footer';
import Header from 'components/Header/Header';
import ModalContainer from 'components/ModalContainer';
import NotFoundPage from 'components/NotFoundPage';
import TestnetBanner from 'components/TestnetBanner';
import ToastContainer from 'components/ToastContainer';

import Governance from 'pages/governance/Governance';

import useGlobalSubscriptions from './hooks/useGlobalSubscriptions';
import SentryService from './services/sentry.service';
import Provider from './store';
import useAssetsStore from './store/assetsStore/useAssetsStore';
import useAuthStore from './store/authStore/useAuthStore';
import QuestPromoModal from './web/modals/alerts/QuestPromoModal';

const MainPage = lazy(() => import('pages/main/MainPage'));
const LockerPage = lazy(() => import('pages/locker/Locker'));
const VotePage = lazy(() => import('pages/vote/Vote'));
const BribesPage = lazy(() => import('pages/bribes/Bribes'));
const MarketPage = lazy(() => import('pages/market/Market'));
const RewardsPage = lazy(() => import('pages/rewards/Rewards'));
const AirdropPage = lazy(() => import('pages/airdrop/Airdrop'));
const Airdrop2Page = lazy(() => import('pages/airdrop2/Airdrop2'));
const ProfilePage = lazy(() => import('pages/profile/Profile'));
const WalletConnectPage = lazy(() => import('pages/wallet-connect/WalletConnect'));
const AmmPage = lazy(() => import('pages/amm/Amm'));
const SwapPage = lazy(() => import('pages/swap/Swap'));
const BuyAquaPage = lazy(() => import('web/pages/buy-aqua/BuyAqua'));
const TestnetSwitcherPage = lazy(() => import('web/pages/testnet-switcher/TestnetSwitcher'));
const TermsPage = lazy(() => import('pages/terms/Terms'));
const PrivacyPage = lazy(() => import('pages/privacy/Privacy'));
const TokenPage = lazy(() => import('pages/token/TokenPage'));
const QuestPage = lazy(() => import('pages/quest/Quest'));

const UPDATE_ASSETS_DATE = 'update assets timestamp';
const UPDATE_PERIOD = 24 * 60 * 60 * 1000;

const App = () => {
    const [wcLoginChecked, setWcLoginChecked] = useState(false);

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
        WalletConnectService.onAppStart(window.location.pathname === MainRoutes.walletConnect).then(
            () => {
                setWcLoginChecked(true);
            },
        );
    }, []);

    const reloadIfNotLoaded = () => {
        if (!wcLoginChecked || !isAssetsUpdated) {
            window.location.reload();
        }
    };

    useEffect(() => {
        window.addEventListener('online', reloadIfNotLoaded);

        return () => window.removeEventListener('online', reloadIfNotLoaded);
    }, [wcLoginChecked, isAssetsUpdated]);

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
            StellarService.startEffectsStream(account.accountId());
        } else {
            StellarService.stopEffectsStream();
        }
    }, [isLogged]);

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
        const isQuestPromoViewed = !!localStorage.getItem(LS_IS_QUEST_PROMO_VIEWED);
        if (!isQuestPromoViewed) {
            ModalService.openModal(QuestPromoModal, {});
        }
    }, []);

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

    if (!isAssetsUpdated || !wcLoginChecked) {
        return <PageLoader />;
    }

    return (
        <Router>
            <ErrorBoundary>
                {isLogged && Boolean(redirectURL) && <Redirect to={redirectURL} />}
                <TestnetBanner />
                <Header />
                <Suspense fallback={<PageLoader />}>
                    <Switch>
                        <Route exact path={MainRoutes.main}>
                            <PageTitle title="Aquarius">
                                <MainPage />
                            </PageTitle>
                        </Route>
                        <Route path={MainRoutes.locker}>
                            <PageTitle title="Locker">
                                <LockerPage />
                            </PageTitle>
                        </Route>
                        <Route path={MainRoutes.governance}>
                            <PageTitle title="Governance">
                                <Governance />
                            </PageTitle>
                        </Route>
                        <Route path={MainRoutes.vote}>
                            <PageTitle title="Voting">
                                <VotePage />
                            </PageTitle>
                        </Route>
                        <Route path={MainRoutes.bribes}>
                            <PageTitle title="Bribes">
                                <BribesPage />
                            </PageTitle>
                        </Route>
                        <Route path={MainRoutes.market}>
                            <MarketPage />
                        </Route>
                        <Route path={MainRoutes.rewards}>
                            <PageTitle title="Rewards">
                                <RewardsPage />
                            </PageTitle>
                        </Route>
                        <Route path={MainRoutes.airdrop}>
                            <PageTitle title="Airdrop">
                                <AirdropPage />
                            </PageTitle>
                        </Route>
                        <Route path={MainRoutes.airdrop2}>
                            <PageTitle title="Airdrop #2">
                                <Airdrop2Page />
                            </PageTitle>
                        </Route>

                        <Route path={MainRoutes.account}>
                            <PageTitle title="My Aquarius">
                                {isLogged ? <ProfilePage /> : <Redirect to={MainRoutes.main} />}
                            </PageTitle>
                        </Route>

                        <Route path={MainRoutes.walletConnect}>
                            <PageTitle title="WalletConnect">
                                <WalletConnectPage />
                            </PageTitle>
                        </Route>

                        <Route path={MainRoutes.amm}>
                            <PageTitle title="Pools">
                                <AmmPage />
                            </PageTitle>
                        </Route>

                        <Route path={MainRoutes.swap}>
                            <PageTitle title="Swap">
                                <SwapPage />
                            </PageTitle>
                        </Route>

                        <Route path={MainRoutes.buyAqua}>
                            <PageTitle title="Buy Aqua">
                                <BuyAquaPage />
                            </PageTitle>
                        </Route>

                        <Route path={MainRoutes.testnet}>
                            <PageTitle title="Testnet">
                                <TestnetSwitcherPage />
                            </PageTitle>
                        </Route>

                        <Route path={MainRoutes.terms}>
                            <PageTitle title="Terms of Use">
                                <TermsPage />
                            </PageTitle>
                        </Route>

                        <Route path={MainRoutes.privacy}>
                            <PageTitle title="Privacy Policy">
                                <PrivacyPage />
                            </PageTitle>
                        </Route>

                        <Route path={MainRoutes.token}>
                            <PageTitle title="AQUA token">
                                <TokenPage />
                            </PageTitle>
                        </Route>

                        <Route path={MainRoutes.quest}>
                            <PageTitle title="Onboard to Aquarius">
                                <QuestPage />
                            </PageTitle>
                        </Route>

                        <Route component={NotFoundPage} />
                    </Switch>
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
            background-color: ${COLORS.lightGray};
        } 
    `};
`;

const ProvidedApp = () => (
    <MoonPayProvider apiKey={getMoonpayKeyByEnv()} debug={getIsTestnetEnv()}>
        <Provider>
            <AppGlobalStyle />
            <BodyStyle />
            <App />
        </Provider>
    </MoonPayProvider>
);
export default ProvidedApp;
