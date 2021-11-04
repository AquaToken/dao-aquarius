import * as React from 'react';
import { lazy, Suspense, useEffect } from 'react';
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
import useProposalsStore from '../store/proposalsStore/useProposalsStore';
import PageLoader from '../../common/basics/PageLoader';
import ProposalCreationPage from './ProposalCreationPage/ProposalCreationPage';

const MainPage = lazy(() => import('./MainPage/MainPage'));
const VoteProposalPage = lazy(() => import('./VoteProposalPage/VoteProposalPage'));

const App = () => {
    useGlobalSubscriptions();

    const { proposals, getProposals } = useProposalsStore();

    useEffect(() => {
        getProposals();
    }, []);

    if (!proposals.length) {
        return null;
    }

    return (
        <Router>
            <Header>
                <HeaderNavLink to={MainRoutes.main}>Proposals</HeaderNavLink>
            </Header>
            <Suspense fallback={<PageLoader />}>
                <Switch>
                    <Route exact path={MainRoutes.main}>
                        <MainPage />
                    </Route>
                    <Route path={`${MainRoutes.proposal}/:id`} component={VoteProposalPage}>
                        {/*<VoteProposalPage />*/}
                    </Route>
                    <Route path={MainRoutes.create}>
                        <ProposalCreationPage />
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
