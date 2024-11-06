import * as React from 'react';
import { lazy, Suspense, useEffect, useState } from 'react';
import Title from 'react-document-title';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';

import { LoginTypes } from 'store/authStore/types';

import { ModalService, StellarService, WalletConnectService } from 'services/globalServices';
import AppGlobalStyle from 'web/AppGlobalStyles';
import { respondDown } from 'web/mixins';
import LiveOnSorobanAlert, {
    LIVE_ON_SOROBAN_SHOWED_ALIAS,
} from 'web/modals/alerts/LiveOnSorobanAlert';
import { Breakpoints, COLORS } from 'web/styles';

import LiveOnSorobanImage from 'assets/live-on-soroban.svg';

import PageLoader from 'basics/loaders/PageLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import ErrorBoundary from 'components/ErrorBoundary';
import Footer from 'components/Footer';
import Header, { HeaderNavLink, NavLinksDivider } from 'components/Header';
import ModalContainer from 'components/ModalContainer';
import NotFoundPage from 'components/NotFoundPage';
import ToastContainer from 'components/ToastContainer';

import Governance from 'pages/governance/Governance';

import useGlobalSubscriptions from './hooks/useGlobalSubscriptions';
import { AmmRoutes, MainRoutes } from './routes';
import SentryService from './services/sentry.service';
import Provider from './store';
import useAssetsStore from './store/assetsStore/useAssetsStore';
import useAuthStore from './store/authStore/useAuthStore';

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

const UPDATE_ASSETS_DATE = 'update assets timestamp';
const UPDATE_PERIOD = 24 * 60 * 60 * 1000;

const BgStyled = styled(LiveOnSorobanImage)`
    object-position: center center;
`;

const TooltipStyled = styled(Tooltip)`
    margin-right: 2rem;
    a {
        margin: 0 !important;
    }

    ${respondDown(Breakpoints.md)`
        margin-right: 0;
        margin-bottom: 2.4rem;
    `}
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
        if (!wcLoginChecked) {
            return;
        }
        const isShowed = localStorage.getItem(LIVE_ON_SOROBAN_SHOWED_ALIAS) || false;
        if (!isShowed) {
            ModalService.openModal(LiveOnSorobanAlert, {}, false, <BgStyled />);
        }
    }, [wcLoginChecked]);

    if (!isAssetsUpdated || !wcLoginChecked) {
        return <PageLoader />;
    }

    return (
        <Router>
            <ErrorBoundary>
                {isLogged && Boolean(redirectURL) && <Redirect to={redirectURL} />}
                <Header>
                    <>
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

                        <NavLinksDivider />

                        <TooltipStyled
                            position={TOOLTIP_POSITION.bottom}
                            content="Soon"
                            showOnHover
                        >
                            <HeaderNavLink
                                activeStyle={{
                                    fontWeight: 700,
                                }}
                                title="Buy AQUA"
                                onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                }}
                                to=""
                                $disabled
                            >
                                Buy AQUA
                            </HeaderNavLink>
                        </TooltipStyled>

                        <HeaderNavLink
                            to={MainRoutes.locker}
                            activeStyle={{
                                fontWeight: 700,
                            }}
                            title="Lock AQUA"
                        >
                            Lock AQUA
                        </HeaderNavLink>
                    </>
                </Header>
                <Suspense fallback={<PageLoader />}>
                    <Switch>
                        <Route exact path={MainRoutes.main}>
                            <Title title="Staging: Aquarius">
                                <MainPage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.locker}>
                            <Title title="Staging: Locker">
                                <LockerPage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.governance}>
                            <Title title="Staging: Governance">
                                <Governance />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.vote}>
                            <Title title="Staging: Voting">
                                <VotePage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.bribes}>
                            <Title title="Staging: Bribes">
                                <BribesPage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.market}>
                            <MarketPage />
                        </Route>
                        <Route path={MainRoutes.rewards}>
                            <Title title="Staging: Rewards">
                                <RewardsPage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.airdrop}>
                            <Title title="Staging: Airdrop">
                                <AirdropPage />
                            </Title>
                        </Route>
                        <Route path={MainRoutes.airdrop2}>
                            <Title title="Staging: Airdrop #2">
                                <Airdrop2Page />
                            </Title>
                        </Route>

                        <Route path={MainRoutes.account}>
                            <Title title="Staging: My Aquarius">
                                {isLogged ? <ProfilePage /> : <Redirect to={MainRoutes.main} />}
                            </Title>
                        </Route>

                        <Route path={MainRoutes.walletConnect}>
                            <Title title="Staging: WalletConnect">
                                <WalletConnectPage />
                            </Title>
                        </Route>

                        <Route path={MainRoutes.amm}>
                            <Title title="Staging: Pools">
                                <AmmPage />
                            </Title>
                        </Route>

                        <Route path={MainRoutes.swap}>
                            <Title title="Staging: Swap">
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

const ProvidedApp = () => (
    <Provider>
        <AppGlobalStyle />
        <BodyStyle />
        <App />
    </Provider>
);

export default ProvidedApp;
