import * as React from 'react';
import { Suspense } from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import Provider from '../store';
import { MainRoutes } from '../routes';
import Header, { HeaderNavLink } from '../../common/components/Header/Header';
import Footer from '../../common/components/Footer/Footer';
import NotFoundPage from '../../common/components/NotFoundPage/NotFoundPage';
import AppGlobalStyle from '../../common/components/AppGlobalStyles';
import ModalContainer from '../../common/modals/atoms/ModalContainer';
import useGlobalSubscriptions from '../../common/hooks/useGlobalSubscriptions';
import ToastContainer from '../../common/toasts/ToastContainer';
import PageLoader from '../../common/basics/PageLoader';
import useAuthStore from '../../common/store/authStore/useAuthStore';
import MainPage from './MainPage/MainPage';
import FAQ from './FAQ/FAQ';
import AccountPage from './AccountPage/AccountPage';

const App = () => {
    useGlobalSubscriptions();

    const { account } = useAuthStore();

    return (
        <Router>
            <Header>
                <>
                    <a href="https://vote.aqua.network/" title="Voting">
                        Voting
                    </a>
                    <a href="https://aqua.network/rewards" title="Rewards">
                        Rewards
                    </a>
                    <a href="https://vote.aqua.network/bribes/" title="Bribes">
                        Bribes
                    </a>
                    <HeaderNavLink
                        to={MainRoutes.main}
                        activeStyle={{
                            fontWeight: 700,
                        }}
                        title="Locker"
                    >
                        Locker
                    </HeaderNavLink>
                    <a href="https://gov.aqua.network/" title="Governance">
                        Governance
                    </a>
                    <a href="https://aqua.network/airdrop2" title="Airdrop">
                        Airdrop
                    </a>
                </>
            </Header>
            <Suspense fallback={<PageLoader />}>
                <Switch>
                    <Route
                        exact
                        path={MainRoutes.main}
                        render={({ location }) =>
                            account ? (
                                <Redirect
                                    to={{
                                        pathname: `${MainRoutes.main}${account.accountId()}`,
                                        state: { from: location },
                                    }}
                                />
                            ) : (
                                <MainPage />
                            )
                        }
                    />

                    <Route path={`${MainRoutes.main}:accountId`}>
                        <AccountPage />
                    </Route>
                    <Route component={NotFoundPage} />
                </Switch>
            </Suspense>
            <FAQ />
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
