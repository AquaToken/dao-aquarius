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

const MainPage = lazy(() => import('./MainPage/MainPage'));
const VoteProposalPage = lazy(() => import('./VoteProposalPage/VoteProposalPage'));

const App = () => {
    useGlobalSubscriptions();

    return (
        <Router>
            <div id="scrollable">
                <Header>
                    <HeaderNavLink to={MainRoutes.main}>Proposals</HeaderNavLink>
                </Header>
                <Suspense fallback={<div>Loading</div>}>
                    <Switch>
                        <Route exact path={MainRoutes.main}>
                            <MainPage />
                        </Route>
                        <Route path={MainRoutes.proposal}>
                            <VoteProposalPage />
                        </Route>
                    </Switch>
                </Suspense>
                <Footer />
            </div>

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
