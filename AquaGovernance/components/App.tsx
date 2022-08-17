import * as React from 'react';
import { lazy, Suspense, useEffect } from 'react';
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
import reactQuillCSS from 'react-quill/dist/quill.snow.css';
import { StellarService } from '../../common/services/globalServices';

export const ReactQuillCSS = reactQuillCSS;

const MainPage = lazy(() => import('./MainPage/MainPage'));
const VoteProposalPage = lazy(() => import('./VoteProposalPage/VoteProposalPage'));
const ProposalCreationPage = lazy(() => import('./ProposalCreationPage/ProposalCreationPage'));

const App = () => {
    useGlobalSubscriptions();

    const { isLogged, account } = useAuthStore();

    useEffect(() => {
        if (isLogged) {
            StellarService.startClaimableBalancesStream(account.accountId());
        } else {
            StellarService.closeClaimableBalancesStream();
        }
    }, [isLogged]);

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
                    <a href="https://locker.aqua.network/" title="Locker">
                        Locker
                    </a>
                    <HeaderNavLink
                        to={MainRoutes.main}
                        activeStyle={{
                            fontWeight: 700,
                        }}
                        title="Governance"
                    >
                        Governance
                    </HeaderNavLink>
                    <a href="https://aqua.network/airdrop2" title="Airdrop">
                        Airdrop
                    </a>
                </>
            </Header>
            <Suspense fallback={<PageLoader />}>
                <Switch>
                    <Route exact path={MainRoutes.main}>
                        <MainPage />
                    </Route>
                    <Route path={`${MainRoutes.proposal}/:id/:version`}>
                        <VoteProposalPage />
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
                    <Route
                        path={`${MainRoutes.edit}/:id`}
                        render={({ location }) =>
                            isLogged ? (
                                <ProposalCreationPage isEdit />
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
