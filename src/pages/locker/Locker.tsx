import * as React from 'react';
import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';
import FAQ from './components/FAQ/FAQ';
import { LockerRoutes } from '../../routes';
import NotFoundPage from '../../common/components/NotFoundPage/NotFoundPage';

const LockerMainPage = lazy(() => import('./pages/LockerMainPage'));
const LockerAccountPage = lazy(() => import('./pages/LockerAccountPage'));

const Locker = () => {
    return (
        <Switch>
            <Route exact path={LockerRoutes.main}>
                <>
                    <LockerMainPage />
                    <FAQ />
                </>
            </Route>

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
