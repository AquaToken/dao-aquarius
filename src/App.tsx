import * as React from 'react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import useGlobalSubscriptions from './common/hooks/useGlobalSubscriptions';
import useAssetsStore from './store/assetsStore/useAssetsStore';
import useAuthStore from './store/authStore/useAuthStore';
import {
    ModalService,
    StellarService,
    WalletConnectService,
} from './common/services/globalServices';
import Header, {
    HeaderNavLink,
    HeaderNewNavLinks,
    NavLinksDivider,
} from './common/components/Header/Header';
import { AmmRoutes, MainRoutes } from './routes';
import PageLoader from './common/basics/PageLoader';
import NotFoundPage from './common/components/NotFoundPage/NotFoundPage';
import { Breakpoints, COLORS } from './common/styles';
import ToastContainer from './common/toasts/ToastContainer';
import { respondDown } from './common/mixins';
import Provider from './store';
import ModalContainer from './common/modals/atoms/ModalContainer';
import Footer from './common/components/Footer/Footer';
import styled, { createGlobalStyle } from 'styled-components';
import AppGlobalStyle from './common/components/AppGlobalStyles';
import Governance from './pages/governance/Governance';
import Title from 'react-document-title';
import LiveOnSorobanAlert, {
    LIVE_ON_SOROBAN_SHOWED_ALIAS,
} from './common/modals/LiveOnSorobanAlert';
import LiveOnSorobanImage from './common/assets/img/live-on-soroban.svg';
import ErrorBoundary from './common/components/ErrorBoundary/ErrorBoundary';
import SentryService from './common/services/sentry.service';

const MainPage = lazy(() => import('./pages/main/MainPage'));
const LockerPage = lazy(() => import('./pages/locker/Locker'));
const VotePage = lazy(() => import('./pages/vote/Vote'));
const BribesPage = lazy(() => import('./pages/bribes/Bribes'));
const MarketPage = lazy(() => import('./pages/market/Market'));
const RewardsPage = lazy(() => import('./pages/rewards/Rewards'));
const AirdropPage = lazy(() => import('./pages/airdrop/Airdrop'));
const Airdrop2Page = lazy(() => import('./pages/airdrop2/Airdrop2'));
const ProfilePage = lazy(() => import('./pages/profile/Profile'));
const WalletConnectPage = lazy(() => import('./pages/wallet-connect/WalletConnect'));
const AmmPage = lazy(() => import('./pages/amm/Amm'));
const SwapPage = lazy(() => import('./pages/swap/Swap'));

const UPDATE_ASSETS_DATE = 'update assets timestamp';
const UPDATE_PERIOD = 24 * 60 * 60 * 1000;

const BgStyled = styled(LiveOnSorobanImage)`
    object-position: center center;
`;

const App = () => {
    const [wcLoginChecked, setWcLoginChecked] = useState(false);
    useGlobalSubscriptions();

    const { getAssets, assets, processNewAssets, assetsInfo, clearAssets } = useAssetsStore();
    const [isAssetsUpdated, setIsAssetsUpdated] = useState(false);

    const { isLogged, account, redirectURL, disableRedirect, callback, removeAuthCallback } =
        useAuthStore();

    useEffect(() => {
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

    useEffect(() => {
        window.addEventListener('online', reloadIfNotLoaded);

        return () => window.removeEventListener('online', reloadIfNotLoaded);
    }, [wcLoginChecked, isAssetsUpdated]);

    const reloadIfNotLoaded = () => {
        if (!wcLoginChecked || !isAssetsUpdated) {
            window.location.reload();
        }
    };

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

    useEffect(() => {
        const isShowed = localStorage.getItem(LIVE_ON_SOROBAN_SHOWED_ALIAS) || false;
        if (!isShowed) {
            ModalService.openModal(LiveOnSorobanAlert, {}, false, <BgStyled />);
        }
    }, []);

    if (!isAssetsUpdated || !wcLoginChecked) {
        return <PageLoader />;
    }

    return (
        <Router>
            <ErrorBoundary>
                {isLogged && Boolean(redirectURL) && <Redirect to={redirectURL} />}
                <Header>
                    <>
                        <HeaderNewNavLinks>
                            <HeaderNavLink
                                to={AmmRoutes.analytics}
                                activeStyle={{
                                    fontWeight: 700,
                                }}
                                title="Pools"
                            >
                                Pools
                            </HeaderNavLink>
                            <HeaderNavLink
                                to={MainRoutes.swap}
                                activeStyle={{
                                    fontWeight: 700,
                                }}
                                title="Swap"
                            >
                                Swap
                            </HeaderNavLink>
                        </HeaderNewNavLinks>

                        <NavLinksDivider />
                        <HeaderNavLink
                            to={MainRoutes.vote}
                            exact
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="Voting"
                        >
                            Voting
                        </HeaderNavLink>
                        <HeaderNavLink
                            to={MainRoutes.rewards}
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="Rewards"
                        >
                            Rewards
                        </HeaderNavLink>
                        <HeaderNavLink
                            to={MainRoutes.bribes}
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="Bribes"
                        >
                            Bribes
                        </HeaderNavLink>
                        <HeaderNavLink
                            to={MainRoutes.locker}
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="Locker"
                        >
                            Locker
                        </HeaderNavLink>
                        <HeaderNavLink
                            to={MainRoutes.governance}
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="Governance"
                        >
                            Governance
                        </HeaderNavLink>
                    </>
                </Header>
                <Suspense fallback={<PageLoader />}>
                    <Switch>
                        <Route exact path={MainRoutes.main}>
                            <Title title="Aquarius">
                                <MainPage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.locker}>
                            <Title title="Locker">
                                <LockerPage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.governance}>
                            <Title title="Governance">
                                <Governance />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.vote}>
                            <Title title="Voting">
                                <VotePage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.bribes}>
                            <Title title="Bribes">
                                <BribesPage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.market}>
                            <MarketPage />
                        </Route>
                        <Route path={MainRoutes.rewards}>
                            <Title title="Rewards">
                                <RewardsPage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.airdrop}>
                            <Title title="Airdrop">
                                <AirdropPage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.airdrop2}>
                            <Title title="Airdrop #2">
                                <Airdrop2Page />
                            </Title>
                        </Route>

                        <Route path={MainRoutes.account}>
                            <Title title="My Aquarius">
                                {isLogged ? <ProfilePage /> : <Redirect to={MainRoutes.main} />}
                            </Title>
                        </Route>

                        <Route path={MainRoutes.walletConnect}>
                            <Title title="WalletConnect">
                                <WalletConnectPage />
                            </Title>
                        </Route>

                        <Route path={MainRoutes.amm}>
                            <Title title="Pools">
                                <AmmPage />
                            </Title>
                        </Route>

                        <Route path={MainRoutes.swap}>
                            <Title title="Swap">
                                <SwapPage />
                            </Title>
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

const ProvidedApp = () => {
    return (
        <Provider>
            <AppGlobalStyle />
            <BodyStyle />
            <App />
        </Provider>
    );
};

declare let module: Record<string, unknown>;

export default hot(module)(ProvidedApp);
