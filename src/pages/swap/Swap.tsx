import { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { MainRoutes } from 'constants/routes';

import { getAquaAssetData, getAssetString } from 'helpers/assets';
import { createLumen } from 'helpers/token';

const SwapPageLazy = lazy(() => import('./pages/SwapPage'));

const Swap = () => {
    const { aquaAssetString } = getAquaAssetData();

    return (
        <Switch>
            <Route exact path={`${MainRoutes.swap}/:source/:destination/`}>
                <SwapPageLazy />
            </Route>
            <Route
                component={() => (
                    <Redirect
                        to={{
                            pathname: `${MainRoutes.swap}/${getAssetString(
                                createLumen(),
                            )}/${aquaAssetString}`,
                        }}
                    />
                )}
            ></Route>
        </Switch>
    );
};

export default Swap;
