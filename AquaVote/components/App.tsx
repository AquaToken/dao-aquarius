import * as React from 'react';
import { lazy, Suspense } from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Provider from '../store';
import { MainRoutes } from '../routes';
import Header, { HeaderNavLink } from '../../common/components/Header/Header';
import Footer from '../../common/components/Footer/Footer';
import AppGlobalStyle from '../../common/components/AppGlobalStyles';
import ModalContainer from '../../common/modals/atoms/ModalContainer';
import useGlobalSubscriptions from '../../common/hooks/useGlobalSubscriptions';
import ToastContainer from '../../common/toasts/ToastContainer';
import PageLoader from '../../common/basics/PageLoader';

const MainPage = lazy(() => import('./MainPage/MainPage'));
const AboutPage = lazy(() => import('./AboutPage/AboutPage'));

const App = () => {
    useGlobalSubscriptions();

    return (
        <Router>
            <Header>
                <>
                    <HeaderNavLink to={MainRoutes.main}>Explore</HeaderNavLink>
                    <HeaderNavLink to={MainRoutes.about}>Top 100</HeaderNavLink>
                    <HeaderNavLink to={MainRoutes.about}>About</HeaderNavLink>
                    <HeaderNavLink to={MainRoutes.about}>Airdrop</HeaderNavLink>
                </>
            </Header>
            <Suspense fallback={<PageLoader />}>
                <Switch>
                    <Route exact path={MainRoutes.main}>
                        <MainPage />
                    </Route>
                    <Route path={MainRoutes.about}>
                        <AboutPage />
                    </Route>
                </Switch>
            </Suspense>
            <Footer />

            <ModalContainer />
            <ToastContainer />
        </Router>
    );
};

const ProvidedApp = () => {
    return (
        <Provider>
            <AppGlobalStyle />
            <App />
        </Provider>
    );
};

declare let module: Record<string, unknown>;

export default hot(module)(ProvidedApp);
