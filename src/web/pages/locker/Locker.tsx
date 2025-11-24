import * as React from 'react';
import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import { LockerRoutes } from 'constants/routes';

import NotFoundPage from 'components/NotFoundPage';

const LockerAboutPage = lazy(() => import('./pages/LockerAbout/LockerAbout'));
const LockerFormPage = lazy(() => import('./pages/LockerForm/LockerForm'));

const Locker = () => (
    <Switch>
        <Route exact path={LockerRoutes.about}>
            <LockerAboutPage />
        </Route>

        <Route exact path={LockerRoutes.main}>
            <LockerFormPage />
        </Route>

        <Route component={NotFoundPage} />
    </Switch>
);

export default Locker;
