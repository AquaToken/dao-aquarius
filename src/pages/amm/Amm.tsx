import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AmmRoutes } from '../../routes';
import Analytics from './pages/Analytics';
import Liquidity from './pages/Liquidity';
import PoolPage from './pages/PoolPage';
import AmmLegacy from './AmmLegacy';
import CreatePool from './pages/CreatePool';

const Amm = ({ balances }) => {
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
                <CreatePool />
            </Route>
            <Route path={AmmRoutes.legacy}>
                <AmmLegacy balances={balances} />
            </Route>
            <Redirect to={AmmRoutes.analytics} />
        </Switch>
    );
};

export default Amm;
