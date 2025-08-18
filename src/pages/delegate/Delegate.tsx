import * as React from 'react';
import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import { DelegateRoutes } from 'constants/routes';

const DelegateLazy = lazy(() => import('./pages/DelegateMain'));
const BecomeLazy = lazy(() => import('./pages/BecomeDelegate'));

const Delegate = () => (
    <Switch>
        <Route exact path={DelegateRoutes.main}>
            <DelegateLazy />
        </Route>
        <Route path={DelegateRoutes.become}>
            <BecomeLazy />
        </Route>
    </Switch>
);

export default Delegate;
