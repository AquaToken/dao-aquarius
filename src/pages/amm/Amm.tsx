import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AmmRoutes } from '../../routes';
import Analytics from './pages/Analytics';
import PoolPage from './pages/PoolPage';
import CreatePool from './pages/CreatePool';
import useAuthStore from '../../store/authStore/useAuthStore';
const Amm = () => {
    const { isLogged } = useAuthStore();
    return (
        <Switch>
            <Route exact path={AmmRoutes.analytics}>
                <Analytics />
            </Route>
            <Route path={AmmRoutes.create}>
                {isLogged ? <CreatePool /> : <Redirect to={AmmRoutes.analytics} />}
            </Route>
            <Route exact path={`${AmmRoutes.analytics}:poolAddress`}>
                <PoolPage />
            </Route>
            <Redirect to={AmmRoutes.analytics} />
        </Switch>
    );
};

export default Amm;
