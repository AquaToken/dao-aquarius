import * as React from 'react';
import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import { BribesRoutes } from 'constants/routes';

import NotFoundPage from 'components/NotFoundPage';

const BribesPage = lazy(() => import('./pages/BribesPage'));
const AddBribePage = lazy(() => import('./pages/AddBribePage'));

const Bribes = () => (
    <Switch>
        <Route exact path={BribesRoutes.bribes}>
            <BribesPage />
        </Route>
        <Route path={BribesRoutes.addBribe}>
            <AddBribePage />
        </Route>
        <Route component={NotFoundPage} />
    </Switch>
);

export default Bribes;
