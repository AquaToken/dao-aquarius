import * as React from 'react';
import { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { LockerRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import NotFoundPage from 'components/NotFoundPage';

const LockerMainPage = lazy(() => import('./pages/LockerMainPage'));
const LockerAccountPage = lazy(() => import('./pages/LockerAccountPage'));

const Locker = () => {
    const { isLogged, account } = useAuthStore();
    return (
        <Switch>
            <Route exact path={LockerRoutes.main}>
                {isLogged ? (
                    <Redirect
                        to={{
                            pathname: `${LockerRoutes.main}/${account.accountId()}`,
                        }}
                    />
                ) : (
                    <LockerMainPage />
                )}
            </Route>

            <Route exact path={`${LockerRoutes.main}/:accountId`}>
                <LockerAccountPage />
            </Route>

            <Route path={`${LockerRoutes.main}/*`}>
                <NotFoundPage />
            </Route>
        </Switch>
    );
};

export default Locker;
