import * as React from 'react';
import { Suspense, useEffect } from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import Provider from '../store';
import { MainRoutes } from '../routes';
import Header from '../../common/components/Header/Header';
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
import { START_AIRDROP2_TIMESTAMP } from '../../common/services/stellar.service';
import { ModalService } from '../../common/services/globalServices';
import SnapshotPassedModal from './common/SnapshotPassedModal/SnapshotPassedModal';
import Background from '../../common/assets/img/snapshot-passed-background.svg';

const App = () => {
    useGlobalSubscriptions();

    const { account } = useAuthStore();

    useEffect(() => {
        if (Date.now() >= START_AIRDROP2_TIMESTAMP) {
            ModalService.openModal(SnapshotPassedModal, {}, true, <Background />);
        }
    }, []);

    return (
        <Router>
            <Header>
                <>
                    <a
                        href="https://aqua.network/airdrop2"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
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
