import * as React from 'react';
import { lazy, Suspense } from 'react';
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
import reactQuillCSS from 'react-quill/dist/quill.snow.css';

export const ReactQuillCSS = reactQuillCSS;

const MainPage = lazy(() => import('./MainPage/MainPage'));
const VoteProposalPage = lazy(() => import('./VoteProposalPage/VoteProposalPage'));
const ProposalCreationPage = lazy(() => import('./ProposalCreationPage/ProposalCreationPage'));

const App = () => {
    useGlobalSubscriptions();

    const { isLogged } = useAuthStore();

    return (
        <Router>
            <Header />
            <Suspense fallback={<PageLoader />}>
                <Switch>
                    <Route exact path={MainRoutes.main}>
                        <MainPage />
                    </Route>
                    <Route path={`${MainRoutes.proposal}/:id`}>
                        <VoteProposalPage />
                    </Route>
                    <Route
                        path={MainRoutes.create}
                        render={({ location }) =>
                            isLogged ? (
                                <ProposalCreationPage />
                            ) : (
                                <Redirect
                                    to={{
                                        pathname: MainRoutes.main,
                                        state: { from: location },
                                    }}
                                />
                            )
                        }
                    />
                    <Route component={NotFoundPage} />
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
