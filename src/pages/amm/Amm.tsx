import * as React from 'react';
import { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { AmmRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

const AnalyticsPage = lazy(() => import('./pages/Analytics'));
const PoolPageLazy = lazy(() => import('./pages/PoolPage'));
const CreatePoolPage = lazy(() => import('./pages/CreatePool'));

const Amm = () => {
    const { isLogged } = useAuthStore();
    return (
        <Switch>
            <Route exact path={AmmRoutes.analytics}>
                <AnalyticsPage />
            </Route>
            <Route path={AmmRoutes.create}>
                {isLogged ? <CreatePoolPage /> : <Redirect to={AmmRoutes.analytics} />}
            </Route>
            <Route exact path={`${AmmRoutes.analytics}:poolAddress`}>
                <PoolPageLazy />
            </Route>
            <Redirect to={AmmRoutes.analytics} />
        </Switch>
    );
};

export default Amm;
