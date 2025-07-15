import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import { MarketRoutes } from 'constants/routes';

import NotFoundPage from 'components/NotFoundPage';

const MarketPage = lazy(() => import('./pages/MarketPage'));

const Market = () => (
    <Switch>
        <Route exact path={`${MarketRoutes.main}/:base/:counter - Aquarius`}>
            <MarketPage />
        </Route>
        <Route component={NotFoundPage} />
    </Switch>
);

export default Market;
