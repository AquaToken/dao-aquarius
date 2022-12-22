import * as React from 'react';
import { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import useAuthStore from '../../store/authStore/useAuthStore';
import FAQ from './components/FAQ/FAQ';
import { LockerRoutes } from '../../routes';
import NotFoundPage from '../../common/components/NotFoundPage/NotFoundPage';

const LockerMainPage = lazy(() => import('./pages/LockerMainPage'));
const LockerAccountPage = lazy(() => import('./pages/LockerAccountPage'));

const Locker = () => {
    const { account } = useAuthStore();

    return (
        <Switch>
            <Route
                exact
                path={LockerRoutes.main}
                render={({ location }) =>
                    account ? (
                        <Redirect
                            to={{
                                pathname: `${LockerRoutes.main}/${account.accountId()}`,
                                state: { from: location },
                            }}
                        />
                    ) : (
                        <>
                            <LockerMainPage />
                            <FAQ />
                        </>
                    )
                }
            />

            <Route exact path={`${LockerRoutes.main}/:accountId`}>
                <>
                    <LockerAccountPage />
                    <FAQ />
                </>
            </Route>

            <Route path={`${LockerRoutes.main}/*`}>
                <NotFoundPage />
            </Route>
        </Switch>
    );
};

export default Locker;
