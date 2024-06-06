import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AmmRoutes } from '../../routes';
import Analytics from './pages/Analytics';
import Liquidity from './pages/Liquidity';
import PoolPage from './pages/PoolPage';
import CreatePool from './pages/CreatePool';
import BalancesBlock from './components/BalancesBlock/BalancesBlock';
import useAuthStore from '../../store/authStore/useAuthStore';

const Amm = ({ balances }) => {
    const { isLogged } = useAuthStore();
    return (
        <Switch>
            <Route exact path={AmmRoutes.analytics}>
                <Analytics />
            </Route>
            <Route exact path={`${AmmRoutes.analytics}:poolAddress`}>
                <PoolPage />
            </Route>
            <Route path={AmmRoutes.liquidity}>
                <Liquidity />
            </Route>
            <Route path={AmmRoutes.create}>
                {isLogged ? (
                    <CreatePool balances={balances} />
                ) : (
                    <Redirect to={AmmRoutes.analytics} />
                )}
            </Route>
            <Route path={AmmRoutes.balances}>
                <BalancesBlock balances={balances} />
            </Route>
            <Redirect to={AmmRoutes.analytics} />
        </Switch>
    );
};

export default Amm;
