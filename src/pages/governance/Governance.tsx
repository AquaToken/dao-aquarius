import * as React from 'react';
import { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import NotFoundPage from '../../common/components/NotFoundPage/NotFoundPage';
import useAuthStore from '../../store/authStore/useAuthStore';
import reactQuillCSS from 'react-quill/dist/quill.snow.css';
import { GovernanceRoutes } from '../../routes';

export const ReactQuillCSS = reactQuillCSS;

const MainPage = lazy(() => import('./pages/GovernanceMainPage'));
const VoteProposalPage = lazy(() => import('./pages/GovernanceVoteProposalPage'));
const ProposalCreationPage = lazy(() => import('./pages/GovernanceProposalCreationPage'));

const Governance = () => {
    const { isLogged } = useAuthStore();

    return (
        <Switch>
            <Route exact path={GovernanceRoutes.main}>
                <MainPage />
            </Route>
            <Route path={`${GovernanceRoutes.proposal}/:id/:version`}>
                <VoteProposalPage />
            </Route>
            <Route path={`${GovernanceRoutes.proposal}/:id`}>
                <VoteProposalPage />
            </Route>

            <Route
                path={GovernanceRoutes.create}
                render={({ location }) =>
                    isLogged ? (
                        <ProposalCreationPage />
                    ) : (
                        <Redirect
                            to={{
                                pathname: GovernanceRoutes.main,
                                state: { from: location },
                            }}
                        />
                    )
                }
            />
            <Route
                path={`${GovernanceRoutes.edit}/:id`}
                render={({ location }) =>
                    isLogged ? (
                        <ProposalCreationPage isEdit />
                    ) : (
                        <Redirect
                            to={{
                                pathname: GovernanceRoutes.main,
                                state: { from: location },
                            }}
                        />
                    )
                }
            />
            <Route component={NotFoundPage} />
        </Switch>
    );
};

export default Governance;
