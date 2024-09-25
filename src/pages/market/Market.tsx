import * as React from 'react';
import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import NotFoundPage from '../../common/components/NotFoundPage/NotFoundPage';
import { MarketRoutes } from '../../routes';

const MarketPage = lazy(() => import('./pages/MarketPage'));

const Market = () => {
    return (
        <Switch>
            <Route exact path={`${MarketRoutes.main}/:base/:counter`}>
                <MarketPage />
            </Route>
            <Route component={NotFoundPage} />
        </Switch>
    );
};

export default Market;
