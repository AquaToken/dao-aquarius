import * as React from 'react';
import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import { IncentivesRoutes } from 'constants/routes';

import NotFoundPage from 'components/NotFoundPage';

const IncentivesPage = lazy(() => import('./pages/IncentivesMainPage'));
const AddIncentivePage = lazy(() => import('./pages/AddIncentivePage'));

const Incentives = () => (
    <Switch>
        <Route exact path={IncentivesRoutes.main}>
            <IncentivesPage />
        </Route>
        <Route path={IncentivesRoutes.addIncentive}>
            <AddIncentivePage />
        </Route>
        <Route component={NotFoundPage} />
    </Switch>
);

export default Incentives;
